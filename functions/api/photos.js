import {
  checksumKey,
  imageLimits,
  json,
  listTripPhotos,
  MAX_FEATURED_PHOTOS,
  photoFromObject,
  photoPrefix,
  requirePhotoBucket,
  toCustomMetadata,
  unfeaturePhotos,
  updateFeaturedPhotos,
  validDay,
  validPhotoId,
  validTripId,
  validateImageFile,
} from "../_shared/photos";

const cleanText = (value, maxLength) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

const cleanNumber = (value, minimum, maximum) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= minimum && number <= maximum
    ? number
    : null;
};

const cleanExif = (value) => {
  try {
    const exif = JSON.parse(value);
    if (!exif || typeof exif !== "object") return null;
    const cleaned = {
      aperture: cleanNumber(exif.aperture, 0.1, 128),
      cameraMake: cleanText(exif.cameraMake, 60),
      cameraModel: cleanText(exif.cameraModel, 80),
      exposureTime: cleanNumber(exif.exposureTime, 0.000001, 3600),
      focalLength: cleanNumber(exif.focalLength, 0.1, 5000),
      iso: cleanNumber(exif.iso, 1, 10000000),
      lensModel: cleanText(exif.lensModel, 100),
      takenAt: cleanText(exif.takenAt, 40),
    };
    return Object.values(cleaned).some((item) => item !== null && item !== "")
      ? cleaned
      : null;
  } catch {
    return null;
  }
};

const extensionForType = (type) => ({
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}[type]);

const CHECKSUM_LEASE_MS = 15 * 60 * 1000;
const ADMIN_PHOTOS_PATH = "/api/admin/photos";

const requireAdminPhotosPath = (request) =>
  new URL(request.url).pathname === ADMIN_PHOTOS_PATH
    ? null
    : json({ error: "Not found" }, { status: 404 });

const parseReservation = async (object) => {
  try {
    return JSON.parse(await object.text());
  } catch {
    return null;
  }
};

const releaseChecksum = async (bucket, tripId, checksum, photoId) => {
  const key = checksumKey(tripId, checksum);
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const existing = await bucket.get(key);
    if (!existing) return;
    const current = await parseReservation(existing);
    if (current?.photoId !== photoId || current.releasedAt) return;
    const released = await bucket.put(
      key,
      JSON.stringify({
        ...current,
        releasedAt: new Date().toISOString(),
      }),
      {
        onlyIf: { etagMatches: existing.etag },
        httpMetadata: { contentType: "application/json" },
      },
    );
    if (released) return;
  }
  throw new Error("Checksum lease is busy");
};

const reserveChecksum = async (bucket, tripId, checksum, reservation) => {
  const key = checksumKey(tripId, checksum);
  const value = JSON.stringify(reservation);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const created = await bucket.put(key, value, {
      onlyIf: { etagDoesNotMatch: "*" },
      httpMetadata: { contentType: "application/json" },
    });
    if (created) return key;

    const existing = await bucket.get(key);
    if (!existing) continue;
    const current = await parseReservation(existing);

    if (validDay(current?.day) && validPhotoId(current?.photoId)) {
      const result = await bucket.list({
        prefix: `${photoPrefix(tripId, Number(current.day), current.photoId)}/`,
        limit: 3,
      });
      if (result.objects.some((object) => /\/original\.(?:jpg|png|webp)$/.test(object.key))) {
        return null;
      }
    }

    const reservedAt = Date.parse(current?.reservedAt);
    if (
      !current?.releasedAt &&
      Number.isFinite(reservedAt) &&
      Date.now() - reservedAt < CHECKSUM_LEASE_MS
    ) {
      return null;
    }

    const reclaimed = await bucket.put(key, value, {
      onlyIf: { etagMatches: existing.etag },
      httpMetadata: { contentType: "application/json" },
    });
    if (reclaimed) {
      if (validDay(current?.day) && validPhotoId(current?.photoId)) {
        const staleObjects = await bucket.list({
          prefix: `${photoPrefix(tripId, Number(current.day), current.photoId)}/`,
        });
        if (staleObjects.objects.length) {
          await bucket.delete(staleObjects.objects.map((object) => object.key));
        }
      }
      return key;
    }
  }
  return null;
};

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const tripId = url.searchParams.get("tripId");
    if (!validTripId(tripId)) {
      return json({ error: "tripId 无效" }, { status: 400 });
    }

    const photos = await listTripPhotos(requirePhotoBucket(env), tripId);
    return json({ photos }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("Failed to list photos", error);
    return json({ error: "照片列表读取失败" }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  const pathError = requireAdminPhotosPath(request);
  if (pathError) return pathError;

  let bucket;
  let writtenKeys = [];
  let markerKey;
  let reservationPhotoId;
  let reservationTripId;
  let reservedChecksum;

  try {
    bucket = requirePhotoBucket(env);
    const formData = await request.formData();
    const tripId = formData.get("tripId");
    const day = Number(formData.get("day"));
    const original = formData.get("original");
    const thumbnail = formData.get("thumbnail");
    const submittedChecksum = cleanText(formData.get("checksum"), 64);

    if (!validTripId(tripId) || !validDay(day)) {
      return json({ error: "旅程或 Day 无效" }, { status: 400 });
    }
    if (!/^[a-f0-9]{64}$/.test(submittedChecksum)) {
      return json({ error: "照片校验值无效" }, { status: 400 });
    }

    const fileError =
      validateImageFile(original, "原图", imageLimits.original) ||
      validateImageFile(thumbnail, "缩略图", imageLimits.thumbnail);
    if (fileError) return json({ error: fileError }, { status: 400 });

    const originalBuffer = await original.arrayBuffer();
    const checksumBuffer = await crypto.subtle.digest("SHA-256", originalBuffer);
    const checksum = [...new Uint8Array(checksumBuffer)]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    if (checksum !== submittedChecksum) {
      return json({ error: "原图校验失败" }, { status: 400 });
    }

    const takenAt = cleanText(formData.get("takenAt"), 40);
    const width = Number(formData.get("width")) || null;
    const height = Number(formData.get("height")) || null;
    const duplicate = (await listTripPhotos(bucket, tripId)).find(
      (photo) =>
        photo.checksum === checksum ||
        (
          !photo.checksum &&
          photo.size === original.size &&
          photo.width === width &&
          photo.height === height &&
          photo.takenAt === takenAt
        ),
    );
    if (duplicate) {
      return json({ error: "照片已存在", duplicate }, { status: 409 });
    }

    const id = crypto.randomUUID();
    reservationPhotoId = id;
    reservationTripId = tripId;
    reservedChecksum = checksum;
    const prefix = photoPrefix(tripId, day, id);
    const originalKey = `${prefix}/original.${extensionForType(original.type)}`;
    const thumbnailKey = `${prefix}/thumbnail.webp`;
    markerKey = await reserveChecksum(bucket, tripId, checksum, {
      day,
      photoId: id,
      reservedAt: new Date().toISOString(),
    });
    if (!markerKey) {
      return json({ error: "照片已存在或正在上传" }, { status: 409 });
    }
    writtenKeys = [originalKey, thumbnailKey];

    const metadata = {
      id,
      tripId,
      day,
      place: cleanText(formData.get("place"), 60),
      caption: cleanText(formData.get("caption"), 160),
      capturedDate: cleanText(formData.get("capturedDate"), 10),
      checksum,
      dateSource: ["exif", "file"].includes(formData.get("dateSource"))
        ? formData.get("dateSource")
        : "",
      exif: cleanExif(formData.get("exif")),
      takenAt,
      uploadedAt: new Date().toISOString(),
      originalName: cleanText(original.name, 100),
      size: original.size,
      width,
      height,
    };
    const customMetadata = toCustomMetadata(metadata);

    await bucket.put(thumbnailKey, thumbnail.stream(), {
      httpMetadata: {
        contentType: "image/webp",
        cacheControl: "no-store",
      },
    });
    await bucket.put(originalKey, originalBuffer, {
        httpMetadata: {
          contentType: original.type,
          cacheControl: "no-store",
        },
        customMetadata,
        sha256: checksumBuffer,
    });

    return json(
      {
        photo: {
          ...metadata,
          displayUrl: `/api/photo-file?key=${encodeURIComponent(originalKey)}`,
          thumbnailUrl: `/api/photo-file?key=${encodeURIComponent(thumbnailKey)}`,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    let cleanupSucceeded = true;
    if (bucket && writtenKeys.length) {
      try {
        await bucket.delete(writtenKeys);
      } catch (cleanupError) {
        cleanupSucceeded = false;
        console.error("Failed to clean up photo upload", cleanupError);
      }
    }
    if (cleanupSucceeded && bucket && markerKey && reservationPhotoId) {
      try {
        await releaseChecksum(
          bucket,
          reservationTripId,
          reservedChecksum,
          reservationPhotoId,
        );
      } catch (cleanupError) {
        console.error("Failed to release checksum lease", cleanupError);
      }
    }
    console.error("Failed to upload photo", error);
    return json({ error: "照片上传失败" }, { status: 500 });
  }
}

export async function onRequestPut({ request, env }) {
  const pathError = requireAdminPhotosPath(request);
  if (pathError) return pathError;

  try {
    const formData = await request.formData();
    const tripId = formData.get("tripId");
    const day = Number(formData.get("day"));
    const photoId = formData.get("photoId");
    const thumbnail = formData.get("thumbnail");
    if (!validTripId(tripId) || !validDay(day) || !validPhotoId(photoId)) {
      return json({ error: "照片标识无效" }, { status: 400 });
    }
    const fileError = validateImageFile(
      thumbnail,
      "缩略图",
      imageLimits.thumbnail,
    );
    if (fileError) return json({ error: fileError }, { status: 400 });
    if (thumbnail.type !== "image/webp") {
      return json({ error: "缩略图必须为 WebP" }, { status: 400 });
    }

    const bucket = requirePhotoBucket(env);
    const prefix = photoPrefix(tripId, day, photoId);
    const stored = await bucket.list({ prefix: `${prefix}/`, limit: 3 });
    if (
      !stored.objects.some((object) =>
        /\/original\.(?:jpg|png|webp)$/.test(object.key),
      )
    ) {
      return json({ error: "原图不存在" }, { status: 404 });
    }

    const thumbnailKey = `${prefix}/thumbnail.webp`;
    const updated = await bucket.put(thumbnailKey, thumbnail.stream(), {
      httpMetadata: {
        contentType: "image/webp",
        cacheControl: "no-store",
      },
    });
    return json({
      thumbnailUrl: [
        `/api/photo-file?key=${encodeURIComponent(thumbnailKey)}`,
        `&v=${encodeURIComponent(updated.etag)}`,
      ].join(""),
    });
  } catch (error) {
    console.error("Failed to rebuild photo thumbnail", error);
    return json({ error: "缩略图更新失败" }, { status: 500 });
  }
}

export async function onRequestDelete({ request, env }) {
  const pathError = requireAdminPhotosPath(request);
  if (pathError) return pathError;

  try {
    const payload = await request.json();
    const photos = Array.isArray(payload.photos) ? payload.photos : [payload];
    if (
      !photos.length ||
      photos.length > 100 ||
      photos.some(
        ({ tripId, day, photoId }) =>
          !validTripId(tripId) || !validDay(day) || !validPhotoId(photoId),
      )
    ) {
      return json({ error: "照片标识无效" }, { status: 400 });
    }

    const bucket = requirePhotoBucket(env);
    const results = await Promise.all(
      photos.map(({ tripId, day, photoId }) =>
        bucket.list({
          prefix: `${photoPrefix(tripId, Number(day), photoId)}/`,
          include: ["customMetadata"],
        }),
      ),
    );
    const storedPhotos = results.map((result) => {
      const original = result.objects.find((object) =>
        /\/original\.(?:jpg|png|webp)$/.test(object.key),
      );
      return original ? photoFromObject(original) : null;
    });
    const keys = results.flatMap((result) =>
      result.objects.map((object) => object.key),
    );
    if (!keys.length) {
      return json({ error: "照片不存在" }, { status: 404 });
    }

    await bucket.delete(keys);
    const checksumCleanup = await Promise.allSettled(
      storedPhotos.map((photo) =>
        photo?.checksum
          ? releaseChecksum(bucket, photo.tripId, photo.checksum, photo.id)
          : Promise.resolve(),
      ),
    );
    checksumCleanup
      .filter((result) => result.status === "rejected")
      .forEach((result) => console.error("Failed to release checksum lease", result.reason));
    const deletedPhotosByTrip = new Map();
    results.forEach((result, index) => {
      if (!result.objects.length) return;
      const photo = photos[index];
      const photoIds = deletedPhotosByTrip.get(photo.tripId) ?? [];
      photoIds.push(photo.photoId);
      deletedPhotosByTrip.set(photo.tripId, photoIds);
    });
    const featuredCleanup = await Promise.allSettled(
      [...deletedPhotosByTrip].map(([tripId, photoIds]) =>
        unfeaturePhotos(bucket, tripId, photoIds),
      ),
    );
    featuredCleanup
      .filter((result) => result.status === "rejected")
      .forEach((result) => console.error("Failed to clean featured index", result.reason));
    return json({
      deleted: results.filter((result) => result.objects.length).length,
      missing: results.filter((result) => !result.objects.length).length,
    });
  } catch (error) {
    console.error("Failed to delete photo", error);
    return json({ error: "照片删除失败" }, { status: 500 });
  }
}

export async function onRequestPatch({ request, env }) {
  const pathError = requireAdminPhotosPath(request);
  if (pathError) return pathError;

  try {
    const startedAt = Date.now();
    const payload = await request.json();
    const { tripId, featured } = payload;
    const photos = Array.isArray(payload.photos)
      ? payload.photos
      : [{ day: payload.day, photoId: payload.photoId }];
    if (
      !validTripId(tripId) ||
      typeof featured !== "boolean" ||
      !photos.length ||
      photos.length > 100 ||
      photos.some(({ day, photoId }) => !validDay(day) || !validPhotoId(photoId))
    ) {
      return json({ error: "精选参数无效" }, { status: 400 });
    }

    const bucket = requirePhotoBucket(env);
    const uniquePhotos = [
      ...new Map(photos.map((photo) => [photo.photoId, photo])).values(),
    ];
    if (featured) {
      const storedPhotos = await Promise.all(
        uniquePhotos.map(({ day, photoId }) =>
          bucket.list({
            prefix: `${photoPrefix(tripId, Number(day), photoId)}/`,
            limit: 3,
          }),
        ),
      );
      const missingPhoto = storedPhotos.some(
        (result) =>
          !result.objects.some((object) =>
            /\/original\.(?:jpg|png|webp)$/.test(object.key),
          ),
      );
      if (missingPhoto) {
        return json({ error: "部分照片不存在，请刷新相册后重试" }, { status: 404 });
      }
    }
    const validationFinishedAt = Date.now();

    const featuredIds = await updateFeaturedPhotos(
      bucket,
      tripId,
      uniquePhotos.map(({ photoId }) => photoId),
      featured,
    );
    if (!featuredIds) {
      return json(
        { error: `每段旅程最多精选 ${MAX_FEATURED_PHOTOS} 张照片` },
        { status: 409 },
      );
    }
    const featuredOrder = new Map(
      featuredIds.map((photoId, index) => [photoId, index + 1]),
    );
    const results = uniquePhotos.map(({ photoId }) => ({
      photoId,
      featured,
      featuredOrder: featuredOrder.get(photoId) ?? null,
    }));
    return json({
      featured,
      featuredOrder: results.length === 1 ? results[0].featuredOrder : undefined,
      photos: results,
    }, {
      headers: {
        "server-timing": [
          `photo-check;dur=${validationFinishedAt - startedAt}`,
          `featured-index;dur=${Date.now() - validationFinishedAt}`,
        ].join(", "),
      },
    });
  } catch (error) {
    console.error("Failed to update featured photo", error);
    return json({ error: "精选状态更新失败" }, { status: 500 });
  }
}

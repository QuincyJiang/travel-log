import {
  imageLimits,
  isAdminRequest,
  json,
  listTripPhotos,
  photoPrefix,
  requirePhotoBucket,
  toCustomMetadata,
  validDay,
  validPhotoId,
  validTripId,
  validateImageFile,
} from "../_shared/photos";

const cleanText = (value, maxLength) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

const extensionForType = (type) => ({
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}[type]);

const unauthorized = (env) =>
  json(
    {
      error: env.ADMIN_TOKEN
        ? "管理密钥无效"
        : "Cloudflare Secret ADMIN_TOKEN 尚未配置",
    },
    { status: env.ADMIN_TOKEN ? 401 : 503 },
  );

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
  if (!(await isAdminRequest(request, env))) return unauthorized(env);

  let bucket;
  let writtenKeys = [];

  try {
    bucket = requirePhotoBucket(env);
    const formData = await request.formData();
    const tripId = formData.get("tripId");
    const day = Number(formData.get("day"));
    const original = formData.get("original");
    const thumbnail = formData.get("thumbnail");

    if (!validTripId(tripId) || !validDay(day)) {
      return json({ error: "旅程或 Day 无效" }, { status: 400 });
    }

    const fileError =
      validateImageFile(original, "原图", imageLimits.original) ||
      validateImageFile(thumbnail, "缩略图", imageLimits.thumbnail);
    if (fileError) return json({ error: fileError }, { status: 400 });

    const id = crypto.randomUUID();
    const prefix = photoPrefix(tripId, day, id);
    const originalKey = `${prefix}/original.${extensionForType(original.type)}`;
    const thumbnailKey = `${prefix}/thumbnail.webp`;
    writtenKeys = [originalKey, thumbnailKey];

    const metadata = {
      id,
      tripId,
      day,
      place: cleanText(formData.get("place"), 60),
      caption: cleanText(formData.get("caption"), 160),
      takenAt: cleanText(formData.get("takenAt"), 40),
      uploadedAt: new Date().toISOString(),
      originalName: cleanText(original.name, 100),
      width: Number(formData.get("width")) || null,
      height: Number(formData.get("height")) || null,
    };
    const customMetadata = toCustomMetadata(metadata);

    await bucket.put(thumbnailKey, thumbnail.stream(), {
      httpMetadata: {
        contentType: "image/webp",
        cacheControl: "no-store",
      },
    });
    await bucket.put(originalKey, original.stream(), {
        httpMetadata: {
          contentType: original.type,
          cacheControl: "no-store",
        },
        customMetadata,
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
    if (bucket && writtenKeys.length) {
      try {
        await bucket.delete(writtenKeys);
      } catch (cleanupError) {
        console.error("Failed to clean up photo upload", cleanupError);
      }
    }
    console.error("Failed to upload photo", error);
    return json({ error: "照片上传失败" }, { status: 500 });
  }
}

export async function onRequestDelete({ request, env }) {
  if (!(await isAdminRequest(request, env))) return unauthorized(env);

  try {
    const { tripId, day, photoId } = await request.json();
    if (!validTripId(tripId) || !validDay(day) || !validPhotoId(photoId)) {
      return json({ error: "照片标识无效" }, { status: 400 });
    }

    const bucket = requirePhotoBucket(env);
    const prefix = `${photoPrefix(tripId, Number(day), photoId)}/`;
    const result = await bucket.list({ prefix });
    if (!result.objects.length) {
      return json({ error: "照片不存在" }, { status: 404 });
    }

    await bucket.delete(result.objects.map((object) => object.key));
    return json({ deleted: true });
  } catch (error) {
    console.error("Failed to delete photo", error);
    return json({ error: "照片删除失败" }, { status: 500 });
  }
}

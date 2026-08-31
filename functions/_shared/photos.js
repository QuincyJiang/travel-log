const PHOTO_PREFIX = "photos";
const FEATURED_PREFIX = "featured";
export const MAX_FEATURED_PHOTOS = 16;
const MAX_FEATURED_UPDATE_ATTEMPTS = 64;
const MAX_ORIGINAL_SIZE = 50 * 1024 * 1024;
const MAX_THUMBNAIL_SIZE = 2 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const json = (data, init = {}) => {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
};

export function requirePhotoBucket(env) {
  if (!env.TRAVEL_PHOTOS) {
    throw new Error("TRAVEL_PHOTOS R2 binding is not configured");
  }
  return env.TRAVEL_PHOTOS;
}

export const validTripId = (value) =>
  typeof value === "string" && /^[a-z0-9][a-z0-9-]{1,79}$/.test(value);

export const validPhotoId = (value) =>
  typeof value === "string" && /^[a-f0-9-]{36}$/.test(value);

export const validDay = (value) => {
  const day = Number(value);
  return Number.isInteger(day) && day >= 1 && day <= 99;
};

export function photoPrefix(tripId, day, photoId = "") {
  const daySegment = `day-${String(day).padStart(2, "0")}`;
  return `${PHOTO_PREFIX}/${tripId}/${daySegment}/${photoId}`;
}

export const checksumKey = (tripId, checksum) =>
  `photo-checksums/${tripId}/${checksum}`;

const featuredIndexKey = (tripId) =>
  `${FEATURED_PREFIX}/${tripId}/index.json`;

const parseFeaturedIds = (value) => {
  try {
    const ids = JSON.parse(value);
    return Array.isArray(ids)
      ? [...new Set(ids.filter(validPhotoId))].slice(0, MAX_FEATURED_PHOTOS)
      : [];
  } catch {
    return [];
  }
};

const readFeaturedIndex = async (bucket, tripId) => {
  const object = await bucket.get(featuredIndexKey(tripId));
  return {
    etag: object?.etag ?? null,
    ids: object ? parseFeaturedIds(await object.text()) : [],
  };
};

const writeFeaturedIndex = async (bucket, tripId, ids, etag) =>
  bucket.put(featuredIndexKey(tripId), JSON.stringify(ids), {
    onlyIf: etag
      ? { etagMatches: etag }
      : { etagDoesNotMatch: "*" },
    httpMetadata: { contentType: "application/json" },
  });

export async function listFeaturedSlots(bucket, tripId) {
  const { ids } = await readFeaturedIndex(bucket, tripId);
  return ids.map((photoId, index) => ({
    key: featuredIndexKey(tripId),
    photoId,
    slot: index + 1,
  }));
}

export async function updateFeaturedPhotos(bucket, tripId, photoIds, featured) {
  const requestedIds = [...new Set(photoIds)];
  for (let attempt = 0; attempt < MAX_FEATURED_UPDATE_ATTEMPTS; attempt += 1) {
    const { ids, etag } = await readFeaturedIndex(bucket, tripId);
    const nextIds = featured
      ? [...ids, ...requestedIds.filter((photoId) => !ids.includes(photoId))]
      : ids.filter((photoId) => !requestedIds.includes(photoId));
    if (nextIds.length > MAX_FEATURED_PHOTOS) return null;
    if (nextIds.length === ids.length && nextIds.every((id, index) => id === ids[index])) {
      return ids;
    }
    if (await writeFeaturedIndex(bucket, tripId, nextIds, etag)) {
      return nextIds;
    }
  }
  throw new Error("Featured index is busy");
}

export async function featurePhoto(bucket, tripId, photoId) {
  const ids = await updateFeaturedPhotos(bucket, tripId, [photoId], true);
  return ids ? ids.indexOf(photoId) + 1 : null;
}

export async function unfeaturePhoto(bucket, tripId, photoId) {
  return unfeaturePhotos(bucket, tripId, [photoId]);
}

export const unfeaturePhotos = (bucket, tripId, photoIds) =>
  updateFeaturedPhotos(bucket, tripId, photoIds, false);

export function validateImageFile(file, label, maxSize) {
  if (!file || typeof file.arrayBuffer !== "function") {
    return `${label}文件缺失`;
  }
  if (!IMAGE_TYPES.has(file.type)) {
    return `${label}仅支持 JPEG、PNG 或 WebP`;
  }
  if (file.size <= 0 || file.size > maxSize) {
    return `${label}大小必须在 1 B 至 ${Math.round(maxSize / 1024 / 1024)} MB 之间`;
  }
  return null;
}

export const imageLimits = {
  original: MAX_ORIGINAL_SIZE,
  thumbnail: MAX_THUMBNAIL_SIZE,
};

const encodeMetadata = (metadata) => {
  const bytes = new TextEncoder().encode(JSON.stringify(metadata));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const decodeMetadata = (encoded) => {
  if (!encoded) return null;
  try {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
};

export const toCustomMetadata = (metadata) => ({
  photo: encodeMetadata(metadata),
});

export function photoFromObject(object, thumbnailVersion = "") {
  const metadata = decodeMetadata(object.customMetadata?.photo);
  if (!metadata) return null;

  const photoUrl = `/api/photo-file?key=${encodeURIComponent(object.key)}`;
  const thumbnailKey = object.key.replace(/\/original\.(?:jpg|png|webp)$/, "/thumbnail.webp");
  return {
    id: metadata.id,
    tripId: metadata.tripId,
    day: metadata.day,
    place: metadata.place,
    caption: metadata.caption,
    capturedDate: metadata.capturedDate ?? "",
    checksum: metadata.checksum ?? "",
    dateSource: metadata.dateSource ?? "",
    exif: metadata.exif ?? null,
    takenAt: metadata.takenAt,
    uploadedAt: metadata.uploadedAt,
    width: metadata.width,
    height: metadata.height,
    size: metadata.size ?? object.size,
    displayUrl: photoUrl,
    thumbnailUrl: [
      `/api/photo-file?key=${encodeURIComponent(thumbnailKey)}`,
      thumbnailVersion ? `&v=${encodeURIComponent(thumbnailVersion)}` : "",
    ].join(""),
  };
}

export async function listTripPhotos(bucket, tripId) {
  const originalObjects = [];
  const thumbnailVersions = new Map();
  let cursor;

  do {
    const result = await bucket.list({
      prefix: `${PHOTO_PREFIX}/${tripId}/`,
      cursor,
      limit: 1000,
      include: ["customMetadata"],
    });

    for (const object of result.objects) {
      if (/\/original\.(?:jpg|png|webp)$/.test(object.key)) {
        originalObjects.push(object);
      } else if (/\/thumbnail\.webp$/.test(object.key)) {
        thumbnailVersions.set(object.key, object.etag);
      }
    }

    cursor = result.truncated ? result.cursor : undefined;
  } while (cursor);

  const photos = originalObjects
    .map((object) => {
      const thumbnailKey = object.key.replace(
        /\/original\.(?:jpg|png|webp)$/,
        "/thumbnail.webp",
      );
      return photoFromObject(object, thumbnailVersions.get(thumbnailKey));
    })
    .filter(Boolean);
  const featuredIds = (await listFeaturedSlots(bucket, tripId))
    .map(({ photoId }) => photoId);
  const featuredOrder = new Map(
    featuredIds.map((photoId, index) => [photoId, index + 1]),
  );

  return photos.map((photo) => ({
    ...photo,
    featured: featuredOrder.has(photo.id),
    featuredOrder: featuredOrder.get(photo.id) ?? null,
  })).sort((left, right) => {
    const leftDate = left.takenAt || left.uploadedAt;
    const rightDate = right.takenAt || right.uploadedAt;
    return leftDate.localeCompare(rightDate) || left.id.localeCompare(right.id);
  });
}

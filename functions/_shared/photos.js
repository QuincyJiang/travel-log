const PHOTO_PREFIX = "photos";
const MAX_ORIGINAL_SIZE = 50 * 1024 * 1024;
const MAX_THUMBNAIL_SIZE = 2 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const json = (data, init = {}) => {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
};

const digest = async (value) => {
  const bytes = new TextEncoder().encode(value);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
};

export async function isAdminRequest(request, env) {
  if (!env.ADMIN_TOKEN) return false;

  const authorization = request.headers.get("authorization") ?? "";
  const providedToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const [providedHash, expectedHash] = await Promise.all([
    digest(providedToken),
    digest(env.ADMIN_TOKEN),
  ]);

  return providedHash.every((byte, index) => byte === expectedHash[index]);
}

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

export function photoFromObject(object) {
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
    takenAt: metadata.takenAt,
    uploadedAt: metadata.uploadedAt,
    width: metadata.width,
    height: metadata.height,
    displayUrl: photoUrl,
    thumbnailUrl: `/api/photo-file?key=${encodeURIComponent(thumbnailKey)}`,
  };
}

export async function listTripPhotos(bucket, tripId) {
  const photos = [];
  let cursor;

  do {
    const result = await bucket.list({
      prefix: `${PHOTO_PREFIX}/${tripId}/`,
      cursor,
      limit: 1000,
      include: ["customMetadata"],
    });

    for (const object of result.objects) {
      if (!/\/original\.(?:jpg|png|webp)$/.test(object.key)) continue;
      const photo = photoFromObject(object);
      if (photo) photos.push(photo);
    }

    cursor = result.truncated ? result.cursor : undefined;
  } while (cursor);

  return photos.sort((left, right) => {
    const leftDate = left.takenAt || left.uploadedAt;
    const rightDate = right.takenAt || right.uploadedAt;
    return leftDate.localeCompare(rightDate) || left.id.localeCompare(right.id);
  });
}

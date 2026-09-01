const PHOTO_PREFIX = "photos";
export const MAX_FEATURED_PHOTOS = 16;
const MAX_ORIGINAL_SIZE = 50 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const LEGACY_CHECKSUM_PREFIX = "legacy:";

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

export function requireDatabase(env) {
  if (!env.DB) {
    throw new Error("DB D1 binding is not configured");
  }
  return env.DB;
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
  thumbnail: MAX_ORIGINAL_SIZE,
};

const parseExif = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export function photoFromRow(row) {
  const checksum = row.checksum.startsWith(LEGACY_CHECKSUM_PREFIX)
    ? ""
    : row.checksum;
  return {
    id: row.id,
    tripId: row.trip_id,
    day: row.day,
    place: row.place,
    caption: row.caption,
    capturedDate: row.captured_date,
    checksum,
    dateSource: row.date_source,
    exif: parseExif(row.exif_json),
    takenAt: row.taken_at,
    uploadedAt: row.uploaded_at,
    width: row.width,
    height: row.height,
    size: row.size,
    displayUrl: `/api/photo-file?key=${encodeURIComponent(row.original_key)}`,
    thumbnailUrl: [
      `/api/photo-file?key=${encodeURIComponent(row.thumbnail_key)}`,
      row.thumbnail_version
        ? `&v=${encodeURIComponent(row.thumbnail_version)}`
        : "",
    ].join(""),
    featured: row.featured_order !== null,
    featuredOrder: row.featured_order,
  };
}

export const prepareOwnedPhotoInsert = (
  db,
  photo,
  originalKey,
  thumbnailKey,
  thumbnailVersion = "",
) => db.prepare(`
  INSERT INTO photos (
    id, trip_id, day, place, caption, captured_date, checksum, date_source,
    exif_json, taken_at, uploaded_at, width, height, size, original_key,
    thumbnail_key, thumbnail_version, featured_order
  )
  SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  WHERE EXISTS (
    SELECT 1
    FROM photo_upload_leases
    WHERE trip_id = ? AND checksum = ? AND photo_id = ?
  )
  ON CONFLICT(id) DO NOTHING
`).bind(
  photo.id,
  photo.tripId,
  photo.day,
  photo.place ?? "",
  photo.caption ?? "",
  photo.capturedDate ?? "",
  photo.checksum || `${LEGACY_CHECKSUM_PREFIX}${photo.id}`,
  photo.dateSource ?? "",
  photo.exif ? JSON.stringify(photo.exif) : null,
  photo.takenAt ?? "",
  photo.uploadedAt,
  photo.width ?? null,
  photo.height ?? null,
  photo.size,
  originalKey,
  thumbnailKey,
  thumbnailVersion,
  photo.featuredOrder ?? null,
  photo.tripId,
  photo.checksum,
  photo.id,
);

export async function listTripPhotos(db, tripId) {
  const { results } = await db.prepare(`
    SELECT *
    FROM photos
    WHERE trip_id = ?
    ORDER BY COALESCE(NULLIF(taken_at, ''), uploaded_at), id
  `).bind(tripId).all();
  return results.map(photoFromRow);
}

const PHOTO_PREFIX = "photos";
const FEATURED_PREFIX = "featured";
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

export function requirePhotoDb(env) {
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

export async function listFeaturedSlots(bucket, tripId) {
  const { ids } = await readFeaturedIndex(bucket, tripId);
  return ids.map((photoId, index) => ({
    key: featuredIndexKey(tripId),
    photoId,
    slot: index + 1,
  }));
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

const keyFromPhotoUrl = (url) =>
  new URL(url, "https://travel-log.invalid").searchParams.get("key") ?? "";

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

export const preparePhotoInsert = (
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
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
);

export const savePhoto = (
  db,
  photo,
  originalKey,
  thumbnailKey,
  thumbnailVersion = "",
) => preparePhotoInsert(
  db,
  photo,
  originalKey,
  thumbnailKey,
  thumbnailVersion,
).run();

async function listR2TripPhotos(bucket, tripId) {
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

export async function ensureTripPhotosIndexed(bucket, db, tripId) {
  const marker = await db.prepare(
    "SELECT 1 FROM photo_index_state WHERE trip_id = ?",
  ).bind(tripId).first();
  if (marker) {
    await db.prepare(`
      INSERT INTO photo_featured_state (trip_id, revision)
      VALUES (?, 0)
      ON CONFLICT(trip_id) DO NOTHING
    `).bind(tripId).run();
    return;
  }

  const photos = await listR2TripPhotos(bucket, tripId);
  for (let index = 0; index < photos.length; index += 50) {
    const statements = photos.slice(index, index + 50).map((photo) => {
      const originalKey = keyFromPhotoUrl(photo.displayUrl);
      const thumbnailKey = keyFromPhotoUrl(photo.thumbnailUrl);
      const thumbnailVersion = new URL(
        photo.thumbnailUrl,
        "https://travel-log.invalid",
      ).searchParams.get("v") ?? "";
      return preparePhotoInsert(
        db,
        photo,
        originalKey,
        thumbnailKey,
        thumbnailVersion,
      );
    });
    if (statements.length) await db.batch(statements);
  }

  await db.batch([
    db.prepare(`
      INSERT INTO photo_index_state (trip_id, indexed_at)
      VALUES (?, ?)
      ON CONFLICT(trip_id) DO UPDATE SET indexed_at = excluded.indexed_at
    `).bind(tripId, new Date().toISOString()),
    db.prepare(`
      INSERT INTO photo_featured_state (trip_id, revision)
      VALUES (?, 0)
      ON CONFLICT(trip_id) DO NOTHING
    `).bind(tripId),
  ]);
}

export async function listTripPhotos(bucket, db, tripId) {
  await ensureTripPhotosIndexed(bucket, db, tripId);
  const { results } = await db.prepare(`
    SELECT *
    FROM photos
    WHERE trip_id = ?
    ORDER BY COALESCE(NULLIF(taken_at, ''), uploaded_at), id
  `).bind(tripId).all();
  return results.map(photoFromRow);
}

import exifr from "exifr/dist/full.esm.mjs";

const THUMBNAIL_MAX_EDGE = 960;
const THUMBNAIL_QUALITY = 0.78;

const normalizeExifDate = (value) => {
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== "string") return "";
  const match = value.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!match) return "";
  const [, year, month, day, hour, minute, second] = match;
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};

const localDateKey = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeExif = (rawExif) => {
  if (!rawExif) return null;
  const exif = {
    aperture: rawExif.FNumber ?? rawExif[33437] ?? null,
    cameraMake: rawExif.Make ?? "",
    cameraModel: rawExif.Model ?? "",
    exposureTime: rawExif.ExposureTime ?? rawExif[33434] ?? null,
    focalLength: rawExif.FocalLength ?? rawExif[37386] ?? null,
    iso: rawExif.ISO ?? rawExif.ISOSpeedRatings ?? rawExif[34855] ?? null,
    lensModel: rawExif.LensModel ?? rawExif[42036] ?? "",
    takenAt: normalizeExifDate(rawExif.DateTimeOriginal ?? rawExif[36867]),
  };
  return Object.values(exif).some((value) => value !== null && value !== "")
    ? exif
    : null;
};

const readAscii = (bytes, start, length) =>
  String.fromCharCode(...bytes.subarray(start, start + length));

const extractWebpExif = async (file) => {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  if (readAscii(bytes, 0, 4) !== "RIFF" || readAscii(bytes, 8, 4) !== "WEBP") {
    return null;
  }

  const view = new DataView(buffer);
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const type = readAscii(bytes, offset, 4);
    const size = view.getUint32(offset + 4, true);
    const start = offset + 8;
    const end = start + size;
    if (end > bytes.length) return null;
    if (type === "EXIF") {
      const hasExifHeader =
        size >= 6 &&
        readAscii(bytes, start, 4) === "Exif" &&
        bytes[start + 4] === 0 &&
        bytes[start + 5] === 0;
      return buffer.slice(start + (hasExifHeader ? 6 : 0), end);
    }
    offset = end + (size % 2);
  }
  return null;
};

export async function readExifMetadata(source) {
  try {
    const file =
      typeof source === "string"
        ? await fetch(source).then((response) => {
            if (!response.ok) throw new Error("照片读取失败");
            return response.blob();
          })
        : source;
    const input = file.type === "image/webp" ? await extractWebpExif(file) : file;
    return input ? normalizeExif(await exifr.parse(input)) : null;
  } catch {
    return null;
  }
}

const loadImage = async (file) => {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.src = url;

  try {
    await image.decode();
    return image;
  } catch {
    throw new Error(`无法读取${file.name ? ` ${file.name}` : "原图"}`);
  } finally {
    URL.revokeObjectURL(url);
  }
};

const calculateChecksum = async (file) => {
  const hash = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const createThumbnail = async (image) => {
  const scale = Math.min(
    1,
    THUMBNAIL_MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight),
  );
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("浏览器无法生成预览图");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("预览图生成失败"));
      },
      "image/webp",
      THUMBNAIL_QUALITY,
    );
  });
};

export const createPhotoThumbnail = async (file) =>
  createThumbnail(await loadImage(file));

export async function readPhotoDimensions(file) {
  const [image, rawExif, checksum] = await Promise.all([
    loadImage(file),
    readExifMetadata(file),
    calculateChecksum(file),
  ]);
  const thumbnail = await createThumbnail(image);
  const exifTakenAt = rawExif?.takenAt ?? "";
  const fallbackTakenAt = new Date(file.lastModified).toISOString();

  return {
    capturedDate: localDateKey(exifTakenAt || fallbackTakenAt),
    checksum,
    dateSource: exifTakenAt ? "exif" : "file",
    exif: rawExif,
    size: file.size,
    thumbnail,
    takenAt: exifTakenAt || fallbackTakenAt,
    width: image.naturalWidth,
    height: image.naturalHeight,
  };
}

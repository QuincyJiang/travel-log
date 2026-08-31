import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, ImagePlus, LoaderCircle, RefreshCw, Trash2, Upload } from "lucide-react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { trips } from "../data/trips";
import { createPhotoThumbnail, readPhotoDimensions } from "../lib/imageMetadata";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const initialTripId = () => {
  const queryTripId = new URLSearchParams(window.location.search).get("trip");
  return trips.some((trip) => trip.id === queryTripId)
    ? queryTripId
    : (trips.find((trip) => trip.status === "已归档") ?? trips[0]).id;
};

const defaultCaption = (name) => name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");

const updateItem = (items, id, values) =>
  items.map((item) => (item.id === id ? { ...item, ...values } : item));

const tripDateEntries = (trip) => {
  const match = trip.dateRange.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return [];
  const [, year, month, day] = match.map(Number);
  const start = Date.UTC(year, month - 1, day);
  return trip.days.map((tripDay, index) => {
    const date = new Date(start + index * 86400000);
    return {
      day: tripDay.day,
      date: date.toISOString().slice(0, 10),
      title: tripDay.title,
    };
  });
};

const formatDetectedDate = (value) => {
  if (!value) return "未识别日期";
  const [, month, day] = value.split("-");
  return `${Number(month)}/${Number(day)}`;
};

const legacyPhotoFingerprint = (photo) =>
  ["legacy", photo.size, photo.width, photo.height, photo.takenAt].join(":");

export default function PhotoManagerPage() {
  const [tripId, setTripId] = useState(initialTripId);
  const trip = useMemo(() => trips.find((item) => item.id === tripId), [tripId]);
  const [place, setPlace] = useState("");
  const [items, setItems] = useState([]);
  const itemsRef = useRef(items);
  const tripIdRef = useRef(tripId);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [rebuildProgress, setRebuildProgress] = useState(null);
  const dates = useMemo(() => tripDateEntries(trip), [trip]);
  const dayByDate = useMemo(
    () => new Map(dates.map((entry) => [entry.date, entry.day])),
    [dates],
  );
  const processingCount = items.filter((item) => item.status === "reading").length;
  const unresolvedCount = items.filter(
    (item) => item.metadata && !item.day && !["done", "duplicate"].includes(item.status),
  ).length;
  const uploadableItems = items.filter(
    (item) => item.metadata && item.day && ["ready", "error"].includes(item.status),
  );
  const allUploaded =
    items.length > 0 && items.every((item) => ["done", "duplicate"].includes(item.status));

  const refreshPhotos = async (activeTripId = trip.id, signal) => {
    const response = await fetch(`/api/photos?tripId=${encodeURIComponent(activeTripId)}`, {
      cache: "no-store",
      signal,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "相册读取失败");
    if (!signal?.aborted && tripIdRef.current === activeTripId) {
      setExistingPhotos(data.photos);
    }
  };

  useEffect(() => {
    tripIdRef.current = trip.id;
    const controller = new AbortController();
    setPlace("");
    setItems((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
    setExistingPhotos([]);
    refreshPhotos(trip.id, controller.signal).catch((error) => {
      if (error.name !== "AbortError") setMessage(error.message);
    });
    return () => controller.abort();
  }, [trip]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(
    () => () => itemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl)),
    [],
  );

  const selectFiles = async (fileList) => {
    const selected = [...fileList];
    const rejected = selected.filter(
      (file) => !ALLOWED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE,
    );
    const accepted = selected.filter(
      (file) => ALLOWED_TYPES.has(file.type) && file.size <= MAX_FILE_SIZE,
    );

    const newItems = accepted.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        caption: defaultCaption(file.name).slice(0, 160),
        day: null,
        metadata: null,
        status: "reading",
        error: "",
      }));
    setItems((current) => [...current, ...newItems]);
    setMessage(accepted.length ? `正在识别 ${accepted.length} 张照片的拍摄日期…` : "");

    const parsedResults = new Array(newItems.length);
    let nextIndex = 0;
    const parseNext = async () => {
      while (nextIndex < newItems.length) {
        const index = nextIndex;
        nextIndex += 1;
        const item = newItems[index];
        try {
          const metadata = await readPhotoDimensions(item.file);
          const inferredDay = dayByDate.get(metadata.capturedDate) ?? null;
          parsedResults[index] = {
            id: item.id,
            day: inferredDay,
            metadata,
            status: "ready",
            error: "",
          };
        } catch (error) {
          parsedResults[index] = {
            id: item.id,
            day: null,
            metadata: null,
            status: "error",
            error: error.message,
          };
        }
      }
    };
    await Promise.all(
      Array.from(
        { length: Math.min(2, newItems.length) },
        () => parseNext(),
      ),
    );

    const knownChecksums = new Set([
      ...existingPhotos.map((photo) => photo.checksum).filter(Boolean),
      ...itemsRef.current
        .filter((item) => !newItems.some((newItem) => newItem.id === item.id))
        .map((item) => item.metadata?.checksum)
        .filter(Boolean),
    ]);
    const legacyFingerprints = new Set(
      existingPhotos
        .filter((photo) => !photo.checksum)
        .map(legacyPhotoFingerprint),
    );
    const results = parsedResults.map((result) => {
      if (!result.metadata) return result;
      if (
        knownChecksums.has(result.metadata.checksum) ||
        legacyFingerprints.has(legacyPhotoFingerprint(result.metadata))
      ) {
        return { ...result, status: "duplicate", error: "已存在，已跳过" };
      }
      knownChecksums.add(result.metadata.checksum);
      return result;
    });
    const resultById = new Map(results.map((result) => [result.id, result]));
    setItems((current) =>
      current.map((item) => {
        const result = resultById.get(item.id);
        return result ? { ...item, ...result } : item;
      }),
    );

    const detected = results.filter(
      (item) => item.day && item.status !== "duplicate",
    ).length;
    const duplicates = results.filter((item) => item.status === "duplicate").length;
    const unresolved = results.filter(
      (item) => item.metadata && !item.day && item.status !== "duplicate",
    ).length;
    const failed = results.filter((item) => !item.metadata).length;
    const parts = [`自动归类 ${detected} 张`];
    if (duplicates) parts.push(`跳过重复 ${duplicates} 张`);
    if (unresolved) parts.push(`${unresolved} 张待选择 Day`);
    if (failed) parts.push(`${failed} 张读取失败`);
    if (rejected.length) parts.push(`忽略 ${rejected.length} 张不支持的文件`);
    setMessage(`${parts.join("，")}。`);
  };

  const removeItem = (id) => {
    setItems((current) => {
      const item = current.find((candidate) => candidate.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return current.filter((candidate) => candidate.id !== id);
    });
  };

  const continueUploading = () => {
    items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setItems([]);
    setPlace("");
    setMessage("可以继续选择当前旅程的照片。");
    document.querySelector(".upload-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const uploadItem = async (item) => {
    const metadata = item.metadata;
    const formData = new FormData();
    formData.append("tripId", trip.id);
    formData.append("day", String(item.day));
    formData.append("place", place);
    formData.append("caption", item.caption);
    formData.append("takenAt", metadata.takenAt);
    formData.append("capturedDate", metadata.capturedDate);
    formData.append("checksum", metadata.checksum);
    formData.append("dateSource", metadata.dateSource);
    formData.append("exif", JSON.stringify(metadata.exif));
    formData.append("width", String(metadata.width));
    formData.append("height", String(metadata.height));
    formData.append("original", item.file, item.file.name);
    formData.append("thumbnail", metadata.thumbnail, "thumbnail.webp");

    setItems((current) => updateItem(current, item.id, { status: "uploading" }));
    const response = await fetch("/api/admin/photos", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (response.status === 409 && data.duplicate) {
      setItems((current) =>
        updateItem(current, item.id, {
          status: "duplicate",
          error: "已存在，已跳过",
        }),
      );
      return "duplicate";
    }
    if (!response.ok) throw new Error(data.error || "上传失败");
    setItems((current) => updateItem(current, item.id, { status: "done" }));
    return "done";
  };

  const uploadAll = async (event) => {
    event.preventDefault();
    if (processingCount) {
      setMessage("照片日期仍在识别中，请稍候。");
      return;
    }
    if (unresolvedCount) {
      setMessage(`还有 ${unresolvedCount} 张照片需要选择 Day。`);
      return;
    }
    const pending = uploadableItems;
    if (!pending.length) {
      setMessage("请先选择照片。");
      return;
    }

    setUploading(true);
    setMessage("");
    let failures = 0;
    let duplicates = 0;

    for (let index = 0; index < pending.length; index += 2) {
      const batch = pending.slice(index, index + 2);
      await Promise.all(
        batch.map(async (item) => {
          try {
            if ((await uploadItem(item)) === "duplicate") duplicates += 1;
          } catch (error) {
            failures += 1;
            setItems((current) =>
              updateItem(current, item.id, { status: "error", error: error.message }),
            );
          }
        }),
      );
    }

    setUploading(false);
    if (pending.length > failures) {
      await refreshPhotos().catch((error) => setMessage(error.message));
    }
    setMessage(
      failures
        ? `${pending.length - failures - duplicates} 张上传成功，跳过 ${duplicates} 张重复，${failures} 张失败。`
        : duplicates
          ? `${pending.length - duplicates} 张上传成功，跳过 ${duplicates} 张重复。`
          : `${pending.length} 张照片已上传。`,
    );
  };

  const deletePhoto = async (photo) => {
    if (!window.confirm(`确认删除 Day ${photo.day} 的这张照片？此操作不可恢复。`)) return;

    setDeletingId(photo.id);
    setMessage("");
    try {
      const response = await fetch("/api/admin/photos", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          tripId: photo.tripId,
          day: photo.day,
          photoId: photo.id,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "删除失败");
      setExistingPhotos((current) => current.filter((item) => item.id !== photo.id));
      setMessage("照片已删除。");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setDeletingId("");
    }
  };

  const rebuildThumbnails = async () => {
    if (
      !window.confirm(
        `将读取 ${existingPhotos.length} 张原图并重新生成高清缩略图，确认继续？`,
      )
    ) {
      return;
    }

    const photos = [...existingPhotos];
    let nextIndex = 0;
    let completed = 0;
    let failed = 0;
    setMessage("");
    setRebuildProgress({ completed: 0, total: photos.length });

    const rebuildNext = async () => {
      while (nextIndex < photos.length) {
        const photo = photos[nextIndex];
        nextIndex += 1;
        try {
          const originalResponse = await fetch(photo.displayUrl, {
            cache: "no-store",
          });
          if (!originalResponse.ok) throw new Error("原图读取失败");
          const thumbnail = await createPhotoThumbnail(
            await originalResponse.blob(),
          );
          const formData = new FormData();
          formData.append("tripId", photo.tripId);
          formData.append("day", String(photo.day));
          formData.append("photoId", photo.id);
          formData.append("thumbnail", thumbnail, "thumbnail.webp");
          const response = await fetch("/api/admin/photos", {
            method: "PUT",
            body: formData,
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "缩略图更新失败");
        } catch (error) {
          failed += 1;
          console.error(`Failed to rebuild thumbnail for ${photo.id}`, error);
        } finally {
          completed += 1;
          setRebuildProgress({ completed, total: photos.length });
        }
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(2, photos.length) }, () => rebuildNext()),
    );
    let refreshError = "";
    await refreshPhotos().catch((error) => {
      refreshError = error.message;
    });
    setRebuildProgress(null);
    setMessage(
      refreshError ||
      (failed
        ? `${photos.length - failed} 张缩略图已更新，${failed} 张失败。`
        : `${photos.length} 张高清缩略图已更新。`),
    );
  };

  return (
    <div className="page-shell photo-manager-page">
      <SiteHeader />
      <main>
        <section className="manager-hero">
          <div>
            <span className="eyebrow">PRIVATE PHOTO MANAGER</span>
            <h1>批量上传</h1>
            <p>按拍摄日期自动归类 Day，再批量整理地点与说明。</p>
          </div>
          <a className="text-link" href={`/photos/${trip.id}`}>查看相册 →</a>
        </section>

        <form className="upload-panel" onSubmit={uploadAll}>
          <div className="upload-fields">
            <label>
              <span>旅程</span>
              <select disabled={uploading || !!rebuildProgress || processingCount > 0} value={tripId} onChange={(event) => setTripId(event.target.value)}>
                {trips.map((item) => <option key={item.id} value={item.id}>{item.shortTitle}</option>)}
              </select>
            </label>
            <label>
              <span>地点</span>
              <input disabled={uploading || !!rebuildProgress} value={place} onChange={(event) => setPlace(event.target.value)} maxLength={60} placeholder="例如：哈拉湖" />
            </label>
          </div>

          <label className="photo-picker">
            <ImagePlus size={30} strokeWidth={1.5} />
            <strong>选择照片</strong>
            <span>支持多选 JPEG、PNG、WebP，单张不超过 50 MB</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={!!rebuildProgress}
              multiple
              onChange={(event) => {
                selectFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>

          {!!items.length && (
            <div className="upload-preview-grid">
              {items.map((item) => (
                <article key={item.id} className={`upload-preview ${item.status}`}>
                  <div>
                    <img src={item.previewUrl} alt="" />
                    <span>
                      {item.status === "done" && <Check size={18} />}
                      {(item.status === "reading" || item.status === "uploading") && <LoaderCircle className="spin" size={18} />}
                      {item.status === "duplicate" && "已存在"}
                      {item.status === "error" && "失败"}
                    </span>
                  </div>
                  <div className="upload-preview-fields">
                    <input
                      value={item.caption}
                      disabled={uploading || ["done", "duplicate"].includes(item.status)}
                      onChange={(event) =>
                        setItems((current) => updateItem(current, item.id, { caption: event.target.value }))
                      }
                      maxLength={160}
                      aria-label={`${item.file.name}说明`}
                    />
                    <label>
                      <span>
                        {item.metadata
                          ? `${item.metadata.dateSource === "exif" ? "EXIF" : "文件时间"} · ${formatDetectedDate(item.metadata.capturedDate)}`
                          : "正在识别日期"}
                      </span>
                      <select
                        className={item.day ? "" : "unresolved"}
                        value={item.day ?? ""}
                        disabled={uploading || ["done", "duplicate"].includes(item.status) || !item.metadata}
                        onChange={(event) =>
                          setItems((current) =>
                            updateItem(current, item.id, {
                              day: event.target.value ? Number(event.target.value) : null,
                              error: "",
                            }),
                          )
                        }
                        aria-label={`${item.file.name}所属 Day`}
                      >
                        <option value="">选择 Day</option>
                        {dates.map((entry) => (
                          <option key={entry.day} value={entry.day}>
                            Day {entry.day} · {entry.date.slice(5).replace("-", "/")}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {item.error && <small>{item.error}</small>}
                  <button disabled={uploading} type="button" onClick={() => removeItem(item.id)} aria-label={`移除 ${item.file.name}`}>
                    <Trash2 size={15} />
                  </button>
                </article>
              ))}
            </div>
          )}

          <div className="upload-submit">
            <p aria-live="polite">{message}</p>
            {allUploaded ? (
              <button type="button" disabled={!!rebuildProgress} onClick={continueUploading}>
                继续上传
                <ArrowRight size={17} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={uploading || !!rebuildProgress || processingCount > 0 || unresolvedCount > 0 || uploadableItems.length === 0}
              >
                {uploading ? <LoaderCircle className="spin" size={17} /> : <Upload size={17} />}
                {uploading
                  ? "正在上传"
                  : processingCount
                    ? `识别中 ${processingCount} 张`
                    : unresolvedCount
                      ? `${unresolvedCount} 张待选 Day`
                      : uploadableItems.length
                        ? `上传 ${uploadableItems.length} 张`
                        : "请先选择照片"}
              </button>
            )}
          </div>
        </form>

        <section className="managed-photos" aria-labelledby="managed-photos-title">
          <div className="section-heading compact">
            <div>
              <span className="section-index">PHOTO LIBRARY</span>
              <h2 id="managed-photos-title">已上传照片</h2>
            </div>
            <div className="managed-photo-actions">
              <p>{existingPhotos.length} 张 · {trip.shortTitle}</p>
              {!!existingPhotos.length && (
                <button
                  type="button"
                  disabled={!!rebuildProgress || uploading}
                  onClick={rebuildThumbnails}
                >
                  {rebuildProgress ? (
                    <LoaderCircle className="spin" size={15} />
                  ) : (
                    <RefreshCw size={15} />
                  )}
                  {rebuildProgress
                    ? `重建中 ${rebuildProgress.completed}/${rebuildProgress.total}`
                    : "重建高清缩略图"}
                </button>
              )}
            </div>
          </div>
          {!existingPhotos.length ? (
            <div className="managed-photos-empty">当前旅程还没有已上传照片。</div>
          ) : (
            <div className="managed-photo-grid">
              {existingPhotos.map((photo) => (
                <article key={photo.id}>
                  <img src={photo.thumbnailUrl} alt={photo.caption || photo.place || `Day ${photo.day}`} loading="lazy" />
                  <div>
                    <span>Day {photo.day}{photo.place ? ` · ${photo.place}` : ""}</span>
                    <p>{photo.caption || "旅行照片"}</p>
                  </div>
                  <button
                    type="button"
                    disabled={deletingId === photo.id || !!rebuildProgress}
                    onClick={() => deletePhoto(photo)}
                    aria-label={`删除 ${photo.caption || "旅行照片"}`}
                  >
                    {deletingId === photo.id ? <LoaderCircle className="spin" size={16} /> : <Trash2 size={16} />}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

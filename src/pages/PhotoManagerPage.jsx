import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { Check, ImagePlus, LoaderCircle, Trash2, Upload } from "lucide-react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { trips } from "../data/trips";
import { readPhotoDimensions } from "../lib/imageMetadata";

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

export default function PhotoManagerPage() {
  const [tripId, setTripId] = useState(initialTripId);
  const trip = useMemo(() => trips.find((item) => item.id === tripId), [tripId]);
  const [day, setDay] = useState(trip.days[0].day);
  const [place, setPlace] = useState("");
  const [token, setToken] = useState(() => sessionStorage.getItem("travel-photo-admin-token") ?? "");
  const [items, setItems] = useState([]);
  const itemsRef = useRef(items);
  const tripIdRef = useRef(tripId);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

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
    setDay(trip.days[0].day);
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

  const selectFiles = (fileList) => {
    const selected = [...fileList];
    const rejected = selected.filter(
      (file) => !ALLOWED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE,
    );
    const accepted = selected.filter(
      (file) => ALLOWED_TYPES.has(file.type) && file.size <= MAX_FILE_SIZE,
    );

    setItems((current) => [
      ...current,
      ...accepted.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        caption: defaultCaption(file.name).slice(0, 160),
        status: "ready",
        error: "",
      })),
    ]);
    setMessage(
      rejected.length
        ? `已忽略 ${rejected.length} 个不支持或超过 50 MB 的文件。`
        : "",
    );
  };

  const removeItem = (id) => {
    setItems((current) => {
      const item = current.find((candidate) => candidate.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return current.filter((candidate) => candidate.id !== id);
    });
  };

  const uploadItem = async (item) => {
    setItems((current) => updateItem(current, item.id, { status: "processing", error: "" }));
    const dimensions = await readPhotoDimensions(item.file);
    const formData = new FormData();
    formData.append("tripId", trip.id);
    formData.append("day", String(day));
    formData.append("place", place);
    formData.append("caption", item.caption);
    formData.append("takenAt", new Date(item.file.lastModified).toISOString());
    formData.append("width", String(dimensions.width));
    formData.append("height", String(dimensions.height));
    formData.append("original", item.file, item.file.name);
    formData.append("thumbnail", dimensions.thumbnail, "thumbnail.webp");

    setItems((current) => updateItem(current, item.id, { status: "uploading" }));
    const response = await fetch("/api/photos", {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "上传失败");
    setItems((current) => updateItem(current, item.id, { status: "done" }));
  };

  const uploadAll = async (event) => {
    event.preventDefault();
    const pending = items.filter((item) => item.status !== "done");
    if (!token.trim()) {
      setMessage("请输入 Cloudflare 中配置的管理密钥。");
      return;
    }
    if (!pending.length) {
      setMessage("请先选择照片。");
      return;
    }

    sessionStorage.setItem("travel-photo-admin-token", token);
    setUploading(true);
    setMessage("");
    let failures = 0;

    for (let index = 0; index < pending.length; index += 2) {
      const batch = pending.slice(index, index + 2);
      await Promise.all(
        batch.map(async (item) => {
          try {
            await uploadItem(item);
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
        ? `${pending.length - failures} 张上传成功，${failures} 张失败。`
        : `${pending.length} 张照片已上传。`,
    );
  };

  const deletePhoto = async (photo) => {
    if (!token.trim()) {
      setMessage("请输入 Cloudflare 中配置的管理密钥。");
      return;
    }
    if (!window.confirm(`确认删除 Day ${photo.day} 的这张照片？原图也会一并删除。`)) return;

    sessionStorage.setItem("travel-photo-admin-token", token);
    setDeletingId(photo.id);
    setMessage("");
    try {
      const response = await fetch("/api/photos", {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
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

  return (
    <div className="page-shell photo-manager-page">
      <SiteHeader />
      <main>
        <section className="manager-hero">
          <div>
            <span className="eyebrow">PRIVATE PHOTO MANAGER</span>
            <h1>批量上传</h1>
            <p>R2 保存未压缩原图；相册网格使用浏览器生成的小预览图，点开后加载原图。</p>
          </div>
          <Link className="text-link" href={`/trips/${trip.id}/photos`}>查看相册 →</Link>
        </section>

        <form className="upload-panel" onSubmit={uploadAll}>
          <div className="upload-fields">
            <label>
              <span>旅程</span>
              <select disabled={uploading} value={tripId} onChange={(event) => setTripId(event.target.value)}>
                {trips.map((item) => <option key={item.id} value={item.id}>{item.shortTitle}</option>)}
              </select>
            </label>
            <label>
              <span>Day</span>
              <select disabled={uploading} value={day} onChange={(event) => setDay(Number(event.target.value))}>
                {trip.days.map((item) => (
                  <option key={item.day} value={item.day}>Day {item.day} · {item.title}</option>
                ))}
              </select>
            </label>
            <label>
              <span>地点</span>
              <input disabled={uploading} value={place} onChange={(event) => setPlace(event.target.value)} maxLength={60} placeholder="例如：哈拉湖" />
            </label>
            <label>
              <span>管理密钥</span>
              <input value={token} onChange={(event) => setToken(event.target.value)} type="password" autoComplete="current-password" placeholder="ADMIN_TOKEN" />
            </label>
          </div>

          <label className="photo-picker">
            <ImagePlus size={30} strokeWidth={1.5} />
            <strong>选择照片</strong>
            <span>支持多选 JPEG、PNG、WebP，原图不压缩，单张不超过 50 MB</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
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
                      {(item.status === "processing" || item.status === "uploading") && <LoaderCircle className="spin" size={18} />}
                      {item.status === "error" && "失败"}
                    </span>
                  </div>
                  <input
                    value={item.caption}
                    disabled={uploading || item.status === "done"}
                    onChange={(event) =>
                      setItems((current) => updateItem(current, item.id, { caption: event.target.value }))
                    }
                    maxLength={160}
                    aria-label={`${item.file.name}说明`}
                  />
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
            <button type="submit" disabled={uploading || !items.length}>
              {uploading ? <LoaderCircle className="spin" size={17} /> : <Upload size={17} />}
              {uploading ? "正在上传" : `上传 ${items.filter((item) => item.status !== "done").length} 张`}
            </button>
          </div>
        </form>

        <section className="managed-photos" aria-labelledby="managed-photos-title">
          <div className="section-heading compact">
            <div>
              <span className="section-index">R2 LIBRARY</span>
              <h2 id="managed-photos-title">已上传照片</h2>
            </div>
            <p>{existingPhotos.length} 张 · {trip.shortTitle}</p>
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
                    disabled={deletingId === photo.id}
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

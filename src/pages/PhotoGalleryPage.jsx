import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { Check, Download, Camera, ChevronLeft, ChevronRight, Images, LoaderCircle, Trash2, Upload, X } from "lucide-react";
import { downloadZip } from "client-zip";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import TripViewNav from "../components/TripViewNav";
import { getTrip } from "../data/trips";
import { readExifMetadata } from "../lib/imageMetadata";
import NotFoundPage from "./NotFoundPage";

const loadPhotos = async (tripId, signal) => {
  const response = await fetch(`/api/photos?tripId=${encodeURIComponent(tripId)}`, {
    cache: "no-store",
    signal,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "相册读取失败");
  return data.photos;
};

const preloadedOriginals = new Map();

const preloadOriginal = (url) => {
  if (!preloadedOriginals.has(url)) {
    const promise = new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(url);
        image.onerror = reject;
        image.src = url;
      }).catch((error) => {
        preloadedOriginals.delete(url);
        throw error;
      });
    preloadedOriginals.set(url, promise);
  }
  return preloadedOriginals.get(url);
};

const formatExposure = (seconds) => {
  if (!seconds) return "";
  if (seconds >= 1) return `${Number(seconds.toFixed(1))}s`;
  return `1/${Math.round(1 / seconds)}s`;
};

const formatTakenAt = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getPhotoDetails = (photo) => {
  const exif = photo.exif ?? {};
  const make = exif.cameraMake ?? "";
  const model = exif.cameraModel ?? "";
  const camera = model
    ? (make && !model.toLowerCase().includes(make.toLowerCase()) ? `${make} ${model}` : model)
    : make;
  return [
    ["拍摄时间", formatTakenAt(exif.takenAt)],
    ["相机", camera],
    ["镜头", exif.lensModel],
    ["焦距", exif.focalLength ? `${Number(exif.focalLength.toFixed(1))} mm` : ""],
    ["光圈", exif.aperture ? `f/${Number(exif.aperture.toFixed(1))}` : ""],
    ["快门", formatExposure(exif.exposureTime)],
    ["感光度", exif.iso ? `ISO ${Math.round(exif.iso)}` : ""],
    ["尺寸", photo.width && photo.height ? `${photo.width} × ${photo.height}` : ""],
  ].filter(([, value]) => value);
};

const photoExtension = (photo) => {
  const key = new URL(photo.displayUrl, window.location.origin).searchParams.get("key") ?? "";
  return key.match(/\.([a-z0-9]+)$/i)?.[1] ?? "jpg";
};

const safeFilename = (value) =>
  value
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 70);

const MAX_BLOB_ZIP_SIZE = 250 * 1024 * 1024;

export default function PhotoGalleryPage() {
  const { tripId } = useParams();
  const trip = getTrip(tripId);
  const [photos, setPhotos] = useState([]);
  const [dayFilter, setDayFilter] = useState("all");
  const [placeFilter, setPlaceFilter] = useState("all");
  const [activeIndex, setActiveIndex] = useState(null);
  const [loadedOriginals, setLoadedOriginals] = useState(() => new Set());
  const [parsedExif, setParsedExif] = useState({});
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  const [state, setState] = useState({ loading: true, error: "" });
  const longPressTimer = useRef(null);
  const pointerStart = useRef(null);
  const ignoreClickId = useRef("");

  useEffect(() => {
    if (!trip) return undefined;
    const controller = new AbortController();
    setState({ loading: true, error: "" });
    loadPhotos(trip.id, controller.signal)
      .then((items) => {
        setPhotos(items);
        setState({ loading: false, error: "" });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setState({ loading: false, error: error.message });
        }
      });
    return () => controller.abort();
  }, [trip]);

  const places = useMemo(
    () => [...new Set(photos.map((photo) => photo.place).filter(Boolean))].sort(),
    [photos],
  );
  const filteredPhotos = useMemo(
    () =>
      photos.filter(
        (photo) =>
          (dayFilter === "all" || photo.day === Number(dayFilter)) &&
          (placeFilter === "all" || photo.place === placeFilter),
      ),
    [dayFilter, photos, placeFilter],
  );
  const activePhoto = activeIndex === null ? null : filteredPhotos[activeIndex];
  const activeExif = activePhoto?.exif ?? parsedExif[activePhoto?.id];
  const photoDetails = activePhoto ? getPhotoDetails({ ...activePhoto, exif: activeExif }) : [];
  const selectedPhotos = photos.filter((photo) => selectedIds.has(photo.id));
  const allFilteredSelected =
    filteredPhotos.length > 0 && filteredPhotos.every((photo) => selectedIds.has(photo.id));

  const markOriginalLoaded = useCallback((url) => {
    setLoadedOriginals((current) => {
      if (current.has(url)) return current;
      const next = new Set(current);
      next.add(url);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!activePhoto) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") {
        setActiveIndex((index) => (index - 1 + filteredPhotos.length) % filteredPhotos.length);
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((index) => (index + 1) % filteredPhotos.length);
      }
    };
    document.body.classList.add("lightbox-open");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("lightbox-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activePhoto, filteredPhotos.length]);

  useEffect(() => {
    setActiveIndex(null);
    setSelectedIds(new Set());
    setBulkMessage("");
  }, [dayFilter, placeFilter]);

  useEffect(() => {
    if (activeIndex === null || !filteredPhotos.length) return undefined;
    let cancelled = false;
    const indexes = [
      activeIndex,
      (activeIndex - 1 + filteredPhotos.length) % filteredPhotos.length,
      (activeIndex + 1) % filteredPhotos.length,
    ];
    indexes.forEach((index) => {
      const url = filteredPhotos[index].displayUrl;
      preloadOriginal(url)
        .then(() => {
          if (!cancelled) markOriginalLoaded(url);
        })
        .catch(() => {});
    });
    return () => {
      cancelled = true;
    };
  }, [activeIndex, filteredPhotos, markOriginalLoaded]);

  useEffect(() => {
    if (!activePhoto || activePhoto.exif || Object.hasOwn(parsedExif, activePhoto.id)) return;
    let cancelled = false;
    preloadOriginal(activePhoto.displayUrl)
      .then(() => readExifMetadata(activePhoto.displayUrl))
      .then((exif) => {
        if (!cancelled) {
          setParsedExif((current) => ({ ...current, [activePhoto.id]: exif }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setParsedExif((current) => ({ ...current, [activePhoto.id]: null }));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activePhoto, parsedExif]);

  if (!trip) return <NotFoundPage />;

  const stepPhoto = (direction) => {
    setActiveIndex((index) => (index + direction + filteredPhotos.length) % filteredPhotos.length);
  };

  const toggleSelection = (photoId) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(photoId)) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
    setBulkMessage("");
  };

  const openOrSelectPhoto = (photo, index) => {
    if (ignoreClickId.current === photo.id) {
      ignoreClickId.current = "";
      return;
    }
    if (selectedIds.size) toggleSelection(photo.id);
    else setActiveIndex(index);
  };

  const startLongPress = (event, photoId) => {
    if (event.pointerType === "mouse") return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
    clearTimeout(longPressTimer.current);
    longPressTimer.current = window.setTimeout(() => {
      ignoreClickId.current = photoId;
      toggleSelection(photoId);
      navigator.vibrate?.(25);
    }, 500);
  };

  const cancelLongPress = () => {
    clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
    pointerStart.current = null;
  };

  const moveLongPress = (event) => {
    if (!pointerStart.current) return;
    const distance = Math.hypot(
      event.clientX - pointerStart.current.x,
      event.clientY - pointerStart.current.y,
    );
    if (distance > 10) cancelLongPress();
  };

  const toggleSelectAll = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allFilteredSelected) filteredPhotos.forEach((photo) => next.delete(photo.id));
      else filteredPhotos.forEach((photo) => next.add(photo.id));
      return next;
    });
    setBulkMessage("");
  };

  const downloadSelected = async () => {
    setBulkAction("download");
    setBulkMessage("");
    let writable;
    try {
      if ("showSaveFilePicker" in window) {
        const handle = await window.showSaveFilePicker({
          suggestedName: `${trip.id}-photos.zip`,
          types: [{ description: "ZIP archive", accept: { "application/zip": [".zip"] } }],
        });
        writable = await handle.createWritable();
      } else {
        const totalSize = selectedPhotos.reduce((sum, photo) => sum + (photo.size || 0), 0);
        if (totalSize > MAX_BLOB_ZIP_SIZE) {
          throw new Error("当前浏览器单次打包上限为 250 MB，请减少选择或使用 Chrome / Edge。");
        }
      }

      async function* photoFiles() {
        for (const [index, photo] of selectedPhotos.entries()) {
          const response = await fetch(photo.displayUrl);
          if (!response.ok) throw new Error(`Day ${photo.day} 照片下载失败`);
          const label = safeFilename(photo.caption || photo.place || "photo");
          yield {
            name: `day-${String(photo.day).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}-${label}.${photoExtension(photo)}`,
            lastModified: new Date(photo.takenAt || photo.uploadedAt),
            input: response,
          };
        }
      }

      const zip = downloadZip(photoFiles());
      if (writable) {
        await zip.body.pipeTo(writable);
      } else {
        const blob = await zip.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${trip.id}-photos.zip`;
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }
      setBulkMessage(`已打包 ${selectedPhotos.length} 张原图。`);
    } catch (error) {
      if (writable) await writable.abort().catch(() => {});
      if (error.name !== "AbortError") setBulkMessage(error.message || "下载失败");
    } finally {
      setBulkAction("");
    }
  };

  const deleteSelected = async () => {
    if (!window.confirm(`确认删除选中的 ${selectedPhotos.length} 张照片？此操作不可恢复。`)) return;
    setBulkAction("delete");
    setBulkMessage("");
    const deletedIds = new Set();
    try {
      for (let index = 0; index < selectedPhotos.length; index += 100) {
        const batch = selectedPhotos.slice(index, index + 100);
        const response = await fetch("/api/photos", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            photos: batch.map((photo) => ({
              tripId: photo.tripId,
              day: photo.day,
              photoId: photo.id,
            })),
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "删除失败");
        batch.forEach((photo) => deletedIds.add(photo.id));
      }
      setPhotos((current) => current.filter((photo) => !deletedIds.has(photo.id)));
      setSelectedIds(new Set());
      setBulkMessage(`已删除 ${deletedIds.size} 张照片。`);
    } catch (error) {
      if (deletedIds.size) {
        setPhotos((current) => current.filter((photo) => !deletedIds.has(photo.id)));
        setSelectedIds((current) => {
          const next = new Set(current);
          deletedIds.forEach((id) => next.delete(id));
          return next;
        });
      }
      setBulkMessage(
        deletedIds.size
          ? `已删除 ${deletedIds.size} 张，其余删除失败：${error.message}`
          : (error.message || "删除失败"),
      );
    } finally {
      setBulkAction("");
    }
  };

  return (
    <div className="page-shell photo-page">
      <SiteHeader trip={trip} />
      <main>
        <TripViewNav trip={trip} />

        <section className="photo-hero">
          <div>
            <span className="eyebrow">PHOTO ARCHIVE</span>
            <h1>影像相册</h1>
            <p>{trip.shortTitle} · 按日期与地点整理旅行现场。</p>
          </div>
          <a className="photo-manage-link" href={`/manage/photos?trip=${trip.id}`}>
            <Upload size={15} strokeWidth={1.8} />
            上传照片
          </a>
        </section>

        {!!photos.length && (
          <section className="photo-filters" aria-label="照片筛选">
            <div>
              <span>日期</span>
              <button className={dayFilter === "all" ? "active" : ""} onClick={() => setDayFilter("all")} type="button">全部</button>
              {trip.days.map((day) => (
                <button
                  className={dayFilter === String(day.day) ? "active" : ""}
                  key={day.day}
                  onClick={() => setDayFilter(String(day.day))}
                  type="button"
                >
                  Day {day.day}
                </button>
              ))}
            </div>
            {!!places.length && (
              <label>
                <span>地点</span>
                <select value={placeFilter} onChange={(event) => setPlaceFilter(event.target.value)}>
                  <option value="all">全部地点</option>
                  {places.map((place) => <option key={place} value={place}>{place}</option>)}
                </select>
              </label>
            )}
          </section>
        )}

        {!!selectedIds.size && (
          <section className="photo-selection-bar" aria-label="照片批量操作">
            <strong>已选 {selectedIds.size} 张</strong>
            <div>
              <button type="button" onClick={toggleSelectAll}>
                {allFilteredSelected ? "取消全选" : "全选当前结果"}
              </button>
              <button type="button" disabled={!!bulkAction} onClick={downloadSelected}>
                {bulkAction === "download" ? <LoaderCircle className="spin" size={15} /> : <Download size={15} />}
                下载
              </button>
              <button className="danger" type="button" disabled={!!bulkAction} onClick={deleteSelected}>
                {bulkAction === "delete" ? <LoaderCircle className="spin" size={15} /> : <Trash2 size={15} />}
                删除
              </button>
              <button type="button" onClick={() => setSelectedIds(new Set())}>退出选择</button>
            </div>
          </section>
        )}
        {bulkMessage && <p className="photo-bulk-message" aria-live="polite">{bulkMessage}</p>}

        {state.loading && <div className="photo-state">正在读取相册…</div>}
        {state.error && <div className="photo-state error">{state.error}</div>}
        {!state.loading && !state.error && !photos.length && (
          <div className="photo-empty">
            <Images size={36} strokeWidth={1.4} />
            <h2>相册还是空的</h2>
            <p>上传这段旅程的第一批照片，之后可按 Day 和地点浏览。</p>
            <a className="text-link" href={`/manage/photos?trip=${trip.id}`}>前往上传</a>
          </div>
        )}
        {!state.loading && !state.error && !!photos.length && !filteredPhotos.length && (
          <div className="photo-state">当前筛选下没有照片。</div>
        )}

        {!!filteredPhotos.length && (
          <section className="photo-grid" aria-label={`${trip.shortTitle}照片`}>
            {filteredPhotos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                className={selectedIds.has(photo.id) ? "selected" : ""}
                aria-pressed={selectedIds.has(photo.id)}
                onClick={() => openOrSelectPhoto(photo, index)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  if (ignoreClickId.current === photo.id) return;
                  toggleSelection(photo.id);
                }}
                onPointerCancel={cancelLongPress}
                onPointerDown={(event) => startLongPress(event, photo.id)}
                onPointerLeave={cancelLongPress}
                onPointerMove={moveLongPress}
                onPointerUp={cancelLongPress}
                style={{ aspectRatio: photo.width && photo.height ? `${photo.width} / ${photo.height}` : "4 / 3" }}
              >
                <img src={photo.thumbnailUrl} alt={photo.caption || photo.place || `Day ${photo.day}`} loading="lazy" />
                <i className="photo-selection-indicator"><Check size={15} strokeWidth={2.4} /></i>
                <span>
                  <b>Day {photo.day}</b>
                  <small>{photo.place || photo.caption || "旅行影像"}</small>
                </span>
              </button>
            ))}
          </section>
        )}

        <div className="back-row"><Link className="text-link" href={`/trips/${trip.id}`}>← 返回行程攻略</Link></div>
      </main>
      <SiteFooter />

      {activePhoto && (
        <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label="照片查看器">
          <button className="lightbox-close" type="button" onClick={() => setActiveIndex(null)} aria-label="关闭">
            <X size={22} />
          </button>
          {filteredPhotos.length > 1 && (
            <>
              <button className="lightbox-previous" type="button" onClick={() => stepPhoto(-1)} aria-label="上一张">
                <ChevronLeft size={26} />
              </button>
              <button className="lightbox-next" type="button" onClick={() => stepPhoto(1)} aria-label="下一张">
                <ChevronRight size={26} />
              </button>
            </>
          )}
          <figure>
            <div
              className="lightbox-image-stage"
              style={{ aspectRatio: activePhoto.width && activePhoto.height ? `${activePhoto.width} / ${activePhoto.height}` : "4 / 3" }}
            >
              <img className="lightbox-placeholder" src={activePhoto.thumbnailUrl} alt="" aria-hidden="true" />
              <img
                className={`lightbox-original ${loadedOriginals.has(activePhoto.displayUrl) ? "loaded" : ""}`}
                src={activePhoto.displayUrl}
                alt={activePhoto.caption || activePhoto.place || `Day ${activePhoto.day}`}
                onLoad={() => markOriginalLoaded(activePhoto.displayUrl)}
              />
              {!loadedOriginals.has(activePhoto.displayUrl) && (
                <LoaderCircle className="lightbox-loader spin" size={24} />
              )}
            </div>
            <figcaption>
              <div className="lightbox-caption">
                <span>Day {activePhoto.day}{activePhoto.place ? ` · ${activePhoto.place}` : ""}</span>
                {activePhoto.caption && <p>{activePhoto.caption}</p>}
              </div>
              {!!photoDetails.length && (
                <dl className="photo-exif">
                  <div className="photo-exif-title"><Camera size={14} /><span>拍摄信息</span></div>
                  {photoDetails.map(([label, value]) => (
                    <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                  ))}
                </dl>
              )}
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}

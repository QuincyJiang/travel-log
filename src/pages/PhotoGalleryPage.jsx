import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Link, useParams } from "wouter";
import { Check, Download, Camera, ChevronLeft, ChevronRight, Images, LoaderCircle, RotateCcw, Star, Trash2, Upload, X, ZoomIn, ZoomOut } from "lucide-react";
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
const MAX_FEATURED_PHOTOS = 16;
const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.5;
const GALLERY_LAYOUTS = [
  { id: "two", columns: 2, label: "双列布局" },
  { id: "three", columns: 3, label: "三列布局" },
  { id: "four", columns: 4, label: "四列布局" },
];

export default function PhotoGalleryPage() {
  const { tripId } = useParams();
  const trip = getTrip(tripId);
  const [photos, setPhotos] = useState([]);
  const [placeFilter, setPlaceFilter] = useState("all");
  const [collection, setCollection] = useState("featured");
  const [activeIndex, setActiveIndex] = useState(null);
  const [loadedOriginals, setLoadedOriginals] = useState(() => new Set());
  const [parsedExif, setParsedExif] = useState({});
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  const [layoutMode, setLayoutMode] = useState("three");
  const [imageView, setImageView] = useState({ zoom: 1, x: 0, y: 0 });
  const [state, setState] = useState({ loading: true, error: "" });
  const longPressTimer = useRef(null);
  const pointerStart = useRef(null);
  const ignoreClickId = useRef("");
  const imageDrag = useRef(null);
  const imageContentRef = useRef(null);
  const imageStageRef = useRef(null);
  const imageViewRef = useRef(imageView);
  const galleryWallRef = useRef(null);
  const suppressImageClick = useRef(false);

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
    () => {
      const source = collection === "featured"
        ? photos.filter((photo) => photo.featured)
        : photos;
      return [...new Set(source.map((photo) => photo.place).filter(Boolean))].sort();
    },
    [collection, photos],
  );
  const featuredPhotos = useMemo(
    () =>
      photos
        .filter((photo) => photo.featured)
        .sort((left, right) => left.featuredOrder - right.featuredOrder),
    [photos],
  );
  const collectionPhotos = collection === "featured" ? featuredPhotos : photos;
  const filteredPhotos = useMemo(
    () =>
      collectionPhotos
        .filter((photo) => placeFilter === "all" || photo.place === placeFilter)
        .sort((left, right) => left.day - right.day),
    [collectionPhotos, placeFilter],
  );
  const photoGroups = useMemo(() => {
    const groups = new Map();
    filteredPhotos.forEach((photo, index) => {
      if (!groups.has(photo.day)) groups.set(photo.day, []);
      groups.get(photo.day).push({ photo, index });
    });
    return [...groups.entries()]
      .sort(([leftDay], [rightDay]) => leftDay - rightDay)
      .map(([day, items]) => ({
        day,
        items,
        itinerary: trip?.days.find((item) => item.day === day),
      }));
  }, [filteredPhotos, trip?.days]);
  const dayAnchorPhotoIds = useMemo(
    () => new Set(photoGroups.map((group) => group.items[0].photo.id)),
    [photoGroups],
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

  const resetImageView = useCallback(() => {
    imageDrag.current = null;
    const next = { zoom: 1, x: 0, y: 0 };
    imageViewRef.current = next;
    setImageView(next);
  }, []);

  const changeZoom = useCallback((amount, focalPoint) => {
    setImageView((current) => {
      const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current.zoom + amount));
      if (zoom === current.zoom) return current;
      let next = zoom === MIN_ZOOM
        ? { zoom, x: 0, y: 0 }
        : { ...current, zoom };
      const stage = imageStageRef.current;
      if (stage && focalPoint && current.zoom > 0 && zoom > MIN_ZOOM) {
        const bounds = stage.getBoundingClientRect();
        const focalX = focalPoint.x - bounds.left - bounds.width / 2;
        const focalY = focalPoint.y - bounds.top - bounds.height / 2;
        const ratio = zoom / current.zoom;
        next = {
          zoom,
          x: focalX - (focalX - current.x) * ratio,
          y: focalY - (focalY - current.y) * ratio,
        };
      }
      imageViewRef.current = next;
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
      if (event.key === "+" || event.key === "=") changeZoom(ZOOM_STEP);
      if (event.key === "-") changeZoom(-ZOOM_STEP);
      if (event.key === "0") resetImageView();
    };
    document.body.classList.add("lightbox-open");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("lightbox-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activePhoto, changeZoom, filteredPhotos.length, resetImageView]);

  useEffect(() => {
    resetImageView();
  }, [activePhoto?.id, resetImageView]);

  useEffect(() => {
    setActiveIndex(null);
    setSelectedIds(new Set());
    setBulkMessage("");
  }, [collection, placeFilter]);

  useEffect(() => {
    if (placeFilter !== "all" && !places.includes(placeFilter)) {
      setPlaceFilter("all");
    }
  }, [placeFilter, places]);

  useEffect(() => {
    if (activeIndex === null || !filteredPhotos.length) return undefined;
    let cancelled = false;
    const url = filteredPhotos[activeIndex].displayUrl;
    preloadOriginal(url)
      .then(() => {
        if (!cancelled) markOriginalLoaded(url);
      })
      .catch(() => {});
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
    resetImageView();
    setActiveIndex((index) => (index + direction + filteredPhotos.length) % filteredPhotos.length);
  };

  const startImageDrag = (event) => {
    if (imageViewRef.current.zoom === 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    imageDrag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: imageViewRef.current.x,
      y: imageViewRef.current.y,
      moved: false,
      latest: imageViewRef.current,
    };
  };

  const moveImage = (event) => {
    const drag = imageDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const next = {
      ...imageViewRef.current,
      x: drag.x + event.clientX - drag.startX,
      y: drag.y + event.clientY - drag.startY,
    };
    drag.latest = next;
    if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 3) {
      drag.moved = true;
    }
    if (imageContentRef.current) {
      imageContentRef.current.style.transform = `translate3d(${next.x}px, ${next.y}px, 0) scale(${next.zoom})`;
    }
  };

  const stopImageDrag = (event) => {
    const drag = imageDrag.current;
    if (drag?.pointerId === event.pointerId) {
      if (drag.moved) {
        suppressImageClick.current = true;
        imageViewRef.current = drag.latest;
        setImageView(drag.latest);
      }
      imageDrag.current = null;
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }
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

  const updateFeaturedSelection = async (targetPhotos, featured) => {
    const response = await fetch("/api/photos", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tripId: trip.id,
        featured,
        photos: targetPhotos.map((photo) => ({
          day: photo.day,
          photoId: photo.id,
        })),
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "精选状态更新失败");
    const updates = new Map(data.photos.map((photo) => [photo.photoId, photo]));
    setPhotos((current) =>
      current.map((item) => {
        const update = updates.get(item.id);
        return update
          ? {
              ...item,
              featured: update.featured,
              featuredOrder: update.featuredOrder,
            }
          : item;
      }),
    );
    return data;
  };

  const toggleActiveFeatured = async () => {
    if (!activePhoto || bulkAction) return;
    if (!activePhoto.featured && featuredPhotos.length >= MAX_FEATURED_PHOTOS) {
      setBulkMessage(`每段旅程最多精选 ${MAX_FEATURED_PHOTOS} 张照片。`);
      return;
    }
    setBulkAction("feature");
    try {
      await updateFeaturedSelection([activePhoto], !activePhoto.featured);
      if (collection === "featured" && activePhoto.featured) setActiveIndex(null);
    } catch (error) {
      setBulkMessage(error.message);
    } finally {
      setBulkAction("");
    }
  };

  const toggleSelectedFeatured = async () => {
    const shouldFeature = !selectedPhotos.every((photo) => photo.featured);
    const additions = selectedPhotos.filter((photo) => !photo.featured).length;
    if (shouldFeature && featuredPhotos.length + additions > MAX_FEATURED_PHOTOS) {
      setBulkMessage(`每段旅程最多精选 ${MAX_FEATURED_PHOTOS} 张照片。`);
      return;
    }

    setBulkAction("feature");
    setBulkMessage("");
    const targetPhotos = selectedPhotos.filter(
      (photo) => photo.featured !== shouldFeature,
    );
    try {
      await updateFeaturedSelection(targetPhotos, shouldFeature);
      setSelectedIds(new Set());
      setBulkMessage(`${targetPhotos.length} 张已${shouldFeature ? "加入" : "移出"}精选。`);
    } catch (error) {
      setBulkMessage(error.message || "精选状态更新失败");
    } finally {
      setBulkAction("");
    }
  };

  const switchLayout = (nextLayout) => {
    if (nextLayout === layoutMode) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const visibleTiles = [...(galleryWallRef.current?.children ?? [])].filter((tile) => {
      const bounds = tile.getBoundingClientRect();
      return bounds.bottom > 0 && bounds.top < window.innerHeight;
    });
    if (reduceMotion || !visibleTiles.length || typeof visibleTiles[0].animate !== "function") {
      setLayoutMode(nextLayout);
      return;
    }
    visibleTiles.forEach((tile) => {
      tile.getAnimations?.().forEach((animation) => animation.cancel());
    });
    const previousBounds = new Map(
      visibleTiles.map((tile) => [tile, tile.getBoundingClientRect()]),
    );
    flushSync(() => setLayoutMode(nextLayout));
    requestAnimationFrame(() => {
      visibleTiles.forEach((tile) => {
        const before = previousBounds.get(tile);
        const after = tile.getBoundingClientRect();
        tile.animate(
          [
            {
              transform: `translate(${before.left - after.left}px, ${before.top - after.top}px) scale(${before.width / after.width}, ${before.height / after.height})`,
              transformOrigin: "top left",
            },
            { transform: "none", transformOrigin: "top left" },
          ],
          {
            duration: 550,
            easing: "cubic-bezier(0.22, 0.7, 0.25, 1)",
          },
        );
      });
    });
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
            <div className="photo-collection-tabs">
              <span>COLLECTION</span>
              <div>
                <button className={collection === "featured" ? "active" : ""} onClick={() => setCollection("featured")} type="button">
                  精选 <sup>{String(featuredPhotos.length).padStart(2, "0")}</sup>
                </button>
                <button className={collection === "all" ? "active" : ""} onClick={() => setCollection("all")} type="button">
                  全部 <sup>{String(photos.length).padStart(2, "0")}</sup>
                </button>
              </div>
            </div>
            <div className="photo-filter-actions">
              {!!places.length && (
                <label className="photo-place-filter">
                  <span>LOCATION</span>
                  <select value={placeFilter} onChange={(event) => setPlaceFilter(event.target.value)}>
                    <option value="all">全部地点</option>
                    {places.map((place) => <option key={place} value={place}>{place}</option>)}
                  </select>
                </label>
              )}
              <div className="photo-layout-switcher" aria-label="照片墙布局">
                <span>LAYOUT</span>
                <div>
                  {GALLERY_LAYOUTS.map((layout) => (
                    <button
                      className={layoutMode === layout.id ? "active" : ""}
                      key={layout.id}
                      type="button"
                      onClick={() => switchLayout(layout.id)}
                      aria-label={layout.label}
                      aria-pressed={layoutMode === layout.id}
                      title={layout.label}
                    >
                      <i className={`layout-icon layout-icon-${layout.columns}`} aria-hidden="true">
                        {Array.from(
                          { length: layout.columns === 2 ? 2 : layout.columns * 2 },
                          (_, index) => <b key={index} />,
                        )}
                      </i>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {!!selectedIds.size && (
          <section className="photo-selection-bar" aria-label="照片批量操作">
            <strong>已选 {selectedIds.size} 张</strong>
            <div>
              <button type="button" onClick={toggleSelectAll}>
                {allFilteredSelected ? "取消全选" : "全选当前结果"}
              </button>
              <button type="button" disabled={!!bulkAction} onClick={toggleSelectedFeatured}>
                {bulkAction === "feature" ? <LoaderCircle className="spin" size={15} /> : <Star size={15} />}
                {selectedPhotos.every((photo) => photo.featured) ? "取消精选" : "设为精选"}
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
          <div className="photo-empty compact">
            <Star size={30} strokeWidth={1.5} />
            <h2>{collection === "featured" ? "还没有精选照片" : "当前筛选下没有照片"}</h2>
            <p>{collection === "featured" ? "切换到全部照片，通过右键或长按选择照片加入精选。" : "调整地点筛选后重试。"}</p>
            {collection === "featured" && (
              <button className="text-link" type="button" onClick={() => setCollection("all")}>查看全部照片</button>
            )}
          </div>
        )}

        {!!filteredPhotos.length && (
          <div className="photo-gallery-layout">
            <section
              className={`photo-grid gallery-wall layout-${layoutMode}`}
              aria-label={`${trip.shortTitle}照片`}
              ref={galleryWallRef}
            >
              {filteredPhotos.map((photo, index) => (
                <button
                  id={dayAnchorPhotoIds.has(photo.id) ? `photo-day-${photo.day}` : undefined}
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
                >
                  <img src={photo.thumbnailUrl} alt={photo.caption || photo.place || `Day ${photo.day}`} loading="lazy" />
                  <i className="photo-selection-indicator"><Check size={15} strokeWidth={2.4} /></i>
                  <span>
                    <b>{String(index + 1).padStart(2, "0")}</b>
                    <small>{photo.place || photo.caption || "旅行影像"}</small>
                  </span>
                </button>
              ))}
            </section>
            <aside className="photo-timeline" aria-label="相册时间轴">
              <span>JOURNEY</span>
              <ol>
                {photoGroups.map((group) => (
                  <li key={group.day}>
                    <a href={`#photo-day-${group.day}`}>
                      <i />
                      <span>Day {group.day}</span>
                      <small>{group.itinerary?.date}</small>
                    </a>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        )}

        <div className="back-row"><Link className="text-link" href={`/trips/${trip.id}`}>← 返回行程攻略</Link></div>
      </main>
      <SiteFooter />

      {activePhoto && (
        <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label="照片查看器">
          <button className="lightbox-close" type="button" onClick={() => setActiveIndex(null)} aria-label="关闭">
            <X size={22} />
          </button>
          <div className="lightbox-zoom-controls" aria-label="图片缩放">
            <button type="button" onClick={() => changeZoom(-ZOOM_STEP)} disabled={imageView.zoom === MIN_ZOOM} aria-label="缩小">
              <ZoomOut size={17} />
            </button>
            <span>{Math.round(imageView.zoom * 100)}%</span>
            <button type="button" onClick={() => changeZoom(ZOOM_STEP)} disabled={imageView.zoom === MAX_ZOOM} aria-label="放大">
              <ZoomIn size={17} />
            </button>
            <button type="button" onClick={resetImageView} disabled={imageView.zoom === MIN_ZOOM} aria-label="恢复原始缩放">
              <RotateCcw size={16} />
            </button>
          </div>
          <button
            className={`lightbox-featured ${activePhoto.featured ? "active" : ""}`}
            type="button"
            disabled={bulkAction === "feature"}
            onClick={toggleActiveFeatured}
            aria-label={activePhoto.featured ? "取消精选" : "设为精选"}
          >
            {bulkAction === "feature" ? <LoaderCircle className="spin" size={18} /> : <Star size={19} fill={activePhoto.featured ? "currentColor" : "none"} />}
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
              className={`lightbox-image-stage ${imageView.zoom > 1 ? "zoomed" : ""} ${imageDrag.current ? "dragging" : ""}`}
              ref={imageStageRef}
              onClick={(event) => {
                if (suppressImageClick.current) {
                  suppressImageClick.current = false;
                  return;
                }
                if (imageViewRef.current.zoom === MIN_ZOOM) {
                  changeZoom(1, { x: event.clientX, y: event.clientY });
                } else {
                  resetImageView();
                }
              }}
              onPointerCancel={stopImageDrag}
              onPointerDown={startImageDrag}
              onPointerMove={moveImage}
              onPointerUp={stopImageDrag}
              onWheel={(event) => {
                event.preventDefault();
                changeZoom(
                  event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP,
                  { x: event.clientX, y: event.clientY },
                );
              }}
            >
              <div
                className="lightbox-image-content"
                ref={imageContentRef}
                style={{ transform: `translate3d(${imageView.x}px, ${imageView.y}px, 0) scale(${imageView.zoom})` }}
              >
                <img className="lightbox-placeholder" src={activePhoto.thumbnailUrl} alt="" aria-hidden="true" draggable="false" />
                <img
                  className={`lightbox-original ${loadedOriginals.has(activePhoto.displayUrl) ? "loaded" : ""}`}
                  src={activePhoto.displayUrl}
                  alt={activePhoto.caption || activePhoto.place || `Day ${activePhoto.day}`}
                  draggable="false"
                  onLoad={() => markOriginalLoaded(activePhoto.displayUrl)}
                />
              </div>
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

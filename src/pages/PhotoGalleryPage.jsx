import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { ChevronLeft, ChevronRight, Images, Upload, X } from "lucide-react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import TripViewNav from "../components/TripViewNav";
import { getTrip } from "../data/trips";
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

export default function PhotoGalleryPage() {
  const { tripId } = useParams();
  const trip = getTrip(tripId);
  const [photos, setPhotos] = useState([]);
  const [dayFilter, setDayFilter] = useState("all");
  const [placeFilter, setPlaceFilter] = useState("all");
  const [activeIndex, setActiveIndex] = useState(null);
  const [state, setState] = useState({ loading: true, error: "" });

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
  }, [dayFilter, placeFilter]);

  if (!trip) return <NotFoundPage />;

  const stepPhoto = (direction) => {
    setActiveIndex((index) => (index + direction + filteredPhotos.length) % filteredPhotos.length);
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
                onClick={() => setActiveIndex(index)}
                style={{ aspectRatio: photo.width && photo.height ? `${photo.width} / ${photo.height}` : "4 / 3" }}
              >
                <img src={photo.thumbnailUrl} alt={photo.caption || photo.place || `Day ${photo.day}`} loading="lazy" />
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
            <img src={activePhoto.displayUrl} alt={activePhoto.caption || activePhoto.place || `Day ${activePhoto.day}`} />
            <figcaption>
              <span>Day {activePhoto.day}{activePhoto.place ? ` · ${activePhoto.place}` : ""}</span>
              {activePhoto.caption && <p>{activePhoto.caption}</p>}
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}

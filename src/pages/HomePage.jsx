import { useEffect, useState } from "react";
import { Link } from "wouter";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { trips } from "../data/trips";

const loadFeaturedPhotos = async (tripId, signal) => {
  try {
    const response = await fetch(`/api/photos?tripId=${encodeURIComponent(tripId)}`, {
      cache: "no-store",
      credentials: "include",
      redirect: "manual",
      signal,
    });
    if (!response.ok || response.type === "opaqueredirect") return [];
    if (!response.headers.get("content-type")?.includes("application/json")) return [];
    const data = await response.json();
    return data.photos
      .filter((photo) => photo.featured)
      .sort((left, right) => left.featuredOrder - right.featuredOrder)
      .slice(0, 16);
  } catch {
    return [];
  }
};

function JourneyVisual({ trip, photos }) {
  if (!photos?.length) {
    return <img src={trip.cover} alt={trip.coverAlt} />;
  }
  const columns = photos.length <= 4 ? 2 : photos.length <= 9 ? 3 : 4;
  return (
    <div className={`entry-mosaic mosaic-${columns}`} aria-label={`${trip.shortTitle}精选照片`}>
      {photos.map((photo) => (
        <img
          key={photo.id}
          src={photo.thumbnailUrl}
          alt={photo.caption || photo.place || `${trip.shortTitle}精选照片`}
          loading="lazy"
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const years = trips.map((trip) => trip.dateRange.slice(0, 4)).sort();
  const archivePeriod = years.length > 1 ? `${years[0]}—${years.at(-1)}` : years[0];
  const [featuredByTrip, setFeaturedByTrip] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    Promise.all(
      trips.map(async (trip) => [
        trip.id,
        await loadFeaturedPhotos(trip.id, controller.signal),
      ]),
    ).then((entries) => {
      if (!controller.signal.aborted) setFeaturedByTrip(Object.fromEntries(entries));
    });
    return () => controller.abort();
  }, []);

  return (
    <div className="page-shell home-page">
      <SiteHeader />
      <main>
        <section className="home-hero">
          <div className="home-title-wrap">
            <span className="hero-seal">SINCE<br />{years[0]}</span>
            <h1>行旅志</h1>
          </div>
          <div className="home-intro">
            <span>{String(trips.length).padStart(2, "0")} JOURNEYS · {archivePeriod}</span>
          </div>
        </section>

        <section className="journal-list" aria-labelledby="journeys-title">
          <div className="journal-heading">
            <span className="section-index">ARCHIVE / 旅程</span>
            <h2 id="journeys-title">Journeys</h2>
          </div>
          {trips.map((trip, index) => (
            <Link className="journal-entry" href={`/trips/${trip.id}`} key={trip.id}>
              <span className="entry-number">{String(index + 1).padStart(2, "0")}</span>
              <div className={`entry-image ${featuredByTrip[trip.id]?.length ? "has-mosaic" : ""}`}>
                <JourneyVisual trip={trip} photos={featuredByTrip[trip.id]} />
              </div>
              <div className="entry-copy">
                <div className="entry-meta"><span>{trip.status}</span><i />{trip.period}</div>
                <h3>{trip.shortTitle}</h3>
                <p>{trip.summary}</p>
              </div>
              <span className="entry-arrow">↗</span>
            </Link>
          ))}
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}

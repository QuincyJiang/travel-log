import { Link, useParams } from "wouter";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import OverviewMap from "../components/OverviewMap";
import StayOverview from "../components/StayOverview";
import DayCard from "../components/DayCard";
import TripViewNav from "../components/TripViewNav";
import ContentStatePage from "../components/ContentStatePage";
import { useTrip } from "../lib/tripsApi";
import NotFoundPage from "./NotFoundPage";

export default function TripPage() {
  const { tripId } = useParams();
  const { data: trip, error, loading, notFound } = useTrip(tripId);

  if (notFound) return <NotFoundPage />;
  if (loading || !trip) return <ContentStatePage error={error} />;

  return (
    <div className="page-shell trip-page">
      <SiteHeader trip={trip} />
      <main>
        <TripViewNav trip={trip} />
        <section className="trip-hero">
          <div className="trip-hero-copy">
            <span className="eyebrow">{trip.eyebrow}</span>
            <h1>{trip.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
            <p>{trip.summary}</p>
            <div className="tag-row">{trip.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          </div>
          <div className="trip-cover">
            <img src={trip.cover} alt={trip.coverAlt} />
            <div className="cover-caption">
              <span>{trip.dateRange}</span>
              <b>{trip.routeLabel}</b>
            </div>
          </div>
        </section>

        <section className="metrics" aria-label="行程数据">
          {trip.metrics.map((metric) => (
            <div key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>
          ))}
        </section>

        <OverviewMap map={trip.overviewMap} />

        <StayOverview days={trip.days} />

        <section className="itinerary" aria-labelledby="itinerary-title">
          <div className="section-heading">
            <div>
              <span className="section-index">03 / ITINERARY</span>
              <h2 id="itinerary-title">每日行程</h2>
            </div>
            <p>点击卡片查看交通地图、时间线、景点说明和当日 Tips。</p>
          </div>
          <div className="day-list">
            {trip.days.map((day) => <DayCard key={day.day} tripId={trip.id} day={day} />)}
          </div>
        </section>

        <div className="back-row"><Link className="text-link" href="/">← 返回旅程列表</Link></div>
      </main>
      <SiteFooter />
    </div>
  );
}

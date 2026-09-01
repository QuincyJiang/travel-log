import { Link, useParams } from "wouter";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import TransitRoute from "../components/TransitRoute";
import PlaceGallery from "../components/PlaceGallery";
import FoodMap from "../components/FoodMap";
import ContentStatePage from "../components/ContentStatePage";
import { useTrip } from "../lib/tripsApi";
import NotFoundPage from "./NotFoundPage";

export default function DayPage() {
  const { tripId, dayNumber } = useParams();
  const { data: trip, error, loading, notFound } = useTrip(tripId);
  const day = trip?.days.find((item) => item.day === Number(dayNumber));

  if (notFound || (trip && !day)) return <NotFoundPage />;
  if (loading || !trip) return <ContentStatePage error={error} />;

  const previous = trip.days.find((item) => item.day === day.day - 1);
  const next = trip.days.find((item) => item.day === day.day + 1);

  return (
    <div className="page-shell day-page">
      <SiteHeader trip={trip} />
      <main>
        <div className="day-breadcrumb">
          <Link href={`/trips/${trip.id}`}>{trip.shortTitle}</Link>
          <span>/</span>
          <b>DAY {String(day.day).padStart(2, "0")}</b>
        </div>

        <section className="day-hero">
          <div className="day-title-panel">
            <div className="day-date-large"><span>{day.date}</span><small>{day.weekday}</small></div>
            <h1>{day.title}</h1>
            <p>{day.subtitle}</p>
            <dl className="day-facts">
              <div><dt>交通</dt><dd>{day.transport}</dd></div>
              <div><dt>移动</dt><dd>{day.duration}</dd></div>
              <div><dt>住宿</dt><dd>{day.stay}</dd></div>
            </dl>
          </div>
          <div className="day-hero-image">
            <img src={day.image} alt={day.imageAlt} />
            <span>DAY {String(day.day).padStart(2, "0")}</span>
          </div>
        </section>

        <TransitRoute day={day} mapProvider={trip.mapProvider} />

        <section className="day-content-grid">
          <div className="timeline-panel">
            <div className="section-heading compact">
              <div><span className="section-index">SCHEDULE</span><h2>时间安排</h2></div>
            </div>
            <ol className="detail-timeline">
              {day.timeline.map((item, index) => (
                <li key={`${item.time}-${index}`}>
                  <time>{item.time}</time>
                  <div><h3>{item.title}</h3><p>{item.note}</p></div>
                </li>
              ))}
            </ol>
          </div>
          <aside className="tips-panel">
            <span className="section-index">FIELD NOTES</span>
            <h2>Tips</h2>
            <ul>{day.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
          </aside>
        </section>

        <section className="places-section" aria-labelledby="places-title">
          <div className="section-heading">
            <div><span className="section-index">PLACES</span><h2 id="places-title">当日地点</h2></div>
            <p>景点说明作为计划参考，开放时间与交通以出发日信息为准。</p>
          </div>
          <PlaceGallery places={day.places} />
        </section>

        <FoodMap food={day.food} mapProvider={trip.mapProvider} />

        <nav className="day-pagination" aria-label="每日行程翻页">
          {previous ? (
            <Link href={`/trips/${trip.id}/day/${previous.day}`}><small>上一日</small><b>← {previous.title}</b></Link>
          ) : <span />}
          {next ? (
            <Link className="next" href={`/trips/${trip.id}/day/${next.day}`}><small>下一日</small><b>{next.title} →</b></Link>
          ) : <Link className="next" href={`/trips/${trip.id}`}><small>行程结束</small><b>返回总览 →</b></Link>}
        </nav>
      </main>
      <SiteFooter />
    </div>
  );
}

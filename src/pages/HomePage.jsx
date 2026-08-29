import { Link } from "wouter";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { trips } from "../data/trips";

export default function HomePage() {
  const years = trips.map((trip) => trip.dateRange.slice(0, 4)).sort();
  const archivePeriod = years.length > 1 ? `${years[0]}—${years.at(-1)}` : years[0];

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
              <div className="entry-image"><img src={trip.cover} alt={trip.coverAlt} /></div>
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

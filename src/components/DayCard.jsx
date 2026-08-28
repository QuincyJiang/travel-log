import { Link } from "wouter";

export default function DayCard({ tripId, day }) {
  return (
    <Link className="day-card" href={`/trips/${tripId}/day/${day.day}`}>
      <div className="day-card-date">
        <span>{day.date}</span>
        <small>{day.weekday}</small>
      </div>
      <div className="day-card-image">
        <img src={day.image} alt={day.imageAlt} loading="lazy" />
        <span>DAY {String(day.day).padStart(2, "0")}</span>
      </div>
      <div className="day-card-copy">
        <div className="day-meta">{day.transport} · {day.duration}</div>
        <h3>{day.title}</h3>
        <p>{day.subtitle}</p>
        <div className="day-route-preview">
          {day.routeNodes.map((node, index) => (
            <span key={`${node.label}-${index}`}>{node.label}</span>
          ))}
        </div>
      </div>
      <span className="round-arrow" aria-hidden="true">↗</span>
    </Link>
  );
}

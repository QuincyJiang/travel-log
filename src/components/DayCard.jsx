import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

export default function DayCard({ tripId, day }) {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Link
      ref={cardRef}
      className={`day-card ${isVisible ? "is-visible" : ""}`}
      href={`/trips/${tripId}/day/${day.day}`}
    >
      <div className="day-card-date">
        <i aria-hidden="true" />
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

import { useState } from "react";

const embedUrl = (origin, destination) =>
  `https://maps.google.com/maps?saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(destination)}&dirflg=r&output=embed`;

const externalUrl = (origin, destination) =>
  `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=transit`;

export default function TransitRoute({ day }) {
  const [activeLeg, setActiveLeg] = useState(0);
  const origin = day.routeNodes[activeLeg];
  const destination = day.routeNodes[activeLeg + 1];

  return (
    <section className="transit-panel" aria-labelledby="transit-title">
      <div className="transit-head">
        <div>
          <span className="section-index">PUBLIC TRANSIT</span>
          <h2 id="transit-title">当日交通</h2>
        </div>
        <a className="text-link" href={externalUrl(origin.place, destination.place)} target="_blank" rel="noreferrer">
          打开当前路段 ↗
        </a>
      </div>

      <div className="route-rail" aria-label={`${day.title}公共交通路段`}>
        {day.routeNodes.map((node, index) => (
          <div className="route-rail-part" key={`${node.label}-${index}`}>
            <div className={`route-point ${index === activeLeg || index === activeLeg + 1 ? "active" : ""}`}>
              <i />
              <span>{node.label}</span>
            </div>
            {index < day.routeNodes.length - 1 && (
              <button
                className={`route-segment ${index === activeLeg ? "active" : ""}`}
                type="button"
                aria-label={`显示 ${node.label} 至 ${day.routeNodes[index + 1].label} 公共交通线路`}
                aria-pressed={index === activeLeg}
                onClick={() => setActiveLeg(index)}
              >
                <span>{day.routeModes[index]}</span>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="transit-map-frame">
        <iframe
          key={`${origin.place}-${destination.place}`}
          src={embedUrl(origin.place, destination.place)}
          title={`${origin.label}至${destination.label}公共交通路线`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <span className="transit-caption">{origin.label} → {destination.label}</span>
      </div>
    </section>
  );
}

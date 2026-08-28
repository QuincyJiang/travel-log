import { ExternalLink } from "lucide-react";

export default function PlaceGallery({ places }) {
  return (
    <div className="place-grid">
      {places.map((place, index) => (
        <article className={`place-card place-${index + 1}`} key={place.name}>
          <div className="place-image">
            <img src={place.image} alt={place.name} loading="lazy" />
            <span>{place.type}</span>
          </div>
          <div className="place-copy">
            <h3>{place.name}</h3>
            <p>{place.description}</p>
            <dl className="place-details">
              {place.details.map((detail) => (
                <div key={detail.label}>
                  <dt>{detail.label}</dt>
                  <dd>{detail.text}</dd>
                </div>
              ))}
            </dl>
            <div className="place-sources">
              <span>资料来源</span>
              <div>
                {place.sources.map((source) => (
                  <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                    {source.label}
                    <ExternalLink size={12} strokeWidth={1.8} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

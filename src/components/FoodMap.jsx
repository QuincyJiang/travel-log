import { useState } from "react";
import { ExternalLink, MapPin, Utensils } from "lucide-react";
import AmapMap from "./AmapMap";
import {
  googleMapEmbedUrl,
  mapProviderName,
  mapSearchUrl,
} from "../lib/maps";

export default function FoodMap({ food, mapProvider }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRestaurant = food.restaurants[activeIndex];
  const providerName = mapProviderName(mapProvider);

  return (
    <section className="food-section" aria-labelledby="food-title">
      <div className="section-heading">
        <div>
          <span className="section-index">LOCAL FOOD</span>
          <h2 id="food-title">当日美食</h2>
        </div>
        <p>{food.note}</p>
      </div>

      <div className="food-layout">
        <div className="food-guide">
          <div className="specialty-block">
            <div className="food-subhead">
              <Utensils size={16} strokeWidth={1.8} />
              <h3>当地名物</h3>
            </div>
            <div className="specialty-list">
              {food.specialties.map((item) => (
                <article key={item.name}>
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="restaurant-block">
            <div className="food-subhead">
              <MapPin size={16} strokeWidth={1.8} />
              <h3>餐厅定位</h3>
            </div>
            <div className="restaurant-list">
              {food.restaurants.map((restaurant, index) => (
                <button
                  key={restaurant.name}
                  className={index === activeIndex ? "active" : ""}
                  type="button"
                  aria-pressed={index === activeIndex}
                  onClick={() => setActiveIndex(index)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <b>{restaurant.name}</b>
                    <small>{restaurant.note}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="food-map-card">
          <div className="food-map-head">
            <div>
              <span>{food.area}</span>
              <strong>{activeRestaurant.name}</strong>
            </div>
            <div className="food-map-actions">
              {activeRestaurant.source && (
                <a className="food-source-link" href={activeRestaurant.source} target="_blank" rel="noreferrer">
                  小红书原帖
                </a>
              )}
              <a
                className="food-map-link"
                href={mapSearchUrl(mapProvider, activeRestaurant.query)}
                target="_blank"
                rel="noreferrer"
                aria-label={`在${providerName}打开 ${activeRestaurant.name}`}
                title={`在${providerName}打开`}
              >
                <ExternalLink size={17} strokeWidth={1.8} />
              </a>
            </div>
          </div>
          {mapProvider === "amap" ? (
            <AmapMap
              label={`${activeRestaurant.name}高德地图`}
              query={activeRestaurant.query}
            />
          ) : (
            <iframe
              key={activeRestaurant.query}
              src={googleMapEmbedUrl(activeRestaurant.query)}
              title={`${activeRestaurant.name} Google Maps`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
        </div>
      </div>
    </section>
  );
}

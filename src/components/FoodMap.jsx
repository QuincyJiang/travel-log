import { useState } from "react";
import { ExternalLink, MapPin, Utensils } from "lucide-react";

const mapEmbed = (query) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;

const mapLink = (query) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export default function FoodMap({ food }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRestaurant = food.restaurants[activeIndex];

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
            <a
              href={mapLink(activeRestaurant.query)}
              target="_blank"
              rel="noreferrer"
              aria-label={`在 Google Maps 打开 ${activeRestaurant.name}`}
              title="在 Google Maps 打开"
            >
              <ExternalLink size={17} strokeWidth={1.8} />
            </a>
          </div>
          <iframe
            key={activeRestaurant.query}
            src={mapEmbed(activeRestaurant.query)}
            title={`${activeRestaurant.name} Google Maps`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

import { BedDouble, ExternalLink, MapPin } from "lucide-react";
import CollapsibleSection from "./CollapsibleSection";
import { mapProviderName, mapSearchUrl } from "../lib/maps";

function buildStayGroups(days) {
  const overnightDays = days.filter((day) => day.stay !== "返程");

  return overnightDays.reduce((groups, day, index) => {
    const previous = groups.at(-1);
    const checkoutDate = days[index + 1]?.date ?? day.date;

    if (previous?.area === day.stay) {
      previous.nights += 1;
      previous.checkoutDate = checkoutDate;
      previous.dayNumbers.push(day.day);
      return groups;
    }

    groups.push({
      area: day.stay,
      city: day.stay.replace("站附近", ""),
      checkinDate: day.date,
      checkoutDate,
      nights: 1,
      dayNumbers: [day.day],
      arrival: day.stayArrival ?? day.routeNodes.at(-1).label,
    });
    return groups;
  }, []);
}

export default function StayOverview({ days, mapProvider }) {
  const stays = buildStayGroups(days);
  const totalNights = stays.reduce((total, stay) => total + stay.nights, 0);
  const providerName = mapProviderName(mapProvider);

  return (
    <CollapsibleSection
      className="stay-overview"
      id="stay-overview"
      index="02"
      meta="STAYS / 每日"
      title="每日住宿"
      description={`${stays.length} 个住宿地 · 共 ${totalNights} 晚`}
    >
      <div className="stay-grid">
        {stays.map((stay, index) => (
          <article className="stay-card" key={`${stay.city}-${stay.checkinDate}`}>
            <div className="stay-card-head">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <a
                href={mapSearchUrl(mapProvider, stay.area)}
                target="_blank"
                rel="noreferrer"
                aria-label={`在${providerName}查找${stay.area}酒店`}
                title={`在${providerName}查找酒店`}
              >
                <ExternalLink size={15} strokeWidth={1.8} />
              </a>
            </div>
            <h3>{stay.city}</h3>
            <div className="stay-dates">
              <strong>{stay.checkinDate}</strong>
              <span>→</span>
              <strong>{stay.checkoutDate}</strong>
            </div>
            <div className="stay-card-meta">
              <span><BedDouble size={13} strokeWidth={1.8} />{stay.nights} 晚</span>
              <span><MapPin size={13} strokeWidth={1.8} />{stay.arrival}</span>
              <span>Day {stay.dayNumbers.join("–")}</span>
            </div>
          </article>
        ))}
      </div>
    </CollapsibleSection>
  );
}

import { BedDouble, ExternalLink, MapPin } from "lucide-react";

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
      arrival: day.routeNodes.at(-1).label,
    });
    return groups;
  }, []);
}

const mapLink = (area) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${area} Japan hotels`)}`;

export default function StayOverview({ days }) {
  const stays = buildStayGroups(days);
  const totalNights = stays.reduce((total, stay) => total + stay.nights, 0);

  return (
    <section className="stay-overview" aria-labelledby="stay-overview-title">
      <div className="section-heading">
        <div>
          <span className="section-index">02 / STAYS</span>
          <h2 id="stay-overview-title">住宿安排</h2>
        </div>
        <p>{stays.length} 个住宿地，共 {totalNights} 晚。车站步行范围优先，减少换乘日搬运行李。</p>
      </div>

      <div className="stay-grid">
        {stays.map((stay, index) => (
          <article className="stay-card" key={`${stay.city}-${stay.checkinDate}`}>
            <div className="stay-card-head">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <a
                href={mapLink(stay.area)}
                target="_blank"
                rel="noreferrer"
                aria-label={`在 Google Maps 查找${stay.area}酒店`}
                title="在 Google Maps 查找酒店"
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
            <dl>
              <div>
                <dt><BedDouble size={14} strokeWidth={1.8} />晚数</dt>
                <dd>{stay.nights} 晚</dd>
              </div>
              <div>
                <dt><MapPin size={14} strokeWidth={1.8} />区域</dt>
                <dd>{stay.area}</dd>
              </div>
            </dl>
            <p>Day {stay.dayNumbers.join("–")} · 抵达 {stay.arrival}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

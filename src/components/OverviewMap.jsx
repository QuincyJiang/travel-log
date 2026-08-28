export default function OverviewMap({ map }) {
  return (
    <section className="overview-map" aria-labelledby="overview-map-title">
      <div className="section-heading map-heading">
        <div>
          <span className="section-index">01 / ROUTE</span>
          <h2 id="overview-map-title">行程总览</h2>
        </div>
        <a className="text-link light" href={map.external} target="_blank" rel="noreferrer">
          Google Maps 打开 ↗
        </a>
      </div>
      <div className="overview-map-frame">
        <iframe
          src={map.embed}
          title="东北旅行完整路线 Google Maps"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <span className="map-status">LIVE GOOGLE MAP</span>
      </div>
      <div className="overview-nodes" aria-label="行程节点">
        {map.nodes.map((node, index) => (
          <div className="overview-node" key={`${node}-${index}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <b>{node}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

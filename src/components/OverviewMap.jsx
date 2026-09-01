import AmapMap from "./AmapMap";
import { amapSearchUrl, mapProviderName } from "../lib/maps";

export default function OverviewMap({ map }) {
  const providerName = mapProviderName(map.provider);
  const externalUrl = map.provider === "amap"
    ? amapSearchUrl(map.nodes.join(" "))
    : map.external;

  return (
    <section className="overview-map" aria-labelledby="overview-map-title">
      <div className="section-heading map-heading">
        <div>
          <span className="section-index">01 / ROUTE</span>
          <h2 id="overview-map-title">行程总览</h2>
        </div>
        <a className="text-link light" href={externalUrl} target="_blank" rel="noreferrer">
          {providerName}打开 ↗
        </a>
      </div>
      <div className="overview-map-frame">
        {map.provider === "amap" ? (
          <AmapMap
            label="旅行完整路线高德地图"
            points={map.routeNodes}
          />
        ) : (
          <iframe
            src={map.embed}
            title="旅行完整路线 Google Maps"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
        <span className="map-status">LIVE {map.provider === "amap" ? "AMAP" : "GOOGLE MAP"}</span>
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

import { useEffect, useRef, useState } from "react";
import { loadAmap } from "../lib/maps";

const loadPlugin = (AMap, plugin) =>
  new Promise((resolve) => AMap.plugin(plugin, resolve));

const escapeMapLabel = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

async function showMarkers(AMap, map, points) {
  await loadPlugin(AMap, "AMap.Geocoder");

  const locations = await new Promise((resolve, reject) => {
    const geocoder = new AMap.Geocoder();
    geocoder.getLocation(
      points.map((point) => point.query || point.label),
      (status, result) => {
        if (status === "complete" && result.info === "OK") {
          resolve(result.geocodes);
          return;
        }
        reject(new Error("未找到地图地点"));
      },
    );
  });

  const markers = locations.map((item, index) => new AMap.Marker({
    map,
    position: item.location,
    title: points[index]?.label,
    label: {
      content: escapeMapLabel(points[index]?.label ?? ""),
      direction: "top",
    },
  }));

  if (locations.length > 1) {
    new AMap.Polyline({
      map,
      path: locations.map((item) => item.location),
      strokeColor: "#d74d2f",
      strokeOpacity: 0.82,
      strokeWeight: 5,
      strokeStyle: "dashed",
    });
  }

  map.setFitView(markers, false, [54, 54, 54, 54]);
}

async function showRoute(AMap, map, points, routeType) {
  if (routeType === "markers") {
    await showMarkers(AMap, map, points);
    return;
  }

  const plugin = routeType === "walking" ? "AMap.Walking" : "AMap.Driving";
  await loadPlugin(AMap, plugin);
  const RouteService = routeType === "walking" ? AMap.Walking : AMap.Driving;

  await new Promise((resolve, reject) => {
    const service = new RouteService({
      map,
      hideMarkers: false,
      autoFitView: true,
    });
    const routePoints = points.map((point) => ({
      keyword: point.query || point.label,
    }));
    const handleResult = (status, result) => {
      if (status === "complete" && result.info === "OK") {
        resolve();
        return;
      }
      reject(new Error("未找到高德路线"));
    };

    if (routeType === "walking") {
      service.search(routePoints[0], routePoints[1], handleResult);
      return;
    }
    service.search(routePoints, handleResult);
  });
}

async function showPlace(AMap, map, query) {
  await loadPlugin(AMap, "AMap.PlaceSearch");

  await new Promise((resolve, reject) => {
    const placeSearch = new AMap.PlaceSearch({
      map,
      pageSize: 1,
      pageIndex: 1,
      extensions: "base",
      autoFitView: true,
    });
    placeSearch.search(query, (status, result) => {
      if (status === "complete" && result.info === "OK") {
        resolve();
        return;
      }
      reject(new Error("未找到地图地点"));
    });
  });
}

export default function AmapMap({
  label,
  points = [],
  query,
  routeType = "driving",
}) {
  const containerRef = useRef(null);
  const [error, setError] = useState("");
  const pointsKey = points
    .map((point) => `${point.label}:${point.query ?? ""}`)
    .join("|");

  useEffect(() => {
    let disposed = false;
    let map;

    setError("");
    loadAmap()
      .then(async (AMap) => {
        if (disposed || !containerRef.current) return;

        map = new AMap.Map(containerRef.current, {
          zoom: 10,
          viewMode: "2D",
          mapStyle: "amap://styles/normal",
        });

        try {
          if (query) {
            await showPlace(AMap, map, query);
          } else {
            await showRoute(AMap, map, points, routeType);
          }
        } catch (mapError) {
          if (routeType !== "markers" && points.length) {
            map.clearMap();
            await showMarkers(AMap, map, points);
            return;
          }
          throw mapError;
        }
      })
      .catch((mapError) => {
        if (!disposed) setError(mapError.message || "高德地图加载失败");
      });

    return () => {
      disposed = true;
      map?.destroy();
    };
  }, [pointsKey, query, routeType]);

  return (
    <div className="amap-map" aria-label={label}>
      <div ref={containerRef} className="amap-map-canvas" />
      {error && <div className="map-error" role="status">{error}</div>}
    </div>
  );
}

const AMAP_SERVICE_PATH = "/api/amap";
const AMAP_SOURCE = "travel-log";

let amapLoader;

export const mapProviderName = (provider) =>
  provider === "amap" ? "高德地图" : "Google Maps";

export const amapSearchUrl = (query) => {
  const params = new URLSearchParams({
    keyword: query,
    view: "map",
    src: AMAP_SOURCE,
    callnative: "0",
  });
  return `https://uri.amap.com/search?${params}`;
};

export const googleSearchUrl = (query) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const mapSearchUrl = (provider, query) =>
  provider === "amap" ? amapSearchUrl(query) : googleSearchUrl(query);

export const googleMapEmbedUrl = (query) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;

export const googleRouteEmbedUrl = (origin, destination) =>
  `https://maps.google.com/maps?saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(destination)}&dirflg=r&output=embed`;

export const googleRouteUrl = (origin, destination) =>
  `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=transit`;

export const amapRouteSearchUrl = (origin, destination) =>
  amapSearchUrl(`${origin} 到 ${destination}`);

export const getAmapRouteType = (mode = "") => {
  if (/步行|徒步/.test(mode)) return "walking";
  if (/航班|火车|铁路|高铁|动车/.test(mode)) return "markers";
  return "driving";
};

export function loadAmap() {
  if (window.AMap) return Promise.resolve(window.AMap);
  if (amapLoader) return amapLoader;

  const key = import.meta.env.VITE_AMAP_KEY?.trim();
  if (!key) {
    return Promise.reject(new Error("未配置 VITE_AMAP_KEY"));
  }

  window._AMapSecurityConfig = {
    serviceHost: `${window.location.origin}${AMAP_SERVICE_PATH}`,
  };

  amapLoader = new Promise((resolve, reject) => {
    const existingScript = document.querySelector("script[data-amap-sdk]");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.AMap), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("高德地图加载失败")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.dataset.amapSdk = "true";
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(key)}`;
    script.async = true;
    script.onload = () => resolve(window.AMap);
    script.onerror = () => reject(new Error("高德地图加载失败"));
    document.head.append(script);
  });

  return amapLoader;
}

import { json } from "../_shared/photos";

const AMAP_PROXY_PATH = "/api/amap";

export async function onRequestGet({ request, env }) {
  if (!env.AMAP_SECURITY_CODE) {
    return json({ error: "AMAP_SECURITY_CODE is not configured" }, { status: 503 });
  }

  const requestUrl = new URL(request.url);
  const upstreamPath = requestUrl.pathname.slice(AMAP_PROXY_PATH.length);
  if (!upstreamPath.startsWith("/") || upstreamPath.includes("..")) {
    return json({ error: "Invalid AMap service path" }, { status: 400 });
  }

  const upstreamHost = upstreamPath.startsWith("/v4/map/styles")
    ? "webapi.amap.com"
    : "restapi.amap.com";
  const upstreamUrl = new URL(upstreamPath, `https://${upstreamHost}`);
  requestUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.append(key, value);
  });
  upstreamUrl.searchParams.set("jscode", env.AMAP_SECURITY_CODE);

  const response = await fetch(upstreamUrl, {
    headers: {
      accept: request.headers.get("accept") ?? "application/json",
    },
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json; charset=utf-8",
      "cache-control": "private, max-age=60",
    },
  });
}

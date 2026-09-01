import { requirePhotoBucket } from "../_shared/photos";

const isPublicPhotoKey = (key) =>
  /^photos\/[a-z0-9][a-z0-9-]{1,79}\/day-\d{2}\/[a-f0-9-]{36}\/(?:original\.(?:jpg|png|webp)|thumbnail\.webp)$/.test(key);

export async function onRequestGet({ request, env, waitUntil }) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key") ?? "";
  if (!isPublicPhotoKey(key)) {
    return new Response("Not found", { status: 404 });
  }

  const cache = caches.default;
  const cacheKey = new Request(request.url, { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const object = await requirePhotoBucket(env).get(key, {
    onlyIf: request.headers,
  });
  if (!object) return new Response("Not found", { status: 404 });
  if (!object.body) return new Response(null, { status: 304 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=86400, immutable");
  headers.set("x-content-type-options", "nosniff");
  const response = new Response(object.body, { headers });
  waitUntil?.(cache.put(cacheKey, response.clone()));
  return response;
}

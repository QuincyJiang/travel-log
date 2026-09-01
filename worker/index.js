import {
  onRequestGet as listPhotos,
} from "../functions/api/photos";
import {
  onRequestDelete as deletePhotos,
  onRequestPatch as updateFeaturedPhoto,
  onRequestPost as uploadPhotos,
  onRequestPut as rebuildPhotoThumbnail,
} from "../functions/api/admin/photos";
import { onRequestGet as getPhotoFile } from "../functions/api/photo-file";
import { onRequestGet as getTrips } from "../functions/api/trips";
import { onRequestGet as proxyAmap } from "../functions/api/amap";
import { json } from "../functions/_shared/photos";

const methodNotAllowed = () =>
  json({ error: "Method not allowed" }, { status: 405 });

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const context = {
      request,
      env,
      waitUntil: (promise) => ctx.waitUntil(promise),
    };

    if (url.pathname === "/api/photos") {
      if (request.method === "GET") return listPhotos(context);
      return methodNotAllowed();
    }

    if (url.pathname === "/api/trips") {
      if (request.method === "GET") return getTrips(context);
      return methodNotAllowed();
    }

    if (url.pathname.startsWith("/api/amap/")) {
      if (request.method === "GET") return proxyAmap(context);
      return methodNotAllowed();
    }

    if (url.pathname === "/api/admin/photos") {
      if (request.method === "POST") return uploadPhotos(context);
      if (request.method === "PUT") return rebuildPhotoThumbnail(context);
      if (request.method === "PATCH") return updateFeaturedPhoto(context);
      if (request.method === "DELETE") return deletePhotos(context);
      return methodNotAllowed();
    }

    if (url.pathname === "/api/photo-file") {
      return request.method === "GET" ? getPhotoFile(context) : methodNotAllowed();
    }

    return env.ASSETS.fetch(request);
  },
};

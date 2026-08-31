import {
  onRequestGet as listPhotos,
} from "../functions/api/photos";
import {
  onRequestDelete as deletePhotos,
  onRequestPatch as updateFeaturedPhoto,
  onRequestPost as uploadPhotos,
} from "../functions/api/admin/photos";
import { onRequestGet as getPhotoFile } from "../functions/api/photo-file";
import { json } from "../functions/_shared/photos";

const methodNotAllowed = () =>
  json({ error: "Method not allowed" }, { status: 405 });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const context = { request, env };

    if (url.pathname === "/api/photos") {
      if (request.method === "GET") return listPhotos(context);
      return methodNotAllowed();
    }

    if (url.pathname === "/api/admin/photos") {
      if (request.method === "POST") return uploadPhotos(context);
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

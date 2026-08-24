// The gallery's seed data, proxied rather than linked.
//
// The manifest holds every photo's blob URL, timestamp and GPS position, so its
// own URL is the master key to the album. Serving it through this route keeps
// that URL on the server: the browser only ever sees the contents, and only
// after the middleware has checked the login cookie.
//
// ~540 KB, changing only when the curation is re-run — hence the ETag, which
// turns every repeat visit into a 304.

import { getManifest, galleryConfigured } from "@/lib/photos";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!galleryConfigured) {
    return Response.json(
      { configured: false, error: "PHOTO_MANIFEST_URL not set" },
      { status: 503 }
    );
  }

  let manifest;
  try {
    manifest = await getManifest();
  } catch {
    return Response.json({ error: "manifest unavailable" }, { status: 502 });
  }

  const etag = `W/"${manifest.built}"`;
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } });
  }

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/json",
      ETag: etag,
      // Revalidate on every visit but ride the 304 — a re-seed must show up
      // without anyone clearing a cache.
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}

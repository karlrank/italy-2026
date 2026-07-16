// Offline support: on the road in Italy the site must open without a
// network — it holds the addresses, reservation numbers, and phone numbers.
//
// Strategy:
//   - /_next/static/*  → cache-first (hashed filenames, immutable)
//   - navigations + /api/* GETs → network-first, falling back to the last
//     cached copy (so the itinerary and last-known flight status work
//     offline); offline navigation falls back to the cached front page
//   - only same-origin GETs are touched; auth requests are never cached
const CACHE = "italy2026-v1";
const PRECACHE = ["/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // Precache is best-effort: "/" redirects to /login when logged out,
      // and addAll rejects on redirects — runtime caching covers it later.
      .then((c) => c.addAll(PRECACHE).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/api/auth")) return;

  // Hashed build assets never change → serve from cache, fill on miss
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
      )
    );
    return;
  }

  const isNavigation = req.mode === "navigate";
  const isApi = url.pathname.startsWith("/api/");
  if (!isNavigation && !isApi) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        // Don't cache redirects: serving a cached redirected response to a
        // navigation throws, and login redirects must stay live anyway
        if (res.ok && !res.redirected) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(async () => {
        const hit = await caches.match(req);
        if (hit) return hit;
        // Offline navigation to any path → show the cached front page
        if (isNavigation) {
          const home = await caches.match("/");
          if (home) return home;
        }
        return Response.error();
      })
  );
});

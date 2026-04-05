const CACHE = "price-tracker-v1";
const ASSETS = ["./", "./index.html", "./pt-manifest.json", "./pt-icon-192.png", "./pt-icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = e.request.url;
  if (url.includes("firebase") || url.includes("gstatic") || url.includes("cloudflare")) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (url.startsWith(self.location.origin)) {
        caches.open(CACHE).then(c => c.put(e.request, res.clone()));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});

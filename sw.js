const PREFIX = "zavyshenie-pwa-";
const CACHE = PREFIX + 'v1';
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./jszip.min.js"];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith(PREFIX) && key !== CACHE)
      .map((key) => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  const scopePath = new URL(self.registration.scope).pathname;
  if (request.method !== 'GET' || url.origin !== self.location.origin ||
      !url.pathname.startsWith(scopePath)) return;
  event.respondWith(caches.match(request).then(async (cached) => {
    if (cached) return cached;
    try { return await fetch(request); }
    catch (err) {
      if (request.mode === 'navigate') {
        const fallback = await caches.match('./index.html');
        if (fallback) return fallback;
      }
      throw err;
    }
  }));
});

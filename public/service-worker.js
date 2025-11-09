/* public/service-worker.js */
const CACHE = 'jd66-v7';
const BASE = '/JD_66';                     // <-- important

const PRECACHE = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/manifest.json`,
  `${BASE}/icons/icon-192.png`,
  `${BASE}/icons/icon-512.png`
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // ignore cross-origin or non-GET
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // only handle requests inside our scope
  if (!url.pathname.startsWith(BASE)) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(net => {
        if (net && net.status === 200) {
          caches.open(CACHE).then(c => c.put(e.request, net.clone()));
        }
        return net;
      });
    }).catch(() => caches.match(`${BASE}/index.html`))
  );
});

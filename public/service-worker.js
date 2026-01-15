/* public/service-worker.js */
const CACHE_NAME = 'jd66-v13';  // ← always change this when you update the SW logic
const BASE = '/JD_66';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // We only precache critical static shell – the rest we'll cache on demand
      return cache.addAll([
        `${BASE}/`,
        `${BASE}/index.html`,
        `${BASE}/manifest.json`,
        `${BASE}/icons/icon-192.png`,
        `${BASE}/icons/icon-512.png`,
        `${BASE}/icons/background_picture.jpg`,
        `${BASE}/icons/background_picture2.jpg`,
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
                 .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only handle same-origin GET requests in our base path
  if (event.request.method !== 'GET' || 
      url.origin !== self.location.origin || 
      !url.pathname.startsWith(BASE)) {
    return;
  }

  // Network first strategy with cache fallback – best for apps with hashed assets
  event.respondWith(
    fetch(event.request).then(networkResponse => {
      // Clone and cache successful responses
      if (networkResponse && networkResponse.status === 200) {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
      }
      return networkResponse;
    }).catch(() => {
      // When offline → try cache, fall back to index.html for SPA routing
      return caches.match(event.request).then(cachedResponse => {
        return cachedResponse || caches.match(`${BASE}/index.html`);
      });
    })
  );
});

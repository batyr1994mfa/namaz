const CACHE_NAME = 'namaz-v2';
const urlsToCache = [
  './',
  './index.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).then(resp => {
      const respClone = resp.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(e.request, respClone));
      return resp;
    }).catch(() => caches.match(e.request))
  );
});

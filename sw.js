const CACHE_NAME = 'namaz-v3';
const urlsToCache = [
  './',
  './index.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
      .catch(err => console.error('SW install cache error:', err))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // Навигация (открытие/перезагрузка самой страницы).
  // Независимо от точного URL (со слэшем на конце или без) всегда
  // отдаём закэшированный index.html, если нет сети.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          const respClone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', respClone));
          return resp;
        })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  // Остальные запросы (если появятся) — сначала сеть, при неудаче кэш
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, respClone));
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});

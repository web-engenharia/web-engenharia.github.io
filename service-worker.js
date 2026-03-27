const CACHE_NAME = 'engenharia-2026-v12';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/landing.css',
  '/js/main.js',
  // Adicione outros arquivos essenciais
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Markdown is loaded via fetch() from article pages; never serve from cache
  // (avoids stale or missing responses after deploy).
  if (url.pathname.endsWith('.md')) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

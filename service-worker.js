const CACHE_NAME = 'engenharia-2026-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/landing.css',
  '/js/main.js',
  // Adicione outros arquivos essenciais
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

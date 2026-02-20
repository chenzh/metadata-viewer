const CACHE_NAME = 'nowifigames-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/index-BVmUMZyY.js',
  '/assets/index-CDuFmqZL.css',
  '/games/snake.html',
  '/games/tetris.html',
  '/games/invaders.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

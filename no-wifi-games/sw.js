const CACHE_NAME = 'no-wifi-games-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-192x192.png',
  '/games/game-2048.html',
  '/games/tetris.html',
  '/games/sudoku.html',
  '/games/klotski.html',
  '/games/sokoban.html',
  '/games/snake.html',
  '/games/minesweeper.html',
  '/games/match3.html',
  '/games/slidingpuzzle.html',
  '/games/tower.html',
  '/games/flappy.html',
  '/games/breakout.html',
  '/games/invaders.html',
  '/games/shooter.html',
  '/games/dino.html',
  '/games/pacman.html',
  '/games/asteroids.html',
  '/games/colorjump.html',
  '/games/memory.html',
  '/games/linkup.html',
  '/games/gomoku.html',
  '/games/chess.html',
  '/games/checkers.html',
  '/games/tictactoe.html',
  '/games/reversi.html',
  '/games/dots.html',
  '/games/pinball.html',
  '/games/pong.html',
  '/games/maze.html',
  '/games/solitaire.html',
  '/games/puzzle.html',
  '/games/guessnumber.html',
  '/games/hangman.html',
  '/games/simon.html',
  '/games/wordle.html'
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => {
        console.log('Cache install failed:', err);
      })
  );
  self.skipWaiting();
});

// Activate - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - serve from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((fetchResponse) => {
            // Cache new requests
            if (fetchResponse.status === 200) {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return fetchResponse;
          })
          .catch(() => {
            // Return offline fallback if available
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

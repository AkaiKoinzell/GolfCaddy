const CACHE_NAME = 'golfcaddy-cache-v1';
const ASSETS = [
  '/',
  '/home.html',
  '/index.html',
  '/clubs.html',
  '/search.html',
  '/round.html',
  '/profile1.html',
  '/stats.html',
  '/admin.html',
  '/styles/base.css',
  '/styles/home.css',
  '/styles/index.css',
  '/styles/stats.css',
  '/styles/clubs.css',
  '/styles/profile.css',
  '/styles/admin.css',
  '/styles/round.css',
  '/manifest.json',
  '/favicon/android-chrome-192x192.png',
  '/favicon/android-chrome-512x512.png',
  '/favicon/favicon-32x32.png',
  '/favicon/favicon-16x16.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});

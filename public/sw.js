const CACHE_NAME = 'behalf-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.svg',
  '/pwa-512x512.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  // Network first, falling back to cache strategy
  // We don't want to aggressively cache API calls, but we do want to serve basic assets offline.
  
  const { request } = event;
  
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests bypassing cache
  if (request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        // If valid, clone and put in cache
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(request, responseToCache);
          });
          
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(request).then(response => {
          if (response) {
            return response;
          }
          // Optional: Return an offline fallback page here if we had one
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

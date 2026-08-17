/**
 * ============================================================================
 * NEXUS MANAGER — PROGRESSIVE WEB APP SERVICE WORKER (v1.0)
 * ============================================================================
 */

const CACHE_NAME = 'nexus-pwa-shell-v1';
const PRECACHE_ASSETS = [
  '/',
  '/hub',
  '/areas',
  '/alerts',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.svg',
];

// 1. Install Event: Pre-cache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Nexus PWA Service Worker] Pre-caching offline shell');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Nexus PWA Service Worker] Removing outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Network-first with Cache fallback for fast resiliency
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-GET requests and chrome extensions
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // Handle navigation (HTML page requests)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallbackHub = await caches.match('/hub');
          if (fallbackHub) return fallbackHub;
          return new Response('<h1>Nexus Manager Offline</h1><p>Conexão com o servidor indisponível.</p>', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        })
    );
    return;
  }

  // Static Assets (CSS, JS, SVG, Fonts): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

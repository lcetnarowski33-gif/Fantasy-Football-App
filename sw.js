/**
 * Progressive Web App (PWA) Service Worker
 * Project: Fantasy League Analytics
 * 
 * Strategy:
 * 1. HTML Documents (Navigations): Network-First with Cache fallback.
 *    Guarantees users always see the latest deployment without getting stuck on old code.
 * 2. Static Assets (CSS, JS, Icons, Images, Fonts): Stale-While-Revalidate.
 *    Provides instant offline-ready loading while updating assets in the background.
 * 3. REST API & SSE Live Streams (/api/*): Network-Only.
 *    Bypasses cache completely so ESPN live sync and real-time scores are always fresh.
 */

const CACHE_NAME = 'fantasy-analytics-v1.0.1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/src/css/main.css',
  '/src/css/components.css',
  '/src/css/pages.css',
  '/src/js/data/mockData.js',
  '/src/js/analyticsEngine.js',
  '/src/js/store.js',
  '/src/js/components/ChartManager.js',
  '/src/js/components/Header.js',
  '/src/js/components/Ticker.js',
  '/src/js/components/SearchModal.js',
  '/src/js/views/HomeView.js',
  '/src/js/views/LeagueView.js',
  '/src/js/views/TeamView.js',
  '/src/js/views/PlayerView.js',
  '/src/js/views/AnalyticsView.js',
  '/src/js/views/H2HView.js',
  '/src/js/views/RecordsView.js',
  '/src/js/views/TradeView.js',
  '/src/js/views/FreeAgencyView.js',
  '/src/js/views/DraftView.js',
  '/src/js/views/MatchupView.js',
  '/src/js/views/EfficiencyView.js',
  '/src/js/pwa.js',
  '/src/js/app.js',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/favicon-32x32.png',
  '/icons/icon.svg'
];

// Install: Pre-cache essential app shell assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching core application shell');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Pre-cache partial warning:', err);
      });
    })
  );
});

// Activate: Clean up outdated caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing outdated cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch routing
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Never cache non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // 2. Never cache REST API calls, SSE live stream, or ESPN sync endpoints
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 3. HTML Navigations: Network-First with Cache Fallback
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/index.html').then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // 4. Static Assets (CSS, JS, Fonts, Icons, Images): Stale-While-Revalidate
  const isStaticAsset = (
    url.origin === self.location.origin ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('cdnjs.cloudflare.com') ||
    url.hostname.includes('cdn.jsdelivr.net')
  );

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => null);

        // Return cached asset immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      })
    );
  }
});

// Allow clients to trigger skipWaiting manually
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

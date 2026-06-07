/**
 * WanderPlan Offline Service Worker
 * Ensures static assets, Unsplash travel cover images, fonts, and open-source map tiles remain locally cached.
 */

const CORE_CACHE_NAME = 'wanderplan-core-v1';
const DYNAMIC_CACHE_NAME = 'wanderplan-runtime-v1';
const MAPS_CACHE_NAME = 'wanderplan-maps-v1';

// Assets to precache on registration
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
];

// installation caching the shell structure
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE_NAME).then((cache) => {
      console.log('[WanderPlan SW] Precaching application frame shell');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// activate worker and clean up older outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CORE_CACHE_NAME && cache !== DYNAMIC_CACHE_NAME && cache !== MAPS_CACHE_NAME) {
            console.log('[WanderPlan SW] Pruning historical cache target:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// intercept network transactions
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // 1. Bypass Service Worker entirely for the app's Express APIs & authentication endpoints
  if (url.pathname.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. Map Tiles Caching Strategy (Cache-First with Network Revalidation in the background)
  // This captures 'basemaps.cartocdn.com' and 'tile.openstreetmap.org' tile server requests!
  if (
    url.hostname.includes('tile.openstreetmap.org') ||
    url.hostname.includes('basemaps.cartocdn.com') ||
    url.pathname.includes('rastertiles')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(MAPS_CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        }).catch((err) => {
          console.warn('[WanderPlan SW] Map tile network load error (offline mode):', err);
        });

        // Serve immediate cache and update cache in background, or fetch from network if missing
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Fonts and Remote Destination Images Caching Strategy (Stale-While-Revalidate)
  // This keeps beautiful Google Web Fonts and Unsplash trip cover photos stored offline!
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('images.unsplash.com')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        }).catch(() => null);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. Standard Application Assets (Stale-While-Revalidate with SPA Navigation Fallback)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache success static assets locally
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        // Network failed! Check if this is a main navigation route request (SPA routes)
        if (event.request.mode === 'navigate') {
          console.log('[WanderPlan SW] Offline page navigation. Serving index.html template shell.');
          return caches.match('/index.html') || caches.match('/');
        }
        throw err;
      });

      return cachedResponse || fetchPromise;
    })
  );
});

const CACHE_NAME = 'clima-now-v1.0.0';
const STATIC_CACHE_NAME = 'clima-now-static-v1.0.0';
const RUNTIME_CACHE_NAME = 'clima-now-runtime-v1.0.0';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.openweathermap\.org/,
  /^https:\/\/tile\.openweathermap\.org/
];

// Cache duration settings (in milliseconds)
const CACHE_DURATIONS = {
  weather: 10 * 60 * 1000, // 10 minutes
  forecast: 30 * 60 * 1000, // 30 minutes
  static: 24 * 60 * 60 * 1000, // 24 hours
  tiles: 60 * 60 * 1000 // 1 hour
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== RUNTIME_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all pages
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isWeatherAPI(url)) {
    event.respondWith(handleWeatherAPI(request));
  } else if (isMapTile(url)) {
    event.respondWith(handleMapTile(request));
  } else {
    event.respondWith(handleOtherRequests(request));
  }
});

// Background sync for offline data updates
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'weather-data-sync') {
    event.waitUntil(syncWeatherData());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body || 'Weather update available',
    icon: '/logo192.png',
    badge: '/favicon.ico',
    tag: data.tag || 'weather-update',
    data: data,
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/icon-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon-dismiss.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ClimaNow', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  const { notification, action } = event;
  
  console.log('[SW] Notification clicked:', action);
  
  event.notification.close();
  
  if (action === 'view') {
    event.waitUntil(
      clients.openWindow(notification.data?.url || '/')
    );
  }
});

// Helper functions
function isStaticAsset(url) {
  return url.origin === self.location.origin &&
         (url.pathname.includes('/static/') || 
          url.pathname === '/' || 
          url.pathname.includes('/manifest.json') ||
          url.pathname.includes('/favicon.ico') ||
          url.pathname.includes('/logo'));
}

function isWeatherAPI(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.href));
}

function isMapTile(url) {
  return url.hostname === 'tile.openweathermap.org' ||
         url.hostname.includes('openstreetmap.org');
}

// Static asset handling - Cache First strategy
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Optionally update cache in background for HTML files
      if (request.destination === 'document') {
        fetch(request).then(response => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
        }).catch(() => {
          // Network failed, use cached version
        });
      }
      return cachedResponse;
    }

    // If not in cache, fetch from network
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Static asset fetch failed:', error);
    // Return offline fallback if available
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Weather API handling - Network First with cache fallback
async function handleWeatherAPI(request) {
  const cache = await caches.open(RUNTIME_CACHE_NAME);
  
  try {
    // Try network first
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful responses with timestamp
      const responseToCache = response.clone();
      const cacheEntry = {
        response: responseToCache,
        timestamp: Date.now(),
        url: request.url
      };
      
      // Add timestamp header for cache validation
      const responseWithTimestamp = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'sw-cached-at': Date.now().toString()
        }
      });
      
      cache.put(request, responseWithTimestamp.clone());
      return response;
    }
    
    throw new Error(`Network response not ok: ${response.status}`);
  } catch (error) {
    console.log('[SW] Network request failed, trying cache:', error);
    
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      const cachedAt = cachedResponse.headers.get('sw-cached-at');
      const cacheAge = Date.now() - parseInt(cachedAt || '0');
      
      // Determine cache validity based on endpoint
      let maxAge = CACHE_DURATIONS.weather;
      if (request.url.includes('forecast')) {
        maxAge = CACHE_DURATIONS.forecast;
      }
      
      if (cacheAge < maxAge) {
        console.log('[SW] Returning fresh cached weather data');
        return cachedResponse;
      } else {
        console.log('[SW] Cached data is stale, but returning anyway (offline)');
        // Add header to indicate stale data
        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers: {
            ...Object.fromEntries(cachedResponse.headers.entries()),
            'sw-cache-status': 'stale'
          }
        });
      }
    }
    
    // No cache available, return error
    return new Response(
      JSON.stringify({ 
        error: 'No weather data available offline',
        offline: true 
      }), 
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Map tile handling - Cache First strategy
async function handleMapTile(request) {
  const cache = await caches.open(RUNTIME_CACHE_NAME);
  
  try {
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Update cache in background if tile is older than 1 hour
      const cachedAt = cachedResponse.headers.get('sw-cached-at');
      const cacheAge = Date.now() - parseInt(cachedAt || '0');
      
      if (cacheAge > CACHE_DURATIONS.tiles) {
        fetch(request).then(response => {
          if (response.ok) {
            const responseWithTimestamp = new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers: {
                ...Object.fromEntries(response.headers.entries()),
                'sw-cached-at': Date.now().toString()
              }
            });
            cache.put(request, responseWithTimestamp);
          }
        }).catch(() => {
          // Background update failed, continue with cached version
        });
      }
      
      return cachedResponse;
    }

    // Not in cache, fetch from network
    const response = await fetch(request);
    
    if (response.ok) {
      const responseWithTimestamp = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'sw-cached-at': Date.now().toString()
        }
      });
      cache.put(request, responseWithTimestamp.clone());
      return response;
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Map tile request failed:', error);
    return new Response('Tile unavailable', { status: 503 });
  }
}

// Other requests - Network First
async function handleOtherRequests(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.log('[SW] Other request failed:', error);
    return new Response('Resource unavailable', { status: 503 });
  }
}

// Background sync for weather data
async function syncWeatherData() {
  console.log('[SW] Syncing weather data in background');
  
  try {
    // Get stored location from IndexedDB or localStorage
    const location = await getStoredLocation();
    
    if (location) {
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${getApiKey()}&units=metric`;
      
      const response = await fetch(weatherUrl);
      
      if (response.ok) {
        const cache = await caches.open(RUNTIME_CACHE_NAME);
        await cache.put(weatherUrl, response.clone());
        console.log('[SW] Background weather sync successful');
        
        // Send update to all clients
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'WEATHER_DATA_UPDATED',
            data: response.json()
          });
        });
      }
    }
  } catch (error) {
    console.log('[SW] Background sync failed:', error);
  }
}

// Helper to get stored location (simplified - in real app would use IndexedDB)
async function getStoredLocation() {
  // This would typically read from IndexedDB
  // For now, return null - actual implementation would fetch from storage
  return null;
}

// Helper to get API key (simplified - in real app would be more secure)
function getApiKey() {
  // This should be handled more securely in production
  return 'YOUR_API_KEY_HERE';
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'REQUEST_SYNC':
        if ('sync' in self.registration) {
          self.registration.sync.register('weather-data-sync');
        }
        break;
      default:
        console.log('[SW] Unknown message type:', event.data.type);
    }
  }
});

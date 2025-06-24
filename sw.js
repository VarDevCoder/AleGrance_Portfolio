// Service Worker para Portfolio de Alejandra Grance
// Optimizado para performance en mobile

const CACHE_NAME = 'alejandra-portfolio-v1.2';
const STATIC_CACHE = 'static-v1.2';
const DYNAMIC_CACHE = 'dynamic-v1.2';

// Recursos críticos que se cachean inmediatamente
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/images/alejandra-profile.jpg',
  '/images/alejandra-profile.webp',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Recursos que se cachean dinámicamente
const DYNAMIC_ASSETS_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /\.(?:css|js)$/,
  /fonts\.googleapis\.com/,
  /cdnjs\.cloudflare\.com/
];

// Install event - Cache recursos críticos
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Error caching static assets:', error);
      })
  );
});

// Activate event - Limpiar caches antiguos
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Cache cleanup complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - Estrategia de cache
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo cachear requests GET
  if (request.method !== 'GET') return;
  
  // Skip para chrome-extension y otros protocolos
  if (!url.protocol.startsWith('http')) return;
  
  // Estrategia Cache First para recursos estáticos
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Estrategia Network First para páginas HTML
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Estrategia Stale While Revalidate para otros recursos
  event.respondWith(staleWhileRevalidate(request));
});

// Cache First Strategy - Para recursos estáticos
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    // Cachear si la respuesta es válida
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    
    // Fallback para imágenes
    if (request.url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f0f0f0"/><text x="200" y="200" text-anchor="middle" fill="#666" font-family="Arial" font-size="14">Imagen no disponible</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    throw error;
  }
}

// Network First Strategy - Para páginas HTML
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Network first failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback offline page
    return new Response(
      `<!DOCTYPE html>
       <html>
       <head>
         <title>Sin conexión - Portfolio Alejandra</title>
         <meta name="viewport" content="width=device-width, initial-scale=1">
         <style>
           body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
           .offline { color: #666; margin-top: 2rem; }
         </style>
       </head>
       <body>
         <h1>Portfolio de Alejandra Grance</h1>
         <div class="offline">
           <h2>Sin conexión a Internet</h2>
           <p>Por favor, verifica tu conexión e intenta nuevamente.</p>
         </div>
       </body>
       </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Fetch en background para actualizar cache
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(error => {
    console.error('[SW] Background fetch failed:', error);
  });
  
  // Retornar cache si existe, sino esperar network
  return cachedResponse || fetchPromise;
}

// Helper function para identificar recursos estáticos
function isStaticAsset(url) {
  return STATIC_ASSETS.includes(url) || 
         DYNAMIC_ASSETS_PATTERNS.some(pattern => pattern.test(url));
}

// Message handler para comunicación con la página
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'GET_CACHE_SIZE') {
    getCacheSize().then(size => {
      event.ports[0].postMessage({ size });
    });
  }
});

// Obtener tamaño del cache
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}

// Cleanup automático del cache (ejecutar periódicamente)
self.addEventListener('sync', event => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupOldCache());
  }
});

async function cleanupOldCache() {
  const cache = await caches.open(DYNAMIC_CACHE);
  const requests = await cache.keys();
  
  // Mantener solo los últimos 50 recursos dinámicos
  if (requests.length > 50) {
    const requestsToDelete = requests.slice(0, requests.length - 50);
    await Promise.all(
      requestsToDelete.map(request => cache.delete(request))
    );
    console.log(`[SW] Cleaned up ${requestsToDelete.length} old cache entries`);
  }
}

// Error handler global
self.addEventListener('error', event => {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('[SW] Unhandled rejection:', event.reason);
});

console.log('[SW] Service Worker registered successfully'); 
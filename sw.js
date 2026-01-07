const CACHE_NAME = 'ajedrez-siurot-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://raw.githubusercontent.com/ManuelVS8/Ajedrez_Equipos/refs/heads/main/Torneo_ajedrez.ico',
  'https://raw.githubusercontent.com/ManuelVS8/Efectos_audio/raw/37b3eb2da9c15c04dfb71dfe1be60f088ea3cdfc/Tap.mp3'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activación y limpieza de caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Estrategia de red: Cache First
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones no GET (como el POST a Google Scripts)
  if (event.request.method !== 'GET') {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        // Guardar en cache si la respuesta es válida
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
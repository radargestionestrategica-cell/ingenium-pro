// Service worker básico de INGENIUM PRO — cachea solo assets estáticos
// (bundles de _next/static, íconos, manifest, fuentes/CSS) para acelerar
// visitas repetidas. Nunca cachea /api/*, métodos no-GET, ni navegaciones
// de página (HTML) — cálculos y telemetría siempre se piden frescos al server.

const CACHE_NAME = 'ingenium-static-v1';

// Assets estables (no hasheados) que se pueden precachear de entrada.
const PRECACHE_URLS = [
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {}),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
      self.clients.claim(),
    ]),
  );
});

function esAssetEstatico(url) {
  if (url.pathname.startsWith('/_next/static/')) return true;
  if (PRECACHE_URLS.includes(url.pathname)) return true;
  return /\.(?:css|js|mjs|woff2?|ttf|otf|svg|png|jpg|jpeg|gif|ico)$/.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Nunca interceptar métodos que no sean GET (POST de cálculos, telemetría, auth, etc.)
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Nunca interceptar peticiones a otro origen.
  if (url.origin !== self.location.origin) return;

  // Nunca interceptar la API — cálculos, telemetría y datos siempre frescos.
  if (url.pathname.startsWith('/api/')) return;

  // Nunca interceptar navegaciones de página (HTML) — dashboard, telemetría
  // y módulos siempre se piden frescos al server.
  if (request.mode === 'navigate') return;

  if (!esAssetEstatico(url)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cacheada = await cache.match(request);
      if (cacheada) {
        // Stale-while-revalidate: se devuelve lo cacheado ya mismo y se
        // refresca en segundo plano para la próxima visita.
        event.waitUntil(
          fetch(request)
            .then((res) => {
              if (res.ok) cache.put(request, res.clone());
            })
            .catch(() => {}),
        );
        return cacheada;
      }
      const res = await fetch(request);
      if (res.ok) cache.put(request, res.clone());
      return res;
    }),
  );
});

/* Service worker del dashboard (PWA).
 *
 * Estrategia:
 *  - Navegaciones (cargar la página): network-first con fallback a la shell
 *    cacheada (index.html) si no hay red → la app abre estando offline.
 *  - Assets estáticos del MISMO origen (/assets/*, iconos, css/js): cache-first
 *    con revalidación en segundo plano (stale-while-revalidate).
 *  - Peticiones a otro origen (el backend Flask/WebSocket vía su URL o ngrok):
 *    NO se interceptan; van siempre a la red. Así nunca se cachean datos del bot.
 *
 * Sube CACHE_VERSION cuando cambie la lista de precache o la estrategia para
 * forzar la limpieza de cachés antiguas.
 */
const CACHE_VERSION = 'v2'
const CACHE_NAME = `bottrading-${CACHE_VERSION}`

// Shell mínima que se intenta precachear en la instalación.
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/logo.png',
  '/favicon.png',
  '/pwa-192.png',
  '/pwa-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      // Precache resiliente: si algún recurso falla, no se aborta la instalación.
      await Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
        )
      )
      await self.skipWaiting()
    })()
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
      await self.clients.claim()
    })()
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Solo gestionamos el mismo origen. El backend (API/WebSocket) queda intacto.
  if (url.origin !== self.location.origin) return

  // Navegaciones → network-first con fallback a la shell cacheada.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request)
          const cache = await caches.open(CACHE_NAME)
          cache.put('/index.html', fresh.clone()).catch(() => {})
          return fresh
        } catch {
          const cache = await caches.open(CACHE_NAME)
          return (
            (await cache.match(request)) ||
            (await cache.match('/index.html')) ||
            (await cache.match('/')) ||
            Response.error()
          )
        }
      })()
    )
    return
  }

  // Resto de GET del mismo origen → stale-while-revalidate.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      const cached = await cache.match(request)
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            cache.put(request, response.clone()).catch(() => {})
          }
          return response
        })
        .catch(() => undefined)
      return cached || (await network) || Response.error()
    })()
  )
})

// Permite activar el SW nuevo de inmediato desde la página (botón "actualizar").
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})

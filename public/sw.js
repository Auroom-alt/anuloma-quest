const CACHE = 'anuloma-v1';

// Файлы которые кэшируем сразу при установке
const PRECACHE = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  // Удаляем старые кэши
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Только GET запросы, не трогаем Supabase API
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('supabase.co')) return;

  e.respondWith(
    caches.match(e.request)
      .then(cached => {
        // Network first для навигации (свежий HTML)
        // Cache first для статики (картинки, звуки)
        const isNavigation = e.request.mode === 'navigate';

        if (isNavigation) {
          return fetch(e.request)
            .then(res => {
              const clone = res.clone();
              caches.open(CACHE).then(c => c.put(e.request, clone));
              return res;
            })
            .catch(() => cached || caches.match('/'));
        }

        // Cache first для статики
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (!res || res.status !== 200) return res;
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        });
      })
  );
});
// Guarda la app en el móvil para que abra sin internet.
// Si cambias index.html, sube también este archivo cambiando el número de versión.
const CACHE = 'mediciones-vivero-v1';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero lo guardado (abre al instante aunque no haya red) y, si hay red, se actualiza en segundo plano.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // Google Sheets no pasa por aquí
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(guardado => {
      const red = fetch(e.request).then(r => {
        if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); }
        return r;
      }).catch(() => guardado || caches.match('./index.html'));
      return guardado || red;
    })
  );
});

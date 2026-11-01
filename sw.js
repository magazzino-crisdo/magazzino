/* Tiene la pagina sul telefono per aprirla anche senza rete.
   I dati dei carrelli NON passano da qui: vanno direttamente allo script Google. */
var CACHE = 'magazzino-v4';
var FILE = ['./', 'index.html', 'config.js', 'icone.js', 'manifest.webmanifest', 'icona-192.png', 'icona-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) {
    return Promise.all(k.filter(function (n) { return n !== CACHE; }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});
/* Pagina dalla memoria del telefono, aggiornata in background quando c'è rete. */
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(e.request, { ignoreSearch: true }).then(function (inCache) {
      var rete = fetch(e.request).then(function (r) { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(function () { return inCache; });
      return inCache || rete;
    });
  }));
});

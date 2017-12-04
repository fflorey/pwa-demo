var cacheName = 'pwa-step-1-0';
var filesToCache = [
  '/',
  'index.html',
  'app.js',
  '/app.js',
  'css/materialize.css',
  'css/style.css',
  'js/init.js',
  'js/materialize.js',
  'js/jquery-2.1.1.min.js'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install - pwa-step1');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell (pwa)');
      return cache.addAll(filesToCache);
    }).catch( (result) => {
      console.log('catch error: ' + result);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate Install - pwa-step1');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    console.log('[ServiceWorker] Fetch', e.request.url);
    e.respondWith(fetch(e.request));
});

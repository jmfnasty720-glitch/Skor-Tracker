// Skor Tracker Service Worker V1.3.2
const CACHE_NAME = 'skor-tracker-v1-3-2';
const ASSETS = ['./', './index.html', './manifest.json', './icon.png', './html2canvas_min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('firestore') || e.request.url.includes('firebase') || e.request.url.includes('googleapis')) {
    return; // Let Firebase/Google fonts use the network directly
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request).then(res => {
        if (res && res.status === 200 && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});

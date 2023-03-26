const CACHE_NAME = `temperature-converter-v4`;
const FILES_TO_CACHE = [
  './temp-converter.html',
  './converter.js',
  './converter.css'
];   


// Use the install event to pre-cache all initial resources.
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    cache.addAll([
      './temp-converter.html',
      './converter.js',
      './converter.css'
    ]);
  })());
});

self.addEventListener('fetch', event => {
  console.log('fetch event for ' + event.request    )
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Get the resource from the cache.
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    } else {
        try {
          // If the resource was not in the cache, try the network.
          const fetchResponse = await fetch(event.request);
    
          // Save the resource in the cache and return it.
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        } catch (e) {
          // The network failed
        }
    }
  })());
});

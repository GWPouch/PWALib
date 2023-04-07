//alert('at top of sw4.js')
self.console.log('at top of sw4.js');
const CACHE_NAME = `temperature-converter-v4`;
const FILES_TO_CACHE = [
  './temp-converter.html',
  './converter.js',
  './converter.css'
];   

function NowISO8601( ){  return( ( new Date() ).toISOString()    ); }

self.console.log('outside any function in sw.js,  probably in some register service worker stuff' + NowISO8601()  );

// Use the install event to pre-cache all initial resources.
self.addEventListener('install', event => {
  console.log('In start of unnamed event listener for install  ' + NowISO8601() );
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
  let reqCopy = event.request.clone() ;
  let reqInfo = reqCopy.url;

  console.log('in unnamed fetch event for yyy ' + reqCopy.url  + ' ' + NowISO8601()  )
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

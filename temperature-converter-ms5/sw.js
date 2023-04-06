console.log('very top of sw.js');
const CACHE_NAME = `temperature-converter-v5`;
const FILES_TO_CACHE = [
  './temp-converter.html',
  './converter.js',
  './converter.css'
];   


function NowISO8601( ){  return( ( new Date() ).toISOString()    ); }

function serviceWorkersUnregisterAll(){
// from https://github.com/GoogleChromeLabs/sw-precache/issues/340
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
            registration.unregister()
            registration.terminate();
    }}).catch(function(err) {
        console.log('Service Worker registration failed: ', err);
    });
  }
}

function serviceWorkersAreAvailable(){ return( 'serviceWorker' in navigator ); }



console.log('outside any function in sw.js,  probably in some register service worker stuff' + NowISO8601()  ) ;
console.log('in sw.js, serviceWorkersAreAvailable() = ' + serviceWorkersAreAvailable() ) ;

function installEventHandler(event){
// Use the install event to pre-cache all initial resources.
  console.log('In start of installEventHandler for install  ' + NowISO8601() );
  event.waitUntil(  cacheRefresh2  );
}

async function cacheRefresh2(){
  const cache = await caches.open(CACHE_NAME);
  cache.addAll(FILES_TO_CACHE);
} 

self.addEventListener('install', installEventHandler);
      // // Use the install event to pre-cache all initial resources.
      // self.addEventListener('install', event => {
      //   console.log('In start of unnamed event listener for install  ' + NowISO8601() );
      //   event.waitUntil((async () => {
      //     const cache = await caches.open(CACHE_NAME);
      //     cache.addAll([
      //       './temp-converter.html',
      //       './converter.js',
      //       './converter.css'
      //     ]);
      //   })());
      // });




      
self.addEventListener('fetch', event => {
  console.log('in unnamed fetch event for ' + event.request.url  + ' ' + NowISO8601()  )
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

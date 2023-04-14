
self.console.log('at very top of sw4.js before any other code has run');

// general debugging helpers
const LF = "\n";
const EOL = " ;\n";
function NowISO8601( ){  return( ( new Date() ).toISOString()    ); }


function describeObject(obj){
  let retVal = 'Class: ' +  obj.constructor.name + EOL ;

  retVal = retVal + ' enumerableMembers: [ ' ;
  for(let key in obj){
    retVal = retVal + key + ' , ' ;
  }
  //get rid of final  ' , '   and replace with ];\n
  let iLast = retVal.lastIndexOf( ' , ');
  retVal = retVal.substring(0,iLast) + '];\n' ;


  retVal = retVal + ' nonEnumerableMembers: [ ' ;
  let listProps = Object.getOwnPropertyNames(obj);
  for(let key2 in listProps ){
    retVal = retVal + key2 + ' , ' ;
  }
  retVal = retVal  + '];\n' ;
  // //get rid of final  ' , '   and replace with ];\n
  //  iLast = retVal.lastIndexOf( ' , ');
  // retVal = retVal.substring(0,iLast) + '];\n' ;

  retVal = retVal  +  'allEnumerableMembers: [ ' ;
  for(let key3 in obj){
    //https://stackoverflow.com/questions/208016/how-to-list-the-properties-of-a-javascript-object/32413145#32413145
    retVal = retVal + key3 + ' , ' ; //stackoverflow claims this will get ancestor properties too
  }
  retVal = retVal  + '];\n' ;

  return(retVal);
} //end of describeObject

// end general debugging helpers


// begin ServiceWorker debugging helpers
function writeRequestToText(req){
  let reqCopy = req.clone();

  // output from describeObject
  //  Class: Request ;
  //  enumerableProperties: [ method , url , headers , destination , referrer , referrerPolicy , mode , credentials , cache , redirect , integrity , keepalive , signal , isHistoryNavigation , bodyUsed , arrayBuffer , blob , clone , formData , json , text]; 



    //  ,  , keepalive , signal , isHistoryNavigation , bodyUsed , arrayBuffer , blob , clone , formData , json , text


  let retVal =      'url: ' + reqCopy.url + EOL ;
  retVal = retVal + 'method: ' + reqCopy.method + EOL ;
  
  retVal = retVal + 'referrer: ' + reqCopy.referrer + EOL;
  retVal = retVal + 'referrerPolicy: ' + reqCopy.referrerPolicy + EOL;

  retVal = retVal + 'destination: ' + reqCopy.destination + EOL;
  retVal = retVal + 'mode: ' + reqCopy.mode + EOL;
  
  retVal = retVal + 'cache: ' + reqCopy.cache + EOL;
  retVal = retVal + 'credentials: ' + reqCopy.credentials + EOL;


  retVal = retVal + 'headers: {'  + LF;    
  //modified from https://developer.mozilla.org/en-US/docs/Web/API/Headers/forEach
  // Display the key/value pairs
  reqCopy.headers.forEach((value, key) => {
    retVal = retVal + `  ${key} ==> ${value}\n`;
  });
  retVal = retVal +"}// end of headers\n";

  retVal = retVal + 'integrity: ' + reqCopy.integrity + EOL;

  retVal = retVal + 'redirect: ' + reqCopy.redirect + EOL;
  retVal = retVal + 'body: ' + reqCopy.body + EOL;
  // retVal = retVal + 'referrer: ' + reqCopy.referrer + EOL;
  // retVal = retVal + 'referrer: ' + reqCopy.referrer + EOL;
  // retVal = retVal + 'referrer: ' + reqCopy.referrer + EOL;
  // retVal = retVal + 'referrer: ' + reqCopy.referrer + EOL;


  return( retVal );
}
// end ServiceWorker debugging helpers


const CACHE_NAME = `temperature-converter-v4`;
const FILES_TO_CACHE = [
  './temp-converter4.html',
  './converter4.js',
  './converter4.css'
];   


self.console.log('outside any function in sw.js,  probably in some register service worker stuff' + NowISO8601()  );

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

async function listCachedURLs(){

  let cache = await caches.open(CACHE_NAME);
  let theKeys = await cache.keys() ;
  let req = new Request("https://www.weather.gov");
  
  console.log('List of URLs that are in cache ' + NowISO8601() );
  keys.forEach( (rq)=>{ console.log('  ' + rq.url) } )
  console.log(LF);
}

function ServiceWorker_install(event){
  console.log('In start of ServiceWorker_install  event listener for install  ' + NowISO8601() );
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      cache.addAll( FILES_TO_CACHE );
      listCachedURLs();
    })()
  );
  



} // end of ServiceWorker_install

self.addEventListener('install', ServiceWorker_install);

function ServiceWorker_fetch(event){
  {
    let reqCopy = event.request.clone() ;
    console.log('in ServiceWorker_fetch(event) for 010 ' + reqCopy.url  + ' ' + NowISO8601()  );
  
    let reqInfo = 'some text'; 
    
    // reqInfo = describeObject( reqCopy.clone()  );     //   NOPE. JSON.stringify() Did not work at all. JSON.stringify( reqCopy );// maybe this works really well.
    // console.log(reqInfo);
    reqInfo = writeRequestToText(reqCopy.clone()) ;
    console.log(reqInfo);
  
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
  
      // Get the resource from the cache.
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        console.log( 'fetch of '+ event.request.url + ' came from LOCAL CACHE ' + NowISO8601() ) ;
        return cachedResponse;
      } else {
          try {
            // If the resource was not in the cache, try the network.
            const fetchResponse = await fetch(event.request);
            console.log( 'fetch of '+ event.request.url + ' came from WEB SERVER ' + NowISO8601() ) ;
            // Save the resource in the cache and return it.
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          } catch (e) {
            // The network failed
          }
      }
    })());
  }
}

self.addEventListener('fetch',ServiceWorker_fetch );

//replaced arrow function below with a named function above. 0230407T1756Z

// self.addEventListener('fetch', event => {
//   let reqCopy = event.request.clone() ;
//   console.log('in unnamed fetch event for 008 ' + reqCopy.url  + ' ' + NowISO8601()  );

//   let reqInfo =  describeObject( reqCopy.clone()  );     //   NOPE. Did not work at all. JSON.stringify( reqCopy );// maybe this works really well.
//   console.log(reqInfo);
//   reqInfo = writeRequestToText(reqCopy.clone()) ;
//   console.log(reqInfo);

//   event.respondWith((async () => {
//     const cache = await caches.open(CACHE_NAME);

//     // Get the resource from the cache.
//     const cachedResponse = await cache.match(event.request);
//     if (cachedResponse) {
//       return cachedResponse;
//     } else {
//         try {
//           // If the resource was not in the cache, try the network.
//           const fetchResponse = await fetch(event.request);
    
//           // Save the resource in the cache and return it.
//           cache.put(event.request, fetchResponse.clone());
//           return fetchResponse;
//         } catch (e) {
//           // The network failed
//         }
//     }
//   })());
// });

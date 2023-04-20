
self.console.log('at very top of sw6.js before any other code has run');

// general debugging helpers
const VER='v.022';
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


// this started out as https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/
const CACHE_TIMESTAMP_NAME = 'cache-time-stamp.txt';
const CACHE_NAME = 'temperature-converter-v6';
const CACHE_FILES_LIST = [
  './temp-converter6.html',
  './converter6.js',
  './converter6.css'
];   


self.console.log('outside any function in sw.js,  probably in some register service worker stuff' + VER +' ' + NowISO8601()  );

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

async function listCachedURLs(nameOfCache){
  if( (null===nameOfCache) ||
      (undefined === nameOfCache) ||
      (''=== nameOfCache) ){
      nameOfCache = CACHE_NAME
  }
  // change  // co1n sole  to console
  // co1n sole.log( 'nameOfCache: ' + nameOfCache + '    '  + VER +' ' + NowISO8601() );

  let cache = await caches.open(nameOfCache);
      // co1n sole.log( 'cache is now of type ' + cache.constructor.name +'  ' + VER +' ' + NowISO8601() );
  let theKeys = await cache.keys() ;
      // co1n sole.log( 'theKeys is now of type ' + theKeys.constructor.name + ' ' + theKeys.length  + ' '  + VER +' ' + NowISO8601() );
  let req ; //= new Request("https://www.weather.gov");
  
  console.log('List of URLs that are in cache ' + VER +' ' + NowISO8601() );
  theKeys.forEach( (rq)=>{ console.log('  ' + rq.url) } )
  console.log(LF);
} // end of async function listCachedURLs(nameOfCache)


async function cacheLoad(){
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll( CACHE_FILES_LIST );
  cache.put( CACHE_TIMESTAMP_NAME, 
      new Response(NowISO8601() )  ) ;


  await listCachedURLs(CACHE_NAME);
}
      // function ServiceWorker_install(event){   //moved actual work into  cacheLoad()  so we can use it in response to onmessage data.cmd=cacheRefresh
      //   console.log('In start of ServiceWorker_install  event listener for install  ' + NowISO8601() );
      //   event.waitUntil(
      //     (async () => {
      //       const cache = await caches.open(CACHE_NAME);
      //       cache.addAll( CACHE_FILES_LIST );
      //       await listCachedURLs();
      //     })()
      //   );


function ServiceWorker_install(event){
  console.log('In start of ServiceWorker_install  event listener for install  ' + VER +' ' + NowISO8601() );
  event.waitUntil( cacheLoad()   );
  
} // end of ServiceWorker_install

self.addEventListener('install', ServiceWorker_install);




function writeMessageToString(event){
  // copied from worker01/worker01.js
  let retVal = ('Event processed at ' + ' ' + NowISO8601() + '  '+ VER + '\n' ) ;
  try {
    retVal = retVal + '  type: ' + event.constructor.name +'\n';
    retVal = retVal + '  lastEventId: _' + event.lastEventId +'_' +'\n';
    retVal = retVal + '  source: _' + event.source +'_\n';
    retVal = retVal + '  origin: _' + event.origin + '_'+'\n';
    retVal = retVal + '  data ' +  JSON.stringify( event.data ) +'\n';      
  } catch (error) {
    //ignore errors here
  }
 return( retVal );
} // end function writeMessageToString

function broadcastToAllClients(objMessage){
  self.client.postMessage(objMessage);

if(1==0){
  for(let aClient of self.clients){
    aClient.postMessage(objMessage);
  }
}  
}

async function findClientFromEvent(event){
  let id = event.clientId ;
  let cli = await self.clients.get(id);
  return cli
}



function ServiceWorker_message(event){
  console.log(' message event handler in ServiceWorker ' + VER +' ' + NowISO8601() );
  console.log( writeMessageToString(event)  );
  try {
    let cmd = event.data.cmd ;  // if object passed to  postMessage does not have data.cmd, this DOES NOT THROW AN ERROR, but assigns undefined to cmd.
    console.log('cmd = ' + cmd +' ' + VER +' ' + NowISO8601() );
    if(cmd){  //undefined is falsy, so an object missing cmd does not throw an error, but does skip this
      processCommands(cmd) ;
    } else {
     // findClientFromEvent(event).postMessage({txt: 'ServiceWorker got message missing a cmd property' })
      // broadcastToAllClients( {txt: 'ServiceWorker got message missing a cmd property'} );
    }
      
  } catch (error) {
    // ignore errors here
    console.log('catch block of ServiceWorker_message '+ error);
  }


}
self.addEventListener('message', ServiceWorker_message);
//self.onmessage = ServiceWorker_message ; //note absence of ()  since we're assigning a function pointer.  Or we could self.addEventListener


async function processCommands(strCommand){
  switch (strCommand) {
    case 'cacheTimeStamp':

      break;
    case 'cacheList':
          console.log('sw cacheList '+ VER +' ' + NowISO8601() + LF);
          console.log( CACHE_NAME,'  ', CACHE_FILES_LIST);
        await listCachedURLs() ;
          console.log('end sw cacheList '+ VER +' ' + NowISO8601() + LF);
      break;    

    case 'cacheRefresh':
          console.log('in cacheRefresh '+ VER +' ' + NowISO8601());
        await caches.delete(CACHE_NAME);
        await cacheLoad();
          console.log('end of cacheRefresh ' + VER +' ' + NowISO8601()  + LF);
      break;    

      case 'cacheDelete':
        console.log('In cacheDelete ' + VER +' ' + NowISO8601()  );
      await caches.delete(CACHE_NAME);
        console.log('end of cacheDelete ' + VER +' ' + NowISO8601() + LF  );      
    break;

      
    case 'goAway':
          console.log('Goodbye, cold, cruel world. ' + VER +' ' + NowISO8601() );
        caches.delete(CACHE_NAME);
        await self.registration.unregister();
          console.log('I\'m me-e-e-l-l-ting '+ VER +' ' + NowISO8601() );
      break;  

    default:
      break;
  }  
}

async function postMessageToClientThatGeneratedEvent(event, objMessage){
  // I'm having a hard time getting the event.waitUntil stuff to work inside fetch, so I'm hoping an async function will work.

 // postMessage(objMessage); //quick copy from worker01 worker01.js


  console.log('vv', event.constructor.name, event.clientId, VER,VER, NowISO8601() )

  self.clients.matchAll().then(function (clients){
    console.log('clients', clients.constructor.name,   clients.length)
    clients.forEach(function(client){
        console.log(client.id, client.type, client.url)
        client.postMessage({
            msg: "Hey I just got a fetch from you!",
            url: event.request.url
        });
    });
}); 

return;
  let id = event.clientId ;
  if ( (id === undefined) || (id === null) ) return false;
  
  let cli = 
  await self.clients.get(id);
  console.log('client', cli.constructor.name ,VER, NowISO8601()   );
  
  if ( (cli === undefined) || (cli === null) ) return false;
  await cli.postMessage(objMessage);

  return true;
}





function ServiceWorker_fetch(event){
  {
    console.log('Start of ServiceWorker_fetch '+ VER +' ' + NowISO8601() );
console.log(VER,'just above event.waitUntil');

    //postMessageToClientThatGeneratedEvent(event, {txt: 'this came from sw_fetch'})
//     event.waitUntil( async(event)=>{
// console.log(VER)
// //for some reason, this locks up badly in Edge when I run it.
// // I need to understand Promises and async and await.....
//       console.log('Start of fetch   postMessage to client schtick '+ VER +' ' + NowISO8601());

//     // from https://developer.mozilla.org/en-US/docs/Web/API/Client/postMessage
//       if (!event.clientId) return;// Exit early if we don't have access to the client. // Eg, if it's cross-origin.
//       const client = await self.clients.get(event.clientId);// Get the client.
//       if (!client) return;// Exit early if we don't get the client. // Eg, if it closed.
//       // Send a message to the client.
//       client.postMessage(
//         {
//           msg: "Hey I just got a fetch from you!",
//           url: event.request.url,
//         }
//       );
//     }); //end of event.waitUntil arrow function
//     // ^^ from https://developer.mozilla.org/en-US/docs/Web/API/Client/postMessage ^^

    // this is from https://www.oreilly.com/library/view/building-progressive-web/9781491961643/ch04.html 
    //    and shows responding with a generated Response      and 
    //    snooping on URLs as they come in.
    // self.addEventListener("fetch", function(event) {
    //   if (event.request.url.includes("bootstrap.min.css")) {
    //     console.log("Fetch request for:", event.request.url);
    //     event.respondWith(
    //       new Response(
    //         ".hotel-slogan {background: green!important;} nav {display:none}",
    //         { headers: { "Content-Type": "text/css" }}
    //       )
    //     );
    //   }
    // });


    let reqCopy = event.request.clone() ;
    console.log('in ServiceWorker_fetch(event) for '+ VER + ' ' + reqCopy.url  + ' ' + VER +' ' + NowISO8601() );
  
    // let reqInfo = 'some text'; 
    
    // // reqInfo = describeObject( reqCopy.clone()  );     //   NOPE. JSON.stringify() Did not work at all. JSON.stringify( reqCopy );// maybe this works really well.
    // // console.log(reqInfo);
    // reqInfo = writeRequestToText(reqCopy.clone()) ;
    // console.log(reqInfo);
  
    //look for special commands coming in the URL search string
    var theURL = new URL(event.request.url );
    if( theURL.searchParams.has('CommandForServiceWorker') ){
      // maybe getAll for more elaborated URLs
      let cmd = theURL.searchParams.get('CommandForServiceWorker');
      //? maybe delete the searchParameter and pass this along to the RespondWith bit
      //  theURL.searchParams.delete('CommandForServiceWorker');
      console.log('URL contained search parameter CommandForServiceWorker: ' + cmd +' ' + VER +' ' + NowISO8601()  );
      processCommands(cmd );
      return ; //this might be a terrible exit
    }

    const optionsForMatch = { ignoreSearch:true, ignoreMethod: false, ignoreVary:false } ;


    event.respondWith(
      (async () => {
         const cache = await caches.open(CACHE_NAME);
  
        // Get the resource from the cache.
        const cachedResponse = await cache.match(event.request, optionsForMatch);
        if (cachedResponse) {
          console.log( 'fetch of '+ event.request.url + ' came from LOCAL CACHE '  + VER +' ' + NowISO8601() ) ;
          return cachedResponse;
        } else {
            try {
              // If the resource was not in the cache, try the network.
              const fetchResponse = await fetch(event.request);
              console.log( 'fetch of '+ event.request.url + ' came from WEB SERVER ' + VER +' ' + NowISO8601() ) ;
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

self.addEventListener("fetch", (event) => {
  // from https://developer.mozilla.org/en-US/docs/Web/API/Client/postMessage
  // we're ADDing an eventListener for fetch, which looks like it just echoes the fetch request 
  event.waitUntil(
    (async () => {
      // Exit early if we don't have access to the client.
      // Eg, if it's cross-origin.
      if (!event.clientId) return;

      // Get the client.
      const client = await clients.get(event.clientId);
      // Exit early if we don't get the client.
      // Eg, if it closed.
      if (!client) return;

      // Send a message to the client.
      let thisURL =  new URL(event.request.url);
        objMessage = {
          note: ('fetch event of serviceWorker ' + VER + NowISO8601() ) ,
          urlWanted:  'John BigBootie'
        }; //JSON.stringify(thisURL)
      client.postMessage(objMessage);
      // client.postMessage({
      //   msg: "Hey I just got a fetch from you!",
      //   url: event.request.url,
      // });
    })()
  );
});




// self.addEventListener("fetch", (event) => {
// // copied from https://developer.mozilla.org/en-US/docs/Web/API/Client/postMessage
//   event.waitUntil(
//     (async () => {
//       // Exit early if we don't have access to the client.
//       // Eg, if it's cross-origin.
//       if (!event.clientId) return;

//       // Get the client.
//       const client = await clients.get(event.clientId);
//       // Exit early if we don't get the client.
//       // Eg, if it closed.
//       if (!client) return;

//       // Send a message to the client.
//       client.postMessage({
//         msg: "serviceWorker "+ self.location + " just got a fetch from you!",
//         url: event.request.url,
//       });
//     })()
//   );
// });





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


// causes  on: Only the active worker can claim clients.
//  self.clients.claim(); //https://stackoverflow.com/questions/51728455/transfer-data-between-client-and-serviceworker
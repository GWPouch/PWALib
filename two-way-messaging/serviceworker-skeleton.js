
//  manually killing serviceWorkers can be accomplished with edge://serviceworker-internals/   or some such


////////////////////////////////////////////////////////////////////////////////
  // for debugging use.  LF,  NowISO8601, describeObject
    const LF = "\n";
    
    function NowISO8601( ){  return(  ( new Date() ).toISOString()    ); }

    function describeObject(obj){
      let retVal = 'ConstructorName: ' +  obj.constructor.name + EOL ;

      retVal = retVal + ' enumerableMembers: [ ' ;
      for(let key in obj){
        retVal = retVal + key + ' , ' ;
      }
      retVal = retVal.substring(0,retVal.lastIndexOf( ' , ')) + '];\n' ; //get rid of final  ' , '   and replace with ];\n

      // retVal = retVal + ' nonEnumerableMembers: [ ' ;
      // let listProps = Object.getOwnPropertyNames(obj);
      // for(let key2 in listProps ){
      //   retVal = retVal + key2 + ' , ' ;
      // }
      // retVal = retVal  + '];\n' ;

      // retVal = retVal  +  'allEnumerableMembers: [ ' ;
      // for(let key3 in obj){
      //   //https://stackoverflow.com/questions/208016/how-to-list-the-properties-of-a-javascript-object/32413145#32413145
      //   retVal = retVal + key3 + ' , ' ; //stackoverflow claims this will get ancestor properties too
      // }
      // retVal = retVal  + '];\n' ;

      return(retVal);
    } //end of describeObject
///////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////

  // Constants and semi-constants.  All of these could be const  , but let allows for setting them in ServiceWorker_MAIN()
  let APP_NAME = 'Window+ServiceWorkerCommunicator';
  let broadcastChannel = new BroadcastChannel( APP_NAME); 
        broadcastChannel.onmessage=ServiceWorker_message ;
  let swPostMessage = broadcastChannel.postMessage;
        broadcastChannel.close();
  let VER='v.030' ;


  let CACHE_TIMESTAMP_NAME = 'cache-time-stamp.txt';
  // these come from https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/
  let CACHE_NAME = APP_NAME + VER;
  let CACHE_FILES_LIST = [
    '/',
    './webpage.html',
    './webpage.js',
    './webpage.css'
  ];   
  

  const SERVICEWORKER_SOURCE_FILE = self.location.href
  const SERVICEWORKER_LOADED = NowISO8601();

///////////////////////////////////////////////////////////////////////////////



// lifecycle events of ServiceWorker as explained in 
// https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/service-workers
// I've written and commented routines for a skeletal ServiceWorker
//  _MAIN   just to gather all the 'loose' function calls and executables into  one place
//  _install    happens once, after the serviceWorker is loaded but before it becomes active. 
//  _activate   happens when the serviceWorker gets control of a page. Might not happen for a long time if there is already a serviceWorker in place
//  _fetch      whenever an in-scope item is requested.  This happens a lot
//  _message   when other pages or workers postMessage()  comes with a shallow-clone object called data 



function ServiceWorker_MAIN(){
  // set 'global' variables (accessible only to the ServiceWorker and its children)

  APP_NAME='name of app goes here, like TimeStamp' // used for broadcast channel
    broadcastChannel = new BroadcastChannel(APP_NAME);
    broadcastChannel.onmessage=ServiceWorker_message ;
  swPostMessage = broadcastChannel.postMessage;
  swPostMessage({what:'serviceWorker just started the broadcastChannel ' + APP_NAME })
  VER = 'v.030'

  //attach eventListeners    I find named functions much easier to debug than arrow functions with odd indentation.

  // these only happen once, at most.
  self.addEventListener( 'install',     ServiceWorker_install) ;
  self.addEventListener( 'activate',    ServiceWorker_activate);

  self.addEventListener( 'fetch',       ServiceWorker_fetch);
  self.addEventListener( 'message',     ServiceWorker_message);
  

}
ServiceWorker_MAIN();


function ServiceWorker_install(installEvent){
  //event 1   This happens after a window calls 
  // navigator.serviceWorker.register(relURLOfServiceWorker, { scope: relScopeOfServiceWorker })
  // this file gets downloaded and parsed, and out-of-function statements are executed.

  // After initializing variables like name of cache, you would call 
  // self.addEventHandler('install', ServiceWorker_install) 
  // this is where you cache files for later use, and maybe set some global, persistent variables, 
  // but it might be better to do that in ServiceWorker_MAIN()

  // this might only happen once in several days

  // you might call
  //    self.skipWaiting()
  // to immediately pass into the next state   active
  // If this run is the first time the user has come to the site and loaded the page that loaded this ServiceWorker
  //   the install event happens immediately, but it remains in a waiting-state (called installed) until the user navigates away from that page. 
  // so calling self.skipWaiting()  is not a terrible idea for a simple should-be-file:// monolithic page. 

  console.log('In start of ServiceWorker_install  event listener for install  ' 
        + APP_NAME + ' ' + VER +' ' + NowISO8601() );

  installEvent.waitUntil( cacheLoad()   );
    
  self.skipWaiting();  

} // end of ServiceWorker_install
      

function ServiceWorker_activate(ActivateEvent){
  // The happens when this serviceWorker takes control of the scope-of-pages specified in the serviceWorker.register call.
  //  On a first visit, activate happens right after install.
  //  
  // clean up old caches, maybe transferring their contents to new caches

}

function ServiceWorker_fetch(FetchEvent){
  // The Fetch  event is the main point of a service worker, and 
  //   happens a lot. Every time the page tries to load something from the dominion claimed in serviceWorker.register()
  // you can watch and edit URLs, return synthetic responses like building a graph in a PNG or altering HTML or CSS...
  console.log(APP_NAME + ' ' + VER + ' fetch event for ' + FetchEvent.request.url);
}


async function processCommands(strCommand){
  let cmd = strCommand;
    // Originally, I set this up to hand various {cmd:actionWanted } commands like .postMessage({cmd:'cacheClear'})
    // but I'm now expanding this to include inquire: ....   that will result in a postMessage back to windows.
    //  so strCommand might look like cacheRefresh , cacheDelete    or  like inquire:VER;    or like inquire:VER; inquire:APP_NAME  
  let i = 0;
  let parts = strCommand.split(';');
  for(let part of parts){
    i++;
    let subparts=part.split(':');
      for(let j=0; j<subparts.length;j++){ subparts[j]=subparts[j].trim() }
    console.log(i, NowISO8601(), subparts);
    
    cmd=subparts[0];
    
    switch ( cmd  ) {
      case 'inquire':
        switch (subparts[1]) {
          case 'APP_NAME':
              swPostMessage( {about:'reply to inquire', topic: 'APP_NAME', value: APP_NAME} )
            break;
          case 'CACHE_NAME':
            
            break;
          case 'CACHE_DATE':
            
            break;
          case 'CACHE_LIST':
            
            break;
          case 'ALL':
            
            break;
        
          default:
            break;
        }// end switch on inquire-->subtopic

      break;

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

}

function ServiceWorker_message(event){
    function writeMessageToString(event){
      // copied from worker01/worker01.js
      let retVal = ('MessageEvent processed at ' + ' ' + NowISO8601() +'\n' ) ;
      try {
        retVal = retVal + '  type: ' + event.constructor.name +'\n';
        retVal = retVal + '  lastEventId: _' + event.lastEventId +'_' +'\n';
        retVal = retVal + '  source: _' + event.source +'_\n';
        retVal = retVal + '  origin: _' + event.origin + '_'+'\n';
        retVal = retVal + '  data ' +  JSON.stringify( event.data ) +'\n';      
      } catch (error) {
        //ignore errors here
        console.log('Error caught in writeMessageToString()  in ServiceWorker ', error, NowISO8601());
      }
    return( retVal );
    } // end function writeMessageToString
  
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
  broadcastChannel.postMessage( {txt:'this is a stupid message from the serviceWorker'})

}

// function ServiceWorker_install(event){
//   console.log('In start of ServiceWorker_install  event listener for install  ' + VER +' ' + NowISO8601() );
//  //  function postMessage does not exist postMessage( {from:'ServiceWorker', what: 'install event handler', when:NowISO8601() } )  
//   sendMessageToALLClients({from:'Service Worker', when: NowISO8601(), what:'install finished'})
// } // end of ServiceWorker_install


function sendMessageToALLClients(objMessage){
  // from https://felixgerschau.com/how-to-communicate-with-service-workers/
  let matchOptions = {  includeUncontrolled: true,   type: 'window'}
  self.clients.matchAll(  matchOptions)
  .then( 
    (clients) => {
      if (clients && clients.length) {
        // Send a response - the clients
        // array is ordered by last focused
        clients[0].postMessage({
          type: 'REPLY_COUNT',
          count: ++count,
        });
       } 
    });
  
}


// self.addEventListener('install', ServiceWorker_install);
// self.addEventListener('message', ServiceWorker_message);
// broadcastChannel.onmessage = ServiceWorker_message ;

async function cacheLoad(){
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll( CACHE_FILES_LIST );
  cache.put( CACHE_TIMESTAMP_NAME, 
      new Response(NowISO8601() )  ) ;

  await listCachedURLs(CACHE_NAME);
}

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

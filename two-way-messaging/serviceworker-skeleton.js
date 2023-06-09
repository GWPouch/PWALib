"use strict";


//  manually killing serviceWorkers can be accomplished with 
//     edge://serviceworker-internals/   or some such
//   chrome://serviceworker-internals/

const NULL_STRING = '';
const COLON =':';
const SEMICOLON = ';'
const DOT = '.';  const PERIOD = '.'; const DECIMAL = '.';
const COMMA = ',';
const SPACE = ' ';
const QUOTE='"'; const QUOTE_DOUBLE='"';
const APOS="'";  const QUOTE_SINGLE="'";

////////////////////////////////////////////////////////////////////////////////
  // for debugging use.  LF,  NowISO8601, describeObject
    const LF = "\n";
    const EOL = ';\n';

    let strVariableSeparator = '    ' ;
    // Using showDebug can give cryptic errors, if an object broadcastChannel or document.body does not exit yet.
    //  Make sure calls to this only happen AFTER page is loaded, or you get cryptic errors.
    // showDebug is used for the same purpose as console.debug or console.log, but can set to
    //   to different functions to use the webpage, or some other mechanism to display the text.
    function showDebugPrototypeThatDoesNothing (...dataToWrite){ } ; // could be dumpToPREWithLotsOfLines,  document.writeln,  or console.debug
    let showDebug = showDebugPrototypeThatDoesNothing ;
      let showDebugName = 'showDebugPrototypeThatDoesNothing()' ;  // showDebug.name gives "bound log" for console.log.bind(console)
    showDebug = console.log.bind(console) ; // always safe
      showDebugName='console.log()';
    // showDebug = showAsPREWithLineForEachItem ; only in webpage
    //   showDebugName='showAsPREWithLineForEachItem()';
    // showDebug = showAsPREAtEndAsOneLineWithSpaces ; // only in webpage
    //   showDebugName='showAsPREAtEndAsOneLineWithSpaces()';
    showDebug = showByPostingMessageToClients ;  // only in Worker, ServiceWorker,...
      showDebugName='showByPostingMessageToClients()';
    // showDebug = showByPostingMessageToBroadcastChannel ;// Safe in Worker, ServiceWorker,...  In a webpage, this might cause a stack overflow as the page keeps broadcasting the message.
    //  showDebugName='showByPostingMessageToBroadcastChannel()';
    
    function writeValuesOnOneLineWithSeparators(...dataToWrite){
      let retVal = '';
      for( let iArg=0;iArg<dataToWrite.length;iArg++){
        retVal = retVal + ( dataToWrite[iArg] + strVariableSeparator  ); //there is an implicit string-conversion that might be better
       }
      return( retVal );  //? .trim() to get rid of trailing spaces ?
    }
    
    function writeValuesToStringWithLinebreaks(...dataToWrite){
      let retVal = '';
      for( let iArg=0;iArg<dataToWrite.length;iArg++){
        retVal = retVal + ( dataToWrite[iArg]  )  + LF  ;
      }
      return( retVal.substring(0, retVal.length-1)  );
    }
    
    function writeValuesToStringWithPairsOnSeparateLine(...dataToWrite){
      let retVal = '';
      for( let iArg=0;iArg<dataToWrite.length;iArg = iArg +2){
        retVal = retVal + ( dataToWrite[iArg]  + strVariableSeparator ) // always works 
        if(iArg+1 <= (dataToWrite.length -1 ) ){ // check for odd number of input values
          retVal = retVal +  dataToWrite[iArg+1] ; 
        }  
        retVal = retVal +  LF  ;
      }
      return( retVal.substring(0, retVal.length-1)  );
    }
    
    
    function showAsPREAtEndAsOneLineWithSpaces(...dataToWrite){
      //replacement for console.debug()
      
      // 20230503 modified so it writes to an element, then appends it at the end of the document
      let elm = document.createElement('pre');
      elm.innerHTML = writeValuesOnOneLineWithSeparators(dataToWrite);
      document.body.appendChild(elm);
      return(elm)
    }
    
    
    function showAsPREWithLineForEachItem(...dataToWrite){
      //replacement for cons(ole.debug()
      let elm = document.createElement('pre')
      document.body.appendChild(elm);  
      elm.innerHTML = writeValuesToStringWithLinebreaks(dataToWrite);
      return ( elm );
    }

    function showByPostingMessageToClients(...dataToWrite){
        postMessage_ALLClients({SHOW_DEBUG: writeValuesOnOneLineWithSeparators(dataToWrite)  }) ;
    }

    function showByPostingMessageToBroadcastChannel(...dataToWrite){
      postMessage_BroadcastChannel({SHOW_DEBUG: writeValuesOnOneLineWithSeparators(dataToWrite)  }) ;
    }
    function showDebugSET(howToShow){
      //specify where showDebug messages go.  This is mainly useful in message processing.
      switch ( howToShow.toUpperCase() ) {
        case 'NONE':
          showDebug = showDebugPrototypeThatDoesNothing ; //does nothing at all
            showDebugName = 'showDebugPrototypeThatDoesNothing()';
          break;
        case 'CONSOLE':
          showDebug = console.log.bind(console) ; //console window
            showDebugName = 'console.log()'
          break;
        case 'MESSAGE_CLIENTS':
          showDebug = showByPostingMessageToClients ; // only can work from ServiceWorker or other Worker
            showDebugName = 'showByPostingMessageToClients ()'
          break;
        case 'MESSAGE_BROADCAST':
          showDebug = showByPostingMessageToBroadcastChannel ;// Safe in Worker, ServiceWorker,...  In a webpage, this might cause a stack overflow as the page keeps broadcasting the message.          
            showDebugName = 'showByPostingMessageToBroadcastChannel()';
          break;
        // case value:
          
        //   break;
        default:
          showDebug = console.log.bind(console);
            showDebugName = howToShow + '-->> console.log()  '
          break;
      }
      console.log( 'serviceWorker showDebug messages now directed at ' +  showDebugName + '  '+NowISO8601() +'  ' + APPandVERandHREF );
    }

    
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
    // con sole.log('navigator in a ServiceWorker', describeObject(navigator));
    // con sole.log('self in a ServiceWorker', describeObject(self))
///////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////

  // Constants and semi-constants.  All of these could be const  , but let allows for setting them in ServiceWorker_initialize()
  let APP_NAME = 'Window+ServiceWorkerCommunicator';
  let APP_VERSION='v.031' ; // this MUST come before trying to broadcast, because we append VER to messages
  let APPandVER = APP_NAME + ' '+ APP_VERSION ;   
  let APPandVERandHREF = /*'ServiceWorker ' + */ APPandVER +' '+ self.location.href 
  let broadcastChannel = null ; // new BroadcastChannel( APP_NAME); 
  // broadcast Channel.onmessage=ServiceWorker_message ;
  // con sole.log('serviceworker broadcast Channel is '+ broad castChannel.name )
  //     postMessage_Broad cast Channel({ping:'PING', how: 'broad castChancel for ' + broad castChannel.name  })
  //       broadcast Channel.close();
  


  let CACHE_TIMESTAMP_NAME = 'cache-time-stamp.txt';
  // these come from https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/
  let CACHE_NAME =  APP_NAME + APP_VERSION;  //'JoeMamaCache'; //  APP_NAME + VER;
  let CACHE_FILES_LIST = [
    './MajorGeneralSong.html',
    './webpage.html',
    './webpage.js',
    './webpage.css',
    './',
    './RedHerrings.html','./BallBearingHerrings.jpg'
  ];   
  

  const SERVICEWORKER_SOURCE_FILE = self.location.href
  const SERVICEWORKER_LOADED = NowISO8601();

  let myRegistrationObj = null ;
  let myServiceWorkerObj = null;
  let myServiceWorkerState = 'MSU';

  let myURLComplete ='http://www.none.com:443/No/Such/Path/AServiceWorker.js?ver=223#first';
  let myURLOrigin ='http://www.none.com:443';
  let myURLPath = '/No/Such/Path/';
  let myURLName = 'AServiceWorker.js';
  let myURLNameBase = 'AServiceWorker';
  let myURLNameEXT = 'js'; // Should I check that EXT is js|JS|javascript|JAVASCRIPT|JavaScript ?

  let myParameters={"APP_NAME":"NameGoesHere","APP_VERSION":"v.1.2.3","CACHE_FILES_LIST": ["a.txt","b.png"]  }

///////////////////////////////////////////////////////////////////////////////



// lifecycle events of ServiceWorker as explained in 
// https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/service-workers
// I've written and commented routines for a skeletal ServiceWorker
//  _initialize   just to gather all the 'loose' function calls and assignments into  one place

//  _install    happens once, after the serviceWorker is loaded but before it becomes active. 
//  _activate   happens when the serviceWorker gets control of a page. Might not happen for a long time if there is already a serviceWorker in place
//  _fetch      whenever an in-scope item is requested.  This happens a lot
//  _message   when other pages or workers postMessage()  comes with a shallow-clone object called data 



function ServiceWorker_initialize(){
  // set 'global' variables (accessible only to the ServiceWorker and its children)

// Find the URL that this ServiceWorker comes from
myURLComplete = self.location.href; // should look like https://herrings.yes--we-have-no-bananas.gov/two-way-messaging/serviceworker-skeleton.js  
myURLOrigin = self.location.origin ;
let parts = splitStringOnce( self.location.pathname, '/',false)
myURLPath = parts.before + '/';
myURLName = parts.after ;

parts = splitStringOnce(myURLName,DOT);
myURLNameBase = parts.before ;
myURLNameEXT  = parts.after ;

  //attach eventListeners    I find named functions much easier to debug than arrow functions with odd indentation.

  // these only happen once, at most.
  self.addEventListener( 'install',     ServiceWorker_install) ;
  self.addEventListener( 'activate',    ServiceWorker_activate);

  // these happen for every fetch() call in the HTML, but not within the ServiceWorker
  self.addEventListener( 'fetch',       ServiceWorker_fetch_begin);
  self.addEventListener( 'fetch',       ServiceWorker_fetch_inquire);
  self.addEventListener( 'fetch',       ServiceWorker_fetch_command);
  self.addEventListener( 'fetch',       ServiceWorker_fetch_typical);
//self.addEventListener( 'fetch',       ServiceWorker_fetch_finish);

  //  self.addEventListener( 'fetch',       ServiceWorker_fetch_zzOLD);
  
  self.addEventListener( 'message',     ServiceWorker_message); // this attaches both ServiceWorker onmessage and broadcastChannel onmessage to the same routine
  self.addEventListener( 'messageerror',ServiceWorker_messageError);

  self.addEventListener( 'statechange' ,ServiceWorker_stateChange) ; // this seems to never fire

}
// ( async ()=>{ // this is an IIFE (Immediately Invoked Function Expression)  
//               // https://developer.mozilla.org/en-US/docs/Glossary/IIFE
//               // so that ServiceWorker_initialize can await loading a file   await
             ServiceWorker_initialize();
//             }
// )();




async function parametersRead(){
// reads a lot of ServiceWorker parameters like APP_NAME and CACHE_FILES_LIST
// these are near constants
  let resp = await fetch( myURLOrigin + myURLPath + myURLNameBase + '.json' )
  myParameters  = await resp.json() ;

  //moved from ServiceWorker_initialize
    //  maybe cache_name and such should be read from an XML file at startup during initialize
    APP_NAME =  myParameters.APP_NAME; //'   name of app goes here, like TimeStamp' // used for broadcast channel
    APP_VERSION = myParameters.APP_VERSION; // this MUST come before setting up the broadcast channel and 
                  //     sending out a test message, because we use VER in the adorned message
    APPandVER = APP_NAME + ' '+ APP_VERSION ;
    APPandVERandHREF ='ServiceWorker ' + APPandVER +' '+ self.location.href +' ' ;

    BroadCastChannel_START(APP_NAME); // or APPandVER
    // broadcast Channel = new Broadcast Channel(APP_NAME); // or APPandVER
    //   broadcast Channel.onmessage=ServiceWorker_message ;
    //   con sole.log('sw broadcast Channel is '+ broadcastChannel.name )
    // //postMessage_Broadcast Channel = broadcast Channel.postMessage.bind(broadcast Channel);
    // postMessage_Broadcast Channel({what:'serviceWorker just started the broadcast Channel ' + APP_NAME })
    CACHE_FILES_LIST = myParameters.CACHE_FILES_LIST ;
    return( myParameters );
}


function ServiceWorker_install(eventInstall){
  //event 1   This happens after a window calls 
  // navigator.serviceWorker.register(relURLOfServiceWorker, { scope: relScopeOfServiceWorker })
  // this file gets downloaded and parsed, and out-of-function statements are executed.

  // After initializing variables like name of cache, you would call 
  // self.addEventHandler('install', ServiceWorker_install) 
  // this is where you cache files for later use, and maybe set some global, persistent variables, 
  // but it might be better to do that in ServiceWorker_initialize()

  // this might only happen once in several days

  // you might call
  //    self.skipWaiting()
  // to immediately pass into the next state   active
  // If this run is the first time the user has come to the site and loaded the page that loaded this ServiceWorker
  //   the install event happens immediately, but it remains in a waiting-state (called installed) until the user navigates away from that page. 
  // so calling self.skipWaiting()  is not a terrible idea for a simple should-be-file:// monolithic page. 

  showDebug(
    'In start of ServiceWorker_install  event listener for install  ' +
         APP_NAME + ' ' + APP_VERSION +' ' + NowISO8601() 
  );

  myRegistrationObj = self.registration;
  // getting the ServiceWorker state and such does not work in that initialize event.
  myServiceWorkerObj = (myRegistrationObj.waiting || myRegistrationObj.active ||  myRegistrationObj.installing );
    //the above line only works if the serviceworker is installing/installed, active/activating, or waiting
  myServiceWorkerObj.addEventListener( 'statechange' ,ServiceWorker_stateChange) ;
  myServiceWorkerState = myServiceWorkerObj.state;





  eventInstall.waitUntil(
    ( async ()=>{
      await parametersRead();
      await cacheLoad();
     }) () 
     );
  //eventInstall.waitUntil(  cacheLoad() );
  eventInstall.waitUntil( self.skipWaiting()  ); // from https://stackoverflow.com/questions/33978993/serviceworker-no-fetchevent-for-javascript-triggered-request

  showDebug(
    'At end of ServiceWorker_install    event listener for install  ' +
         APPandVERandHREF + NowISO8601() 
  );
  showDebug(LF);

} // end of ServiceWorker_install
      

function ServiceWorker_activate(eventActivate){
  // The happens when this serviceWorker takes control of the scope-of-pages specified in the serviceWorker.register call.
  //  On a first visit, activate happens right after install.
  //  
  // clean up old caches, maybe transferring their contents to new caches
  showDebug( 'ServiceWorker_activate start', /*self.state,*/  NowISO8601());
      // con sole.log('about to send message using postMessage_ALLClients')
      postMessageALL({what: 'ServiceWorker_activate', who:APPandVERandHREF})
      eventActivate.waitUntil( self.clients.claim() )  ; // https://stackoverflow.com/questions/33978993/serviceworker-no-fetchevent-for-javascript-triggered-request

//      con sole.log( Object.getOwnPropertyNames(this)   );
//['Object', 'Function', 'Array', 'Number', 'parseFloat', 'parseInt', 'Infinity', 'NaN', 'undefined', 'Boolean', 'String', 'Symbol', 'Date', 'Promise', 'RegExp', 'Error', 'AggregateError', 'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError', 'globalThis', 'JSON', 'Math', 'Intl', 'ArrayBuffer', 'Uint8Array', 'Int8Array', 'Uint16Array', 'Int16Array', 'Uint32Array', 'Int32Array', 'Float32Array', 'Float64Array', 'Uint8ClampedArray', 'BigUint64Array', 'BigInt64Array', 'DataView', 'Map', 'BigInt', 'Set', 'WeakMap', 'WeakSet', 'Proxy', 'Reflect', 'FinalizationRegistry', 'WeakRef', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape', 'unescape', 'eval', 'isFinite', 'isNaN', 'console', 'PushSubscriptionOptions', 'PushSubscription', 'PushManager', 'PushEvent', 'Permissions', 'PermissionStatus', 'PeriodicSyncManager', 'PeriodicSyncEvent', 'NotificationEvent', 'Notification', 'NavigatorUAData', 'CropTarget', 'BackgroundFetchUpdateUIEvent', 'BackgroundFetchRegistration', 'BackgroundFetchRecord', 'BackgroundFetchManager', 'BackgroundFetchEvent', 'PaymentRequestEvent', 'CanMakePaymentEvent', 'AbortPaymentEvent', 'WritableStreamDefaultWriter', 'WritableStreamDefaultController', 'WritableStream', 'WorkerNavigator', 'WorkerLocation', 'WorkerGlobalScope', 'WindowClient', 'WebSocket', 'WebGLVertexArrayObject', 'WebGLUniformLocation', 'WebGLTransformFeedback', 'WebGLTexture', 'WebGLSync', 'WebGLShaderPrecisionFormat', 'WebGLShader', 'WebGLSampler', 'WebGLRenderingContext', 'WebGLRenderbuffer', 'WebGLQuery', 'WebGLProgram', 'WebGLFramebuffer', …]

  showDebug( 'ServiceWorker_activate end', NowISO8601());
}

function ServiceWorker_fetch_zzOLD(eventFetch){
  // The Fetch  event is the main point of a service worker, and 
  //   happens a lot. Every time the page tries to load something from the dominion claimed in serviceWorker.register()
  // you can watch and edit URLs, return synthetic responses like building a graph in a PNG or altering HTML or CSS...
  let reqCopy = eventFetch.request.clone();

  let txtMsg ='message for console.log and postMessage and such';
  txtMsg = 'serviceworker fetch event in ' + APP_NAME + ' ' + APP_VERSION + ' for ' + eventFetch.request.url + ' at ' + NowISO8601()
  showDebug(txtMsg );

  //allow URL commands to work like postMessage({cmd:SomeCommand})
  
  let theURL = new URL(eventFetch.request.url );
    const K_strServiceWorkerCommand='QqServiceWorkerCommandQq';
    if( theURL.searchParams.has(K_strServiceWorkerCommand) ){
      // maybe getAll for more elaborate URLs
      let cmd = decodeURIComponent( theURL.searchParams.get(K_strServiceWorkerCommand) );
      //? maybe delete the searchParameter and pass this along to the RespondWith bit
      theURL.searchParams.delete(K_strServiceWorkerCommand);
      showDebug('URL contained search parameter '+ K_strServiceWorkerCommand  +': ' + cmd + '    ' + APP_NAME +' '+ APP_VERSION +' ' + NowISO8601()  );
      processCommands( cmd );
      // at this point, we could exit by returning, 
      // or continue on to respondWith bit.
      showDebug(theURL.href);
      reqCopy =cloneRequestToNewURL( reqCopy,  (theURL.href) ); 
      // return ; //this might be a terrible exit
    }

    let optionsForMatch = { 
      ignoreSearch:false, //  true to ignore the searchString, false to get a different result for each searchString, 
      ignoreMethod: false, 
      ignoreVary:false 
    } ;
    eventFetch.respondWith(
      (async () => {
         const cache = await caches.open(CACHE_NAME);
        
        // Get the resource from the cache.
        const cachedResponse = await cache.match(reqCopy, optionsForMatch);
        if (cachedResponse) {
          showDebug( '  fetch of '+ eventFetch.request.url + ' came from LOCAL CACHE ' +CACHE_NAME + ' '  + ' ' + NowISO8601() ) ;
          return cachedResponse; //  
        } else {
            try {
              // If the resource was not in the cache, try the network.
              const fetchResponse = await fetch(reqCopy);
              showDebug( '  fetch of '+ eventFetch.request.url + ' came from WEB SERVER '  + NowISO8601() ) ;
                  // DOES NOT CACHE retrieved files not in the initial list.
                  // // Save the resource in the cache and return it.
                  // cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            } catch (e) {
              // The network failed
               showDebug('  fetch of ' + eventFetch.request.url + ' for '+ APP_NAME + ' '+ APP_VERSION  + ' FAILED '   + error );
            }
        }
    })());

    showDebug('ServiceWorker_fetch_zzOLD event end  '+NowISO8601() );


} // end of ServiceWorker_fetch_zzOLD










function ServiceWorker_fetch_typical(eventFetch){
  // this fetch handler returns files from the cache, or from  the web, and is what you would typically see
  
  let txtMsg ='message for console.log and postMessage and such';
  txtMsg = 'ServiceWorker_fetch_typical for fetch event in ' + APPandVER +' for request.url= ' + eventFetch.request.url + ' at ' + NowISO8601()
  showDebug(txtMsg );

  if(eventFetch.replies.length){
    let replies = eventFetch.replies;
    eventFetch.respondWith(
      (async () => {  
        let retVal='';
        await Promise.allSettled(eventFetch.replies).then(
          (results)=>{
            let n=0;
            results.forEach(
              (result)=>{ 
                if(result.status==='fulfilled'){
                
                  replies[n] =  result.value ;// overwrite the promise with its results
                } else {                  
                  replies[n] = ('Did not complete Reply ' + [n] )
                }
                n = n + 1;
              })// close forEach()
          }); //close .then()  on Promise.allSettled()
      
        // for(let i=0; i<eventFetch.replies.length;i++){
        //   retVal= retVal+LF+eventFetch.replies[i];
        // }
        eventFetch.replies.forEach((line)=>{retVal = retVal + LF + line;  showDebug(line)   })
        retVal = retVal.substring(1); //get rid of the extra line feed at the beginning
        return(new Response(retVal));
      })());
    } else {
  let optionsForMatch = { 
    ignoreSearch:false, //  true to ignore the searchString, false to get a different result for each searchString, 
    ignoreMethod: false, 
    ignoreVary:false 
  } ;
  eventFetch.respondWith(
    (async () => {
       const cache = await caches.open(CACHE_NAME);
      
      // Get the resource from the cache.
      const cachedResponse = await cache.match(eventFetch.request, optionsForMatch);
      if (cachedResponse) {
        showDebug( '  fetch of '+ eventFetch.request.url + ' came from LOCAL CACHE ' +CACHE_NAME + ' '  + ' ' + NowISO8601() ) ;
        return cachedResponse; //  
      } else {
          try {
            // If the resource was not in the cache, try the network.
            const fetchResponse = await fetch(eventFetch.request);
            showDebug( '  fetch of '+ eventFetch.request.url + ' came from WEB SERVER '  + NowISO8601() ) ;
                // DOES NOT CACHE retrieved files not in the initial list.
                // // Save the resource in the cache and return it.
                // cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          } catch (e) {
            // The network failed
             showDebug('  fetch of ' + eventFetch.request.url + ' for '+ APP_NAME + ' '+ APP_VERSION  + ' FAILED '   + error );
          } //close try block on getting from network
      }// close if on found cached response
    })//close defining async arrow function
    () //invoke the async arrow function
    ); //close respondWith
  }
  showDebug('ServiceWorker_fetch_typical event end  ' + NowISO8601() );


}

function ServiceWorker_fetch_begin(eventFetch){
  eventFetch.replies=[];// add an array property to the fetch event. We can't append 
                        // to a response from eventFetch.respondWith, so we'll build 
                        //  an array of strings using event.fetch.push('next message') 
                        //   then merge them into one big string at the end and respondWith( composite string )
}


function ServiceWorker_fetch_command(eventFetch){
    
    showDebug('Starting ServiceWorker_fetch_command', eventFetch.request.url, NowISO8601())
    const K_strServiceWorkerCommand_RAW='QqServiceWorkerCommandQq'+APP_NAME+'Qq'+APP_VERSION+'Qq'   ;// this is the form used in searchParams.get
    const K_strServiceWorkerCommand_esc  = encodeURIComponent(K_strServiceWorkerCommand_RAW);        // it must be in URI-escaped form in actual URL.
  
    let txtURL = eventFetch.request.url.toString() ;// request.url  can be string, or a URL object
    let txtURLLowerCase = txtURL.toLowerCase();

    if( ( txtURLLowerCase.includes('??help')    )  ||
        ( txtURLLowerCase.includes('???')       )  ||
        ( txtURLLowerCase.includes('??command') )  ||
        ( txtURLLowerCase.includes('??cmd')     )   
      )
     {
      eventFetch.replies.push('Commands to the ServiceWorker look like ./PageThatDoesNotExist.html?'+ K_strServiceWorkerCommand_esc + '=CommandForTheServiceWorker , as in ?'+K_strServiceWorkerCommand_esc + '=CommandsList')
     } 

     let indexOfCMDinTxtURL = txtURL.indexOf(K_strServiceWorkerCommand_esc) ;
     if(indexOfCMDinTxtURL === -1){
   return ;
     }
   
     if(indexOfCMDinTxtURL === 0 ){
       txtURL = '?' + txtURL;
         // in debug console in Edge,   fetch('QqServiceWorkerInquireQqWindow%2BServiceWorkerCommunicatorQqv.031Qq=INQUIRIES_LIST')
         // resulted in a URL of https://herrings.yes--we-have-no-bananas.gov/two-way-messaging/QqServiceWorkerInquireQqWindow%2BServiceWorkerCommunicatorQqv.031Qq=INQUIRIES_LIST
         //  ... two-way-messaging/QqServiceWorkerInquireQqWindow%2BServiceWorkerCommunicatorQqv.031Qq=INQUIRIES_LIST 63
         // note that fetch(SomeText) from https://LongAddress  results in a fetch of https://LongAddressSomeText ,
         // so (indexOfINQinTxtURL === 0)  ?can't? happen and we can't fix forgetting to prepend "?" to our query
     }
       
   // DO NOT CALL respondWith more than once. It REALLY messes with the caching.   eventFetch.respondWith( new Response('second response'))
     // the URL looks like 
     //  somePage.html?QqServiceWorkerCommandQq=CacheDelete   
     //  somePage.html?QqServiceWorkerInquireQq=CacheAddPage%3Ahttps%3A%2F%2Fherrings.yes--we-have-no-bananas.gov%2Ftwo-way-messaging%2Fwebpage.html
      let objURL = new URL( txtURL );
      let command = decodeURIComponent( objURL.searchParams.get( (K_strServiceWorkerCommand_RAW)) ).trim();
     // at this point, inquiry has ALL the inquiry (even if looks like "CACHE_CONTAINS : http://example.com/index")
       showDebug('Command  URL contained command parameter '+ K_strServiceWorkerCommand_esc  +': ' + command + '    ' + APPandVER +' ' + NowISO8601()  );
   
       let promReply = processCommands( command ) ; //annoyingly, 
       // processCommands _really_ returns a string, but because it's an async function, we have to treat the return value as a promise. 
       eventFetch.replies.push(promReply);
   } // end of ServiceWorker_fetch_command
   

function ServiceWorker_fetch_inquire(eventFetch){
  showDebug('Starting  ServiceWorker_fetch_inquire', eventFetch.request.url, NowISO8601())
  // A long inquire string is good because it's unlikely to collide,
  //   but is hard to type and can cause other problems with URI-encoding 
  //   and updating the version or name in the serviceworker requires updating it in the dependent webpages
  const K_strServiceWorkerInquire_RAW = ('QqServiceWorkerInquireQq');//  + APP_NAME + 'Qq'+APP_VERSION+'Qq')   ; // this is the form used in searchParams.get
  const K_strServiceWorkerInquire_esc  = encodeURIComponent(K_strServiceWorkerInquire_RAW);         // it must be in URI-escaped form in actual URL.


  let txtURL = eventFetch.request.url.toString().trim() ;// request.url  can be string, or a URL object
  let txtURLLowerCase = txtURL.toLowerCase();

  if( ( txtURLLowerCase.includes('??help')  )    ||
      ( txtURLLowerCase.includes('???')  )       ||
      ( txtURLLowerCase.includes('??inquiry')  ) ||
      ( txtURLLowerCase.includes('??inquire')  ) ||
      ( txtURLLowerCase.includes('??enquire')  )  
    ) {
    eventFetch.replies.push('Inquiries to the ServiceWorker look like ?'+ K_strServiceWorkerInquire_esc + '=InquiryForTheServiceWorker , as in ?'+K_strServiceWorkerInquire_esc + '=CACHE_DATE')
  }
  
  let indexOfINQinTxtURL = txtURL.indexOf(K_strServiceWorkerInquire_esc) ;
  if(indexOfINQinTxtURL === -1){
return ;
  }

  if(indexOfINQinTxtURL === 0 ){
    txtURL = '?' + txtURL;
      // in debug console in Edge,   fetch('QqServiceWorkerInquireQqWindow%2BServiceWorkerCommunicatorQqv.031Qq=INQUIRIES_LIST')
      // resulted in a URL of https://herrings.yes--we-have-no-bananas.gov/two-way-messaging/QqServiceWorkerInquireQqWindow%2BServiceWorkerCommunicatorQqv.031Qq=INQUIRIES_LIST
      //  ... two-way-messaging/QqServiceWorkerInquireQqWindow%2BServiceWorkerCommunicatorQqv.031Qq=INQUIRIES_LIST 63
      // note that fetch(SomeText) from https://LongAddress  results in a fetch of https://LongAddressSomeText ,
      // so (indexOfINQinTxtURL === 0)  ?can't? happen and we can't fix forgetting to prepend "?" to our query
  }
    
// DO NOT CALL respondWith more than once. It REALLY messes with the caching.   eventFetch.respondWith( new Response('second response'))
  // the URL looks like 
  //  somePage.html?QqServiceWorkerInquireQq=CACHE_LIST   
  //  somePage.html?QqServiceWorkerInquireQq=cacheDoYouHavePage%3Ahttps%3A%2F%2Fherrings.yes--we-have-no-bananas.gov%2Ftwo-way-messaging%2Fwebpage.html
  let theURL = new URL( txtURL );
   let inquiry = decodeURIComponent( theURL.searchParams.get( (K_strServiceWorkerInquire_RAW)) ).trim();
  // at this point, inquiry has ALL the inquiry (even if looks like "CACHE_CONTAINS : http://example.com/index")

    //QqServiceWorkerInquireQqWindow ServiceWorkerCommunicatorQqv.031Qq CACHE_DATE
    //  got bit by a + in the APP_NAME that turned into a space

    showDebug('inquire  URL contained inquiry parameter '+ K_strServiceWorkerInquire_esc  +': ' + inquiry + '    ' + APPandVER +' ' + NowISO8601()  );

    let promReply = processInquiry( inquiry ) ; 
    eventFetch.replies.push(promReply);
} // end of ServiceWorker_fetch_inquire



function ServiceWorker_message(eventMessage){
  
  // con sole.log(' message event handler in ServiceWorker ' + APP_VERSION +' ' + NowISO8601() );
  //if(LogLevel>=1)  con sole.log( writeMessageToString(eventMessage)  , NowISO8601() );
  try {
    let theData =eventMessage.data;
    
    let inq = theData.inquiry || theData.Inquiry || theData.INQUIRY ||
              theData.inquire || theData.Inquire || theData.INQUIRE ;
    if(inq){
      let inqString = inq.toString();
      let reply = processInquiry( inqString );
      reply.then( (ans)=>{
        console.log(APPandVERandHREF +' handled inquiry in message ', inqString, ans, NowISO8601() );
        postMessageALL({theQuestion: inqString, theAnswer: ans}); 
return;
      })
    } // close if on message has inquiry

    
    let cmd = theData.cmd || theData.CMD || theData.command || theData.Command || theData.COMMAND;
    if(cmd){
      let cmdString = cmd.toString();
      let reply = processCommands( cmdString );
      reply.then( (ans)=>{
        showDebug(APPandVERandHREF +' handled command in message ', cmdString, ans, NowISO8601() );
        postMessageALL({theCommand: cmdString, theResponse: ans});
return;
      })   

    }



    // let cmd = eventMessage.data.cmd ;  // if object passed to  postMessage does not have data.cmd, this DOES NOT THROW AN ERROR, but assigns undefined to cmd.
    // con sole.log('cmd = ' + cmd +' ' + APP_VERSION +' ' + NowISO8601() );
    // if(cmd){  //undefined is falsy, so an object missing cmd does not throw an error, but does skip this
    //   processCommands(cmd) ;
    // } else {
    //  // findClientFromEvent(event).postMessage({txt: 'ServiceWorker got message missing a cmd property' })
    //   // broadcastToAllClients( {txt: 'ServiceWorker got message missing a cmd property'} );
    // }
      
  } catch (error) {
    // ignore errors here
    showDebug('catch block of ServiceWorker_message '+ error , NowISO8601());
  }
  // DO NOT SET UP AN ENDLESS LOOP broadcastChannel.postMessage( {txt:'this is a stupid message from the serviceWorker in ServiceWorker_message ',when: NowISO8601()})

}

function ServiceWorker_messageError(eventMessageError){
  // according to The service worker client is sent a message that cannot be deserialized from a service worker. See postMessage(message, options).
  // The service worker client is sent a message that cannot be deserialized from a service worker. See postMessage(message, options).
  showDebug( 'messageerror event occurred ' + JSON.stringify(eventMessageError) +' ' + eventMessageError.constructor.name +' ' + NowISO8601() )


}
function ServiceWorker_stateChange(eventStateChange){
  showDebug('serviceworker ServiceWorker_stateChange. Old state was '+ myServiceWorkerState +' .  New state is ' + myServiceWorkerObj.state +' . ' + NowISO8601()  );
  myServiceWorkerState = myServiceWorkerObj.state;
}

// this could be an internal function of a single eventMessage handler
function writeMessageToString(eventMessage){
  // copied from worker01/worker01.js
  let retVal = ('MessageEvent processed at ' + ' ' + NowISO8601() +'\n' ) ;
  try {
    retVal = retVal + '  type: ' + eventMessage.constructor.name +'\n';
    retVal = retVal + '  lastEventId: _' + eventMessage.lastEventId +'_' +'\n';
    retVal = retVal + '  source: _' + eventMessage.source +'_\n';
    retVal = retVal + '  origin: _' + eventMessage.origin + '_'+'\n';
    retVal = retVal + '  data ' +  JSON.stringify( eventMessage.data ) +'\n';      
  } catch (error) {
    //ignore errors here
    let errorMsg = 'Error catch-ed in writeMessageToString() in serviceworker ' + error + ' ' + NowISO8601();
    showDebug( errorMsg);
    retVal = retVal + errorMsg
  }
return( retVal );
} // end function writeMessageToString


async function cacheLoad(){
  showDebug('start of cacheLoad in serviceWorker', self.location.href, NowISO8601() )
  // in MSEdge, cache.addAll works, even if given a bad URL
  // in Chrome, it fails and doesn't add ANY of the pages if one is not found
  //   so back to make my own caching routing

      // con sole.log('  about to try await caches.open(CACHE_NAME)', CACHE_NAME);
      // con sole.log('  the files to get ' , CACHE_FILES_LIST)
      // the next line fails if you try to run it from VSCode>Debug>Launch
      // Uncaught (in promise) DOMException: Failed to execute 'open' on 'CacheStorage': Unexpected internal error. 
      //  see comment on https://stackoverflow.com/questions/64297126/service-worker-fails-on-caches-open
    const cache = await   self.caches.open(CACHE_NAME);
    
      // con sole.log('   just opened cache. It is of type ' , cache.constructor.name)
    
    let nF=0;
    let nFiles = CACHE_FILES_LIST.length ;
    let arrAddPromises = new Array( nFiles );
    let arrFinalNames  = new Array( nFiles) ;
    for( nF=0; nF<nFiles;nF++){
      // con sole.log(nF, CACHE_FILES_LIST[nF]);
      arrAddPromises[nF] = cache.add( CACHE_FILES_LIST[nF] );
    } 
    let nLoaded = 0;
    let n = 0;
    await Promise.allSettled(arrAddPromises).then(
      (results)=>{
        n=0;
        results.forEach(
          (result)=>{ 
            if(result.status==='fulfilled'){
              nLoaded = nLoaded + 1;
              showDebug('  loaded '+ CACHE_FILES_LIST[n]  );
              arrFinalNames[n] = result.value ;
            } else {
              showDebug('  did not load ' + CACHE_FILES_LIST[n] );
              arrFinalNames[n] = result.reason;
            }
            n = n + 1;
          })// close forEach()
      }); //close .then()  on Promise.allSettled()
      // remarkably useless reason-for-failure con sole.log('results and reasons', arrFinalNames.toString() );
      try {
        await cache.put( CACHE_TIMESTAMP_NAME, 
          new Response(  NowISO8601() )  ) ;
      } catch (error) {
        // this should only happen if a cached CACHE_TIMESTAMP_NAME is already there
        showDebug('error trying to put ' + CACHE_TIMESTAMP_NAME ,error)
      }
      
      // await list CachedURLs(CACHE_NAME);
      let strArrCachedURLs = await listCachedURLs(CACHE_NAME);
      // con sole.log(strArrCachedURLs.toString().split(',').join(LF) ) ;
      return ( nLoaded )   ;  // because this is async, we're in a promise. Chrome REALLY wants us to return something
      
 // this fails if any files don't exist await cache.addAll( CACHE_FILES_LIST );
}

async function listCachedURLs( nameOfCache, question = ''){
  if( (null === nameOfCache) ||
      (undefined === nameOfCache) ||
      (''=== nameOfCache) ){
      nameOfCache = CACHE_NAME
  }
  // change  // co1n sole  to console
  // co1n sole.log( 'nameOfCache: ' + nameOfCache + '    '  + VER +' ' + NowISO8601() );

  let cache = await caches.open(nameOfCache);
      // co1n sole.log( 'cache is now of type ' + cache.constructor.name +'  ' + VER +' ' + NowISO8601() );
  let theRequests = await cache.keys() ;
      // co1n sole.log( 'theKeys is now of type ' + theKeys.constructor.name + ' ' + theKeys.length  + ' '  + VER +' ' + NowISO8601() );
  let retVal = '';  //RFC 1738 says we can ' ' as a delimiter since they're not allowed IN URLs
  theRequests.forEach( (rq)=>{
    retVal = retVal + rq.url + SPACE;
  } );
  retVal = retVal.trim()
  // let kountFiles = theRequests.length;
  // if(kountFiles){
  //   let arrRequests = new Array(kountFiles);
  //   let i= 0;
  //   theRequests.forEach( (rq)=>{
  //     arrRequests[i] = rq.url;
  //       i++; 
  //     } )
  // } else {
    //handle the no files case
  // }
  // let retVal = arrRequests.toString();//sadly, this has a ,  as separator, and that can show up in URLs


    if(question){ retVal = question + COLON + retVal }
  return (   retVal ) ;
} // end of async function listCachedURLs(nameOfCache)

async function cacheGetDate4() {
  let dateOfCache='Alice';
 
// let response = await fetch('./' + CACHE_TIMESTAMP_NAME); // this seems to not trigger ServiceWorker_fetch_typical, so it doesn't hit the cache at all
  showDebug('in cacheGetDate')
showDebug(dateOfCache, NowISO8601(),` after dateOfCache='Alice';`);        
  let cache = await self.caches.open(CACHE_NAME);
  showDebug(cache)
showDebug(dateOfCache, NowISO8601(),`after let cache = await self.caches.open(CACHE_NAME);`);      
  let response = await cache.match(CACHE_TIMESTAMP_NAME);
  showDebug('response', CACHE_TIMESTAMP_NAME ,response)
showDebug(dateOfCache, NowISO8601(),`after let response = await cache.match(CACHE_TIMESTAMP_NAME);`);

  dateOfCache = await response.text();
showDebug(dateOfCache, NowISO8601(),`after  answer = await response.text();`);

  showDebug('date returned',dateOfCache)
  // fetch CACHE_TIMESTAMP_NAME  from the cache, get the contents into answer 
  return( dateOfCache );
  
}

async function cacheGetDate5() {
  let dateOfCache='Alice';
 
let response0 = await fetch('./' + CACHE_TIMESTAMP_NAME); // this seems to not trigger ServiceWorker_fetch_typical, so it doesn't hit the cache at all

showDebug(response0,response0.text())



showDebug('in cacheGetDate')
showDebug(dateOfCache, NowISO8601(),` after dateOfCache='Alice';`);        
  let cache = await self.caches.open(CACHE_NAME);
  showDebug(cache)
showDebug(dateOfCache, NowISO8601(),`after let cache = await self.caches.open(CACHE_NAME);`);      
  let response = await cache.match(CACHE_TIMESTAMP_NAME);
  showDebug('response', CACHE_TIMESTAMP_NAME ,response)
showDebug(dateOfCache, NowISO8601(),`after let response = await cache.match(CACHE_TIMESTAMP_NAME);`);

  dateOfCache = await response.text();
showDebug(dateOfCache, NowISO8601(),`after  answer = await response.text();`);

  showDebug('date returned',dateOfCache)
  // fetch CACHE_TIMESTAMP_NAME  from the cache, get the contents into answer 
  return( dateOfCache );
  
}



async function cacheGetDate5a() {
  let dateOfCache='Alice';
  showDebug('cacheGetDate finished', 'date returned',dateOfCache)
// con2 sole.log('in cacheGetDate')
// con2 sole.log(dateOfCache, NowISO8601(),` after dateOfCache='Alice';`);        
  let cache = await self.caches.open(CACHE_NAME);
  // con2 sole.log(cache)
// con2 sole.log(dateOfCache, NowISO8601(),`after let cache = await self.caches.open(CACHE_NAME);`);      
  let response = await cache.match(CACHE_TIMESTAMP_NAME);
  // con2 sole.log('response', CACHE_TIMESTAMP_NAME ,response)
// con2 sole.log(dateOfCache, NowISO8601(),`after let response = await cache.match(CACHE_TIMESTAMP_NAME);`);

  dateOfCache = await response.text();
// con2 sole.log(dateOfCache, NowISO8601(),`after  answer = await response.text();`);

  showDebug('cacheGetDate finished', 'date returned',dateOfCache)
  // fetch CACHE_TIMESTAMP_NAME  from the cache, get the contents into answer 
  return( dateOfCache );
  
}
async function cacheGetDate6(question) {
  // this version actually works
  let dateOfCache='Alice';
  showDebug('cacheGetDate started', '',dateOfCache,NowISO8601())
    // the cache=  response=   schtick  works, but  let response = fetch(CACHE_TIMESTAMP_NAME) fails, somehow
  let cache = await self.caches.open(CACHE_NAME);
  showDebug('getIt started   let cache = await self.caches.open(CACHE_NAME)',cache,NowISO8601())
  let response = await cache.match(CACHE_TIMESTAMP_NAME);
  showDebug('getIt           let response = await cache.match(CACHE_TIMESTAMP_NAME);',response,NowISO8601())
    // let response = fetch( './' + CACHE_TIMESTAMP_NAME)          
      dateOfCache = await response.text();
      showDebug('getIt           finished', 'date returned',dateOfCache,NowISO8601())
  // };
  // let prom = getIt();
  // showDebug('cacheGetDate   let prom = getIt();', '', prom, NowISO8601())
  // dateOfCache = prom.resolved;
  // showDebug('cacheGetDate   dateOfCache = prom.resolved;', '',dateOfCache,NowISO8601())
  // fetch CACHE_TIMESTAMP_NAME  from the cache, get the contents into answer 
  return( question +COLON +  dateOfCache );
  
}

 async function cacheGetDate(nameOfCache, question = ''){
  if( (null === nameOfCache) ||
      (undefined === nameOfCache) ||
      (''=== nameOfCache) ){
      nameOfCache = CACHE_NAME
  }

  let retVal = 'Alice';
    // the cache=  response=   schtick  works, but  let response = fetch(CACHE_TIMESTAMP_NAME) fails, somehow
  let cache = await self.caches.open(nameOfCache);
  let response = await cache.match(CACHE_TIMESTAMP_NAME);
        // let response = fetch( CACHE_TIMESTAMP_NAME )  // within the ServiceWorker, fetch always immediately tries the network. 
        // Otherwise, you couldn't really access the network.  
        // In JavaScript in a webpage, fetch raises FetchEvent in the ServiceWorker         
  retVal = await response.text();
  if(question){ question + COLON +  retVal}
  return( retVal ); 
} // end of async function cacheGetDate(question)


function cloneRequestToNewURL(requestOriginal, urlWanted) {
  // modified from https://stackoverflow.com/questions/43004657/modify-the-url-of-a-new-request-object-in-es6
  // requestIN    MUST be a Request object
  

  let { // alphabetized list of Request properties from MDN 2023-04-23
    body,
    //bodyUsed, // seems like an internal property set based on body
    cache,
    credentials,
    destination,
    headers,
    //integrity, // this is likely a cryptographic hash set internally.
    method,  // get post header ...
    mode,
    redirect,
    referrer,
    referrerPolicy,
    signal,
    url
  } = requestOriginal;
  
  mode = 'same-origin'; // we could use  cors, no-cors, same-origin,  or websocket but NOT navigate
  let retVal = new Request(
    urlWanted, 
      { // list of Request properties from MDN
        body,
        //bodyUsed, //seems like an internal property
        cache,
        credentials,
        destination,
        headers,
        //integrity, //seems like an internal property
        method,
        mode,
        redirect,
        referrer,
        referrerPolicy,
        signal //,
              // url /
      }// end of defining new Request options object         
     ) // closing parenthesis of new Request ( ) 
  return(retVal);
} // end of function cloneRequestToNewURL
  
function splitStringOnce(StringIn, Delimiter, AtStart = true ){
  StringIn = StringIn.trim();
  let ndx = -1234 ;
  if(AtStart){
    ndx = StringIn.indexOf( Delimiter );
  } else {
    ndx = StringIn.lastIndexOf( Delimiter );
  }
  
  let retVal={before:StringIn, delimiter:Delimiter, after:''}
  if(ndx === -1 ){
    //leave retVal alone
  } else {
    retVal.before = StringIn.substring(0,ndx).trim();
    retVal.after  = StringIn.substring(ndx+1).trim();
  }
  return ( retVal ) ;
}

async function processInquiry( strInquiry){
  // moved much of the code from ServiceWorker_fetch_inquire to here, so we can also process them using messages

  let splitInq = splitStringOnce( strInquiry , COLON );
  let question = splitInq.before;
  let theParameters = splitInq.after;  
//eventFetch.replies is an array of strings or Promises to be handled later in the ServiceWorker_fetch_typical routine.
 let answer = ''; //If we get a simple, 'synchronous' [really: sequential] result, store that. Otherwise, store the promise
 let promAnswer = null;
   
 switch ( question ) {
  // add any new case s   to the INQUIRIES_LIST
   case 'INQUIRIES_LIST':
       answer = 'APP_NAME,APP_VERSION,CACHE_NAME,CACHE_DATE,CACHE_LIST,SERVICEWORKER_URL,INQUIRIES_LIST'
     break;
   case 'APP_NAME': 
       answer = APP_NAME ;
     break;

   case 'APP_VERSION':  
   case 'VER':
   case 'VERSION':
       answer = APP_VERSION;
     break;

   case 'CACHE_NAME':
       answer = CACHE_NAME; // works if we have only the one cache

       // this retrieves all the caches, with each surrounded by <<double < > inequality signs>>
       //    since there seem to be very lax rules on what a cache name can look like. 
       let theCacheList=await self.caches.keys();
       answer=''
       theCacheList.forEach((cacheName)=>{ 
          answer = answer + '<<'+ cacheName +'>>' + SPACE;
        } )
        answer = answer.trim();

     break;

   case 'CACHE_DATE':
      promAnswer=(  cacheGetDate(theParameters, question) ); // nameOfCache defaults to CACHE_NAME
     break;
   case 'CACHE_LIST':
       promAnswer =  listCachedURLs(theParameters, question) ;
     break;
    case 'SERVICEWORKER_URL':
        answer = myURLComplete ;
      break;    
   default:
       answer='Did not recognize inquiry "'+ question  +'"  . Check capitalization and spelling.   INQUIRIES_LIST to see known values.'
     break;
 }// end switch on question

  if(promAnswer){
    return (promAnswer ) 
  } else {
    return ( question + COLON +  answer )
  } 
}


async function processCommands1(strCommand){
  let cmd = strCommand;
    // Originally, I set this up to hand various {cmd:actionWanted } commands like .postMessage({cmd:'cacheClear'})
    // but I'm now expanding this to include inquire: ....   that will result in a postMessage back to windows.
    //  so strCommand might look like cacheRefresh , cacheDelete    or  like inquire:VER;    or like inquire:VER; inquire:APP_NAME  
  let i = 0;
  let parts = strCommand.split(';');
  for(let part of parts){
    i++;
    let subparts=part.split(COLON);
      for(let j=0; j<subparts.length;j++){ subparts[j]=subparts[j].trim() }
    showDebug(i, subparts, NowISO8601());
    
    cmd       = subparts[0];
    
    switch ( cmd  ) {
      case 'inquire':
        let question = subparts[1];
        let answer   = 'some string answer'
        switch ( question ) {
          case 'APP_NAME': 
              answer = APP_NAME;
            break;
          case 'CACHE_NAME':
              answer = CACHE_NAME;
            break;
          case 'VER':
          case 'VERSION':
              answer = APP_VERSION;
            break;
          case 'CACHE_DATE':
            
              // fetch CACHE_TIMESTAMP_NAME  from the cache, get the contents into answer 
              //answer = 
            break;
          case 'CACHE_LIST':
              let listOfURLs =  await listCachedURLs(CACHE_NAME) ;
              let strTmp = listOfURLs.toString() ;
              answer = 'The cached URLs in ' + CACHE_NAME + ' are \n' + 
               strTmp.split(',').join(LF) + NowISO8601() + LF ;
            break;
          case 'ALL':
            
            break;
        
          default:
            break;
        }// end switch on inquire-->subtopic
        showDebug(question,answer);
        //broadcastChannel.postMessage({about:'reply to inquire', topic: question, value: answer })
        postMessage_BroadcastChannel( {about:'reply to inquire', topic: question, value: answer } )

      break;

      case 'cacheTimeStamp':
  
        break;
      case 'cacheList':
            showDebug('sw message_cmd cacheList '+ CACHE_NAME + '     ' + APP_VERSION +' ' + NowISO8601() + LF);
            showDebug('    ', CACHE_NAME,'  ', CACHE_FILES_LIST, NowISO8601());
          let strArrCachedURLs =   await listCachedURLs(CACHE_NAME) ;
            showDebug('    ', 'the cached URLs are ' + LF + strArrCachedURLs.toString().split(',').join(LF) )
            showDebug('end sw message_cmd cacheList '+ APP_VERSION +' ' + NowISO8601() + LF);
        break;    
  
      case 'cacheRefresh':
            showDebug('in cacheRefresh '+ APP_VERSION +' ' + NowISO8601());
          await caches.delete(CACHE_NAME);
          await cacheLoad();
            showDebug('end of cacheRefresh ' + APP_VERSION +' ' + NowISO8601()  + LF);
        break;    
  
        case 'cacheDelete':
          showDebug('In cacheDelete ' + APP_VERSION +' ' + NowISO8601()  );
        await caches.delete(CACHE_NAME);
          showDebug('end of cacheDelete ' + APP_VERSION +' ' + NowISO8601() + LF  );      
      break;
  
        
      case 'goAway':
            showDebug('Goodbye, cold, cruel world. ' + APP_VERSION +' ' + NowISO8601() );
          caches.delete(CACHE_NAME);
          await self.registration.unregister();
            showDebug('I\'m me-e-e-l-l-ting '+ APP_VERSION +' ' + NowISO8601() );
        break;  
  
      default:
        break;
    }  

  }

}

async function processCommands(CommandString){
  // 20230427 I now have a processInquiry routine, and am going to simplify this. And eliminate multiple commands.
  // CommandString is Pascal-cased  TopicVerb PossibleObject like
  // CacheRefresh   GoAway   CacheAdd ./options.xml             
  let splitCmd = splitStringOnce( CommandString , COLON );
  let strCommand = splitCmd.before;
  let theParameters = splitCmd.after;  
 //eventFetch.replies is an array of strings or Promises to be handled later in the ServiceWorker_fetch_typical routine.
  let strResult = ''; //If we get a simple, 'synchronous' [really: sequential] result, store that. Otherwise, store the promise
  let promResult = null;

  switch ( strCommand  ) {
    case 'CommandsList':
        strResult = 'ShowDebugSet,CacheDelete,CacheRefresh,BroadcastChannelClose,BroadcastChannelSwitch,ServiceWorkerUnregister,GoAway,DebugMessagesGoTo,CommandsList'
      break;
    case 'DebugMessagesGoTo':                
      showDebugSET(theParameters);    
      strResult = 'showDebug was set to ' + theParameters;      
    break;    

    case 'CacheRefresh':                
        await cacheLoad();    
        strResult = 'refreshed the cache ' + CACHE_NAME;      
      break;    
    case 'CacheDelete':
          if(theParameters===NULL_STRING){theParameters=CACHE_NAME;} 
        await caches.delete(theParameters);
        strResult = 'deleted cache ' + theParameters;        
      break;


    case 'ServiceWorkerUnregister':
        await self.registration.unregister();
        strResult = 'Unregistered ServiceWorker ' + self.location.href + ' at ' + NowISO8601();
      break;

    case 'GoAway':
          showDebug('Goodbye, cold, cruel world. ' + APPandVER +' ' + NowISO8601() );
        caches.delete(CACHE_NAME);
        await self.registration.unregister();
          showDebug('I\'m me-e-e-l-l-ting '+ APPandVER +' ' + NowISO8601() );
        strResult = 'Deleted cache ' + CACHE_NAME + ' and unregistered ServiceWorker '+ APPandVER + ' ' + self.location.href + ' ' + NowISO8601(); 
      break;  

    case 'BroadcastChannelClose':
// this needs testing.
        postMessageALL({text:'ServiceWorker ' +APPandVER +' is about to close BroadcastChannel ' + broadcastChannel.name })
        strResult = 'ServiceWorker ' +APPandVER +' closed BroadcastChannel ' + broadcastChannel.name +' '+ NowISO8601() 
        broadcastChannel.close();
      break;
    case 'BroadcastChannelSwitch':
// this needs testing.      
          if(theParameters===NULL_STRING){theParameters = APPandVER; } 
        postMessageALL({text:'ServiceWorker ' + APPandVER +' is about to close BroadcastChannel ' + broadcastChannel.name +
           ' and switch to ' + theParameters })
       strResult = 'ServiceWorker ' +APPandVER +' closed BroadcastChannel ' + broadcastChannel.name +' '+ NowISO8601()  
       broadcastChannel.close(); // should I removeEventListener? Does old event listener continue on new channel?

        broadcastChannel.open(theParameters)
        postMessageALL({text: 'ServiceWorker ' +APPandVER +' now broadcasting on BroadcastChannel ' + broadcastChannel.name +' '+ NowISO8601() } ) ;
        strResult = strResult + LF +
          'ServiceWorker ' +APPandVER +' now broadcasting on BroadcastChannel ' + broadcastChannel.name +' '+ NowISO8601()
      break;

    default:
      strResult = 'Did not recognize command "'+ strCommand  +'"  . Check capitalization and spelling.   CommandsList to see known values.'  ;
      break;
  }  
  showDebug(strResult); // this can result in results appearing twice in the console
  console.log(strResult); //ALWAYS log to console, in case Messages are not working right
  return( strResult ) ;
} // end of process commands

function BroadCastChannel_STOP(ChannelName){
  let msg = 'ServiceWorker ' + APPandVER+' '+self.location.href ;
  if(broadcastChannel){
    msg = msg +  ' is about to close BroadcastChannel ' + broadcastChannel.name;
    console.log(msg, NowISO8601());
    showDebug(msg,NowISO8601());
    postMessageALL({text:msg});
    broadcastChannel.close();
    broadcastChannel = null;
  } else {
    msg=msg + ' tried to close BroadcastChannel, but it had none already' 
    showDebug(msg,NowISO8601());
    console.log(msg, NowISO8601());
    postMessageALL({text:msg});
  }
}

function BroadCastChannel_START(ChannelName){
  if(broadcastChannel){
    let msg = 'ServiceWorker ' + APPandVER+' '+self.location.href+  
                ' is about to close BroadcastChannel ' + broadcastChannel.name + 
                ' and switch to ' + ChannelName ;
    showDebug(msg,NowISO8601());                
    console.log(msg, NowISO8601());
    postMessageALL({text:msg});
    broadcastChannel.close();
    broadcastChannel = null;
  }
  if(!ChannelName){
    //??  just exit, or set a default name?
    let msg = APPandVERandHREF + ' got a blank channel name, so it was set to a default value of ' + APPandVER + '  '+ NowISO8601() ; 
    showDebug(msg);
    console.log(msg);
    ChannelName = APPandVER;
  }

  broadcastChannel = new BroadcastChannel(ChannelName);
  broadcastChannel.addEventListener('message', ServiceWorker_message );
  broadcastChannel.addEventListener('messageerror', ServiceWorker_messageError );    
  let msg = 'ServiceWorker ' + APPandVER+' '+self.location.href+  
   ' is now using BroadcastChannel ' + broadcastChannel.name;
  showDebug(msg,NowISO8601());
  console.log(msg, NowISO8601());
  postMessageALL({text:msg});

}


// All of these postMessage functions accept only the first, plain object, 
//   and do not handle target origin, or transferable objects.
function addSourceAndTimeToMessageObject(objMessage){
  objMessage.who = 'ServiceWorker ' + APP_NAME + ' ' + APP_VERSION   ;
  objMessage.whoURL = self.location.href;
  objMessage.when=NowISO8601();
  
  return( objMessage ) ;// in case callerBoy use   let fixedMessage=addSourceAndTimeToMessageObject(   )
}

function postMessage_BroadcastChannel(objMessage){
  //appends some source properties for debugging use, then posts using broadcastChannel API
  addSourceAndTimeToMessageObject(objMessage);

  objMessage.how='BroadcastChannel '+ broadcastChannel.name;
  if(broadcastChannel){
    broadcastChannel.postMessage(objMessage);
  } else {
    msg = APPandVERandHREF +' has no active BroadcastChannel but attempted to PostMessage ' + JSON.stringify(objMessage ) + ' '+NowISO8601();
    console.log(msg);
    postMessage_ALLClients({text:msg}); 
  }
}

function postMessage_ALLClients(objMessage){
  // from https://felixgerschau.com/how-to-communicate-with-service-workers/
  // this only makes sense from a ServiceWorker, a [Web]Worker, or a SharedWorker  
  let matchOptions = {  includeUncontrolled: true,   type: 'window'}

  addSourceAndTimeToMessageObject(objMessage);
  objMessage.how='Client postMessage';
  
  // con sole.log('in postMessage_ALLClients ' + JSON.stringify(objMessage) );  

  self.clients.matchAll( matchOptions )
  .then( 
    (clients) => {
      // con sole.log(clients);
      if (clients && clients.length) { // this is a check for clients exists and clients has elements
        // con sole.log ('clients.length' ,clients.length )
        // Send a response - the clients
        // array is ordered by last focused
        clients.forEach(
            ( client ) =>{ 
                client.postMessage(objMessage)
            } 
        );
        // clients[0].postMessage({
        //   type: 'REPLY_COUNT',
        //   count: ++count,
        // });
       } 
    });
  
}

function postMessageALL(objMessage){
  postMessage_ALLClients(objMessage);
  postMessage_BroadcastChannel(objMessage);
  // this does NOT use the MessageChannel API   which looks too complicated.

}

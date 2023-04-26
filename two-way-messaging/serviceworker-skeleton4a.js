"use strict";


//  manually killing serviceWorkers can be accomplished with 
//     edge://serviceworker-internals/   or some such
//   chrome://serviceworker-internals/



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

  // Constants and semi-constants.  All of these could be const  , but let allows for setting them in ServiceWorker_initialize()
  let APP_NAME = 'Window+ServiceWorkerCommunicator';
  let VER='v.031' ; // this MUST come before trying to broadcast, because we append VER to messages
  let APPandVER = APP_NAME + ' '+ VER ;   
  let broadcastChannel = new BroadcastChannel( APP_NAME); 
        broadcastChannel.onmessage=ServiceWorker_message ;
  console.log('serviceworker broadcastChannel is '+ broadcastChannel.name )

  // let postMessage_BroadcastChannel = broadcastChannel.postMessage.bind(broadcastChannel);
      postMessage_BroadcastChannel({from:'ServiceWorker '+self.location.href ,
                     how: 'broadcastChancel for ' + broadcastChannel.name,
                     when:NowISO8601() 
      })

        broadcastChannel.close();
  


  let CACHE_TIMESTAMP_NAME = 'cache-time-stamp.txt';
  // these come from https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/
  let CACHE_NAME =  APP_NAME + VER;  //'JoeMamaCache'; //  APP_NAME + VER;
  let CACHE_FILES_LIST = [
    './MajorGeneralSong.html',
    './webpage.html',
    './webpage.js',
    './webpage.css',
    './'
  ];   
  

  const SERVICEWORKER_SOURCE_FILE = self.location.href
  const SERVICEWORKER_LOADED = NowISO8601();

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

  APP_NAME=  APP_NAME; //'   name of app goes here, like TimeStamp' // used for broadcast channel
  VER = 'v.031'; // this MUST come before setting up the broadcast channel and 
                 //     sending out a test message, because we use VER in the adorned message
  APPandVER = APP_NAME + ' '+ VER ;
  
  broadcastChannel = new BroadcastChannel(APP_NAME);
    broadcastChannel.onmessage=ServiceWorker_message ;
    console.log('sw broadcastChannel is '+ broadcastChannel.name )
  //postMessage_BroadcastChannel = broadcastChannel.postMessage.bind(broadcastChannel);
  postMessage_BroadcastChannel({what:'serviceWorker just started the broadcastChannel ' + APP_NAME })
  

  //attach eventListeners    I find named functions much easier to debug than arrow functions with odd indentation.

  // these only happen once, at most.
  self.addEventListener( 'install',     ServiceWorker_install) ;
  self.addEventListener( 'activate',    ServiceWorker_activate);

  self.addEventListener( 'fetch',       ServiceWorker_fetch_begin);
  self.addEventListener( 'fetch',       ServiceWorker_fetch_inquire);
  self.addEventListener( 'fetch',       ServiceWorker_fetch_command);
  self.addEventListener( 'fetch',       ServiceWorker_fetch_typical);
//self.addEventListener( 'fetch',       ServiceWorker_fetch_finish);

  //  self.addEventListener( 'fetch',       ServiceWorker_fetch);
  
  self.addEventListener( 'message',     ServiceWorker_message);
  self.addEventListener( 'messageerror',ServiceWorker_messageError);

  self.addEventListener( 'statechange' ,ServiceWorker_stateChange)

}
ServiceWorker_initialize();


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

  console.log(
    'In start of ServiceWorker_install  event listener for install  ' +
         APP_NAME + ' ' + VER +' ' + NowISO8601() 
  );

  eventInstall.waitUntil( cacheLoad()   );
  eventInstall.waitUntil( self.skipWaiting()  ); // from https://stackoverflow.com/questions/33978993/serviceworker-no-fetchevent-for-javascript-triggered-request

  console.log(
    'At end of ServiceWorker_install    event listener for install  ' +
         APP_NAME + ' ' + VER +' ' + NowISO8601() 
  );
  console.log();

} // end of ServiceWorker_install
      

function ServiceWorker_activate(eventActivate){
  // The happens when this serviceWorker takes control of the scope-of-pages specified in the serviceWorker.register call.
  //  On a first visit, activate happens right after install.
  //  
  // clean up old caches, maybe transferring their contents to new caches
  console.log( 'ServiceWorker_activate start', self.state,  NowISO8601());
      console.log('about to send message using postMessage_ALLClients')
      postMessage_ALLClients({what: 'ServiceWorker_activate'})
      eventActivate.waitUntil( self.clients.claim() )  ; // https://stackoverflow.com/questions/33978993/serviceworker-no-fetchevent-for-javascript-triggered-request
      
  console.log( 'ServiceWorker_activate end', NowISO8601());
}

function ServiceWorker_fetch(eventFetch){
  // The Fetch  event is the main point of a service worker, and 
  //   happens a lot. Every time the page tries to load something from the dominion claimed in serviceWorker.register()
  // you can watch and edit URLs, return synthetic responses like building a graph in a PNG or altering HTML or CSS...
  let reqCopy = eventFetch.request.clone();

  let txtMsg ='message for console.log and postMessage and such';
  txtMsg = 'serviceworker fetch event in ' + APP_NAME + ' ' + VER + ' for ' + eventFetch.request.url + ' at ' + NowISO8601()
  console.log(txtMsg );

  //allow URL commands to work like postMessage({cmd:SomeCommand})
  
  let theURL = new URL(eventFetch.request.url );
    const K_strServiceWorkerCommand='QqServiceWorkerCommandQq';
    if( theURL.searchParams.has(K_strServiceWorkerCommand) ){
      // maybe getAll for more elaborate URLs
      let cmd = decodeURIComponent( theURL.searchParams.get(K_strServiceWorkerCommand) );
      //? maybe delete the searchParameter and pass this along to the RespondWith bit
      theURL.searchParams.delete(K_strServiceWorkerCommand);
      console.log('URL contained search parameter '+ K_strServiceWorkerCommand  +': ' + cmd + '    ' + APP_NAME +' '+ VER +' ' + NowISO8601()  );
      processCommands( cmd );
      // at this point, we could exit by returning, 
      // or continue on to respondWith bit.
      console.log(theURL.href);
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
          console.log( '  fetch of '+ eventFetch.request.url + ' came from LOCAL CACHE ' +CACHE_NAME + ' '  + ' ' + NowISO8601() ) ;
          return cachedResponse; //  
        } else {
            try {
              // If the resource was not in the cache, try the network.
              const fetchResponse = await fetch(reqCopy);
              console.log( '  fetch of '+ eventFetch.request.url + ' came from WEB SERVER '  + NowISO8601() ) ;
                  // DOES NOT CACHE retrieved files not in the initial list.
                  // // Save the resource in the cache and return it.
                  // cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            } catch (e) {
              // The network failed
               console.log('  fetch of ' + eventFetch.request.url + ' for '+ APP_NAME + ' '+ VER  + ' FAILED '   + error );
            }
        }
    })());

    console.log('ServiceWorker_fetch event end  '+NowISO8601() );


} // end of ServiceWorker_fetch










function ServiceWorker_fetch_typical(eventFetch){
  // this fetch handler returns files from the cache, or from  the web, and is what you would typically see
  
  let txtMsg ='message for console.log and postMessage and such';
  txtMsg = 'ServiceWorker_fetch_typical for fetch event in ' + APPandVER +' for request.url= ' + eventFetch.request.url + ' at ' + NowISO8601()
  console.log(txtMsg );

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
        eventFetch.replies.forEach((line)=>{retVal = retVal + LF + line;  console.log(line)   })
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
        console.log( '  fetch of '+ eventFetch.request.url + ' came from LOCAL CACHE ' +CACHE_NAME + ' '  + ' ' + NowISO8601() ) ;
        return cachedResponse; //  
      } else {
          try {
            // If the resource was not in the cache, try the network.
            const fetchResponse = await fetch(eventFetch.request);
            console.log( '  fetch of '+ eventFetch.request.url + ' came from WEB SERVER '  + NowISO8601() ) ;
                // DOES NOT CACHE retrieved files not in the initial list.
                // // Save the resource in the cache and return it.
                // cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          } catch (e) {
            // The network failed
             console.log('  fetch of ' + eventFetch.request.url + ' for '+ APP_NAME + ' '+ VER  + ' FAILED '   + error );
          } //close try block on getting from network
      }// close if on found cached response
    })//close defining async arrow function
    () //invoke the async arrow function
    ); //close respondWith
  }
  console.log('ServiceWorker_fetch_typical event end  ' + NowISO8601() );


}

function ServiceWorker_fetch_begin(eventFetch){
  eventFetch.replies=[];// add an array property to the fetch event. We can't append 
                        // to a response from eventFetch.respondWith, so we'll build 
                        //  an array of strings using event.fetch.push('next message') 
                        //   then merge them into one big string at the end and respondWith( composite string )
}


function ServiceWorker_fetch_command(eventFetch){
    
    console.log(' in ServiceWorker_fetch_command', eventFetch.request.url)
    let txtURL = eventFetch.request.url.toString() ;// request.url  can be string, or a URL object
    let txtURLLowerCase = txtURL.toLowerCase();
    const K_strServiceWorkerCommand='QqServiceWorkerCommandQq'+APP_NAME+'Qq'+VER+'Qq'   ;
    if( ( txtURLLowerCase.includes('??help')    )  ||
        ( txtURLLowerCase.includes('???')       )  ||
        ( txtURLLowerCase.includes('??command') )  ||
        ( txtURLLowerCase.includes('??cmd')     )   
      )
     {
      eventFetch.replies.push('Commands to the ServiceWorker look like ./PageThatDoesNotExist.html?'+ K_strServiceWorkerCommand + '=CommandForTheServiceWorker , like '+K_strServiceWorkerCommand + '=goAway')
     } 


}


function ServiceWorker_fetch_inquire(eventFetch){
  console.log(' in ServiceWorker_fetch_inquire', eventFetch.request.url)
  // A long inquire string is good because it's unlikely to collide, but is hard to type and can cause other problems with URI-encoding
  const K_strServiceWorkerInquire_RAW = ('QqServiceWorkerInquireQq' + APP_NAME + 'Qq'+VER+'Qq')   ;
  const K_strServiceWorkerInquire_esc  = encodeURIComponent(K_strServiceWorkerInquire_RAW);


  let txtURL = eventFetch.request.url.toString() ;// request.url  can be string, or a URL object
  let txtURLLowerCase = txtURL.toLowerCase();

  if( ( txtURLLowerCase.includes('??help')  )    ||
      ( txtURLLowerCase.includes('???')  )       ||
      ( txtURLLowerCase.includes('??inquiry')  ) ||
      ( txtURLLowerCase.includes('??inquire')  ) ||
      ( txtURLLowerCase.includes('??enquire')  )  
    )
   {
    eventFetch.replies.push('Inquiries to the ServiceWorker look like ?'+ K_strServiceWorkerInquire_esc + '=InquiryForTheServiceWorker , like '+K_strServiceWorkerInquire_esc + '=CACHE_DATE')
    // eventFetch.respondWith( new Response( 
    //   'Inquiries to the ServiceWorker look like\n ./PageThatDoesNotExist.html?'+ K_strServiceWorkerInquire + '=InquiryForTheServiceWorker , like '+K_strServiceWorkerInquire + '=CACHE_DATE'  
    // ))
    // console.log('Inquiries look like ./PageThatDoesNotExist.html?'+ K_strServiceWorkerCommand + '=CommandForTheServiceWorker'  )
  }
  if(  (txtURL.indexOf(K_strServiceWorkerInquire_esc)) === -1   ){
    
    // DO NOT CALL respondWith more than once. It REALLY messes with the caching.   eventFetch.respondWith( new Response('second response'))
return ;
  }
  // the URL looks like 
  //  somePage.html?QqServiceWorkerInquireQq=cacheDelete   
  //  somePage.html?QqServiceWorkerInquireQq=cacheAddPage%3Ahttps%3A%2F%2Fherrings.yes--we-have-no-bananas.gov%2Ftwo-way-messaging%2Fwebpage.html
  let theURL = new URL( txtURL );
          // for (const [key, value] of theURL.searchParams) {
          //   console.log(key,value);
          // }
    // maybe getAll for more elaborate URLs
  let inq = decodeURIComponent( theURL.searchParams.get( (K_strServiceWorkerInquire_RAW)) ).trim();
    //? maybe delete the searchParameter and pass this along to the RespondWith bit
    //theURL.searchParams.delete(K_strServiceWorkerCommand);
    // or we can use respondWith to return a value???

    //QqServiceWorkerInquireQqWindow ServiceWorkerCommunicatorQqv.031Qq CACHE_DATE
    //  got bit by a + in the APP_NAME that turned into a space
    console.log('inquire  URL contained inquiry parameter '+ K_strServiceWorkerInquire_esc  +': ' + inq + '    ' + APPandVER +' ' + NowISO8601()  );
  let question = inq ;
  let theParameters = '' ;
  let answer = ''; //If we get a simple, 'synchronous' [really: sequential] result, store that. Otherwise, store the promise
  let promAnswer =null;
  if(inq.includes(':')){
    let ndx = inq.indexOf(':')
    question = inq.substring(0,ndx).trim();
    theParameters = inq.substring(ndx+1);
    console.log(question, theParameters);
  }  
  switch ( question ) {
    case 'APP_NAME': 
        answer = APP_NAME ;
      break;
    case 'CACHE_NAME':
        answer = CACHE_NAME;
      break;
    case 'VER':
    case 'VERSION':
        answer = VER;
      break;
    case 'CACHE_DATE':

      //answer='Bob';



      // eventFetch.waitUntil( 
         
         
              //answer = 'Charlie';
              promAnswer=(  cacheGetDate(question) );
              // console.log(answer, NowISO8601(), `in async arrow function in waitUntil, after answer = cacheGetDate();`);
              // answer=answer.resolved
              // console.log(answer, NowISO8601(), `in async arrow function in waitUntil, after answer=answer.resolved`);
         
          // cacheGetDate().then( (txt)=>{ answer=txt;} ) );
        //  )
      console.log(promAnswer, NowISO8601(), `after eventFetch.waitUntil( answer = cacheGetDate)`)

// console.log(answer, NowISO8601()),`before eventFetch.waitUntil(   cacheGetDate()  );`;
//       eventFetch.waitUntil(   cacheGetDate()  );
// console.log(answer, NowISO8601(), `after eventFetch.waitUntil(   cacheGetDate()  );`);      
        //fetch(CACHE_TIMESTAMP_NAME).then( (response)=>response.text().then((txt)=>answer=txt)   )
       // eventFetch.waitUntil(  cacheGetDate()   );

      break;
    case 'CACHE_LIST':
        let listOfURLs =  /*await*/ listCachedURLs(CACHE_NAME) ;
        promAnswer = listOfURLs.toString() ;
      break;
    case 'ALL':
      
      break;
  
    default:
      break;
  }// end switch on inquire-->subtopic
  if(answer){
    eventFetch.replies.push( question + ':'+answer  );
  } else{
    eventFetch.replies.push(promAnswer);
  }
  //eventFetch.respondWith(  new Response(answer) );
} // end of ServiceWorker_fetch_inquire


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
  
function splitString(StringIn, Delimiter ){}



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
    console.log(i, subparts, NowISO8601());
    
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
              answer = VER;
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
        console.log(question,answer);
        //broadcastChannel.postMessage({about:'reply to inquire', topic: question, value: answer })
        postMessage_BroadcastChannel( {about:'reply to inquire', topic: question, value: answer } )

      break;

      case 'cacheTimeStamp':
  
        break;
      case 'cacheList':
            console.log('sw message_cmd cacheList '+ CACHE_NAME + '     ' + VER +' ' + NowISO8601() + LF);
            console.log('    ', CACHE_NAME,'  ', CACHE_FILES_LIST, NowISO8601());
          let strArrCachedURLs =   await listCachedURLs(CACHE_NAME) ;
            console.log('    ', 'the cached URLs are ' + LF + strArrCachedURLs.toString().split(',').join(LF) )
            console.log('end sw message_cmd cacheList '+ VER +' ' + NowISO8601() + LF);
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

function ServiceWorker_message(eventMessage){
    // this is the only place I call it, so I could make it an internal function, or even move it out of a function
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
        console.log( errorMsg);
        retVal = retVal + errorMsg
      }
    return( retVal );
    } // end function writeMessageToString
  
  console.log(' message event handler in ServiceWorker ' + VER +' ' + NowISO8601() );
  console.log( writeMessageToString(eventMessage)  , NowISO8601() );
  try {
    let cmd = eventMessage.data.cmd ;  // if object passed to  postMessage does not have data.cmd, this DOES NOT THROW AN ERROR, but assigns undefined to cmd.
    console.log('cmd = ' + cmd +' ' + VER +' ' + NowISO8601() );
    if(cmd){  //undefined is falsy, so an object missing cmd does not throw an error, but does skip this
      processCommands(cmd) ;
    } else {
     // findClientFromEvent(event).postMessage({txt: 'ServiceWorker got message missing a cmd property' })
      // broadcastToAllClients( {txt: 'ServiceWorker got message missing a cmd property'} );
    }
      
  } catch (error) {
    // ignore errors here
    console.log('catch block of ServiceWorker_message '+ error , NowISO8601());
  }
  // DO NOT SET UP AN ENDLESS LOOP broadcastChannel.postMessage( {txt:'this is a stupid message from the serviceWorker in ServiceWorker_message ',when: NowISO8601()})

}

function ServiceWorker_messageError(eventMessageError){
  // according to The service worker client is sent a message that cannot be deserialized from a service worker. See postMessage(message, options).
  // The service worker client is sent a message that cannot be deserialized from a service worker. See postMessage(message, options).
  console.log( 'messageerror event occurred ' + JSON.stringify(eventMessageError) +' ' + eventMessageError.constructor.name +' ' + NowISO8601() )


}
function ServiceWorker_stateChange(eventStateChange){
  console.log('serviceworker state change   new state is _' + screenLeft.state +'_ ' + NowISO8601()  );

}



async function cacheLoad(){
  console.log('start of cacheLoad in serviceWorker', self.location.href, NowISO8601() )

  // in MSEdge, cache.addAll works, even if given a bad URL
  // in Chrome, it fails and doesn't add ANY of the pages if one is not found
  //   so back to make my own caching routing

      // console.log('  about to try await caches.open(CACHE_NAME)', CACHE_NAME);
      // console.log('  the files to get ' , CACHE_FILES_LIST)
      // the next line fails if you try to run it from VSCode>Debug>Launch
      // Uncaught (in promise) DOMException: Failed to execute 'open' on 'CacheStorage': Unexpected internal error. 
      //  see comment on https://stackoverflow.com/questions/64297126/service-worker-fails-on-caches-open
    const cache = await   self.caches.open(CACHE_NAME);
      // console.log('   just opened cache. It is of type ' , cache.constructor.name)
    
    let nF=0;
    let nFiles = CACHE_FILES_LIST.length 
    let arrAddPromises = new Array( nFiles );
    let arrFinalNames  = new Array( nFiles) ;
    for( nF=0; nF<nFiles;nF++){
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
              console.log('  loaded '+ CACHE_FILES_LIST[n]  );
              arrFinalNames[n] = result.value ;
            } else {
              console.log('  did not load ' + CACHE_FILES_LIST[n] );
              arrFinalNames[n] = result.reason;
            }
            n = n + 1;
          })// close forEach()
      }); //close .then()  on Promise.allSettled()
      console.log('results and reasons', arrFinalNames.toString() );
      try {
        await cache.put( CACHE_TIMESTAMP_NAME, 
          new Response(  NowISO8601() )  ) ;
      } catch (error) {
        // this should only happen if a cached CACHE_TIMESTAMP_NAME is already there
        console.log('error trying to put ' + CACHE_TIMESTAMP_NAME ,error)
      }
      
      // await list CachedURLs(CACHE_NAME);
      let strArrCachedURLs = await listCachedURLs(CACHE_NAME);
      console.log(strArrCachedURLs.toString().split(',').join(LF) ) ;
      return ( nLoaded )   ;  // because this is async, we're in a promise. Chrome REALLY wants us to return something
      
 // this fails if any files don't exist await cache.addAll( CACHE_FILES_LIST );
}

async function listCachedURLs(nameOfCache){
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
  let retVal = new Array(theRequests.length);
  let i= 0;
  theRequests.forEach( (rq)=>{
      retVal[i] = rq.url;
      i++; 
    } )
  return ( retVal ) ;

  // console.log('List of URLs that are in cache ' + VER +' ' + NowISO8601() );
  // theRequests.forEach( (rq)=>{ console.log('  ' + rq.url) } )
  // console.log( NowISO8601(),LF);
} // end of async function listCachedURLs(nameOfCache)

async function cacheGetDate4() {
  let dateOfCache='Alice';
 
// let response = await fetch('./' + CACHE_TIMESTAMP_NAME); // this seems to not trigger ServiceWorker_fetch_typical, so it doesn't hit the cache at all
  console.log('in cacheGetDate')
console.log(dateOfCache, NowISO8601(),` after dateOfCache='Alice';`);        
  let cache = await self.caches.open(CACHE_NAME);
  console.log(cache)
console.log(dateOfCache, NowISO8601(),`after let cache = await self.caches.open(CACHE_NAME);`);      
  let response = await cache.match(CACHE_TIMESTAMP_NAME);
  console.log('response', CACHE_TIMESTAMP_NAME ,response)
console.log(dateOfCache, NowISO8601(),`after let response = await cache.match(CACHE_TIMESTAMP_NAME);`);

  dateOfCache = await response.text();
console.log(dateOfCache, NowISO8601(),`after  answer = await response.text();`);

  console.log('date returned',dateOfCache)
  // fetch CACHE_TIMESTAMP_NAME  from the cache, get the contents into answer 
  return( dateOfCache );
  
}

async function cacheGetDate5() {
  let dateOfCache='Alice';
 
let response0 = await fetch('./' + CACHE_TIMESTAMP_NAME); // this seems to not trigger ServiceWorker_fetch_typical, so it doesn't hit the cache at all

console.log(response0,response0.text())



console.log('in cacheGetDate')
console.log(dateOfCache, NowISO8601(),` after dateOfCache='Alice';`);        
  let cache = await self.caches.open(CACHE_NAME);
  console.log(cache)
console.log(dateOfCache, NowISO8601(),`after let cache = await self.caches.open(CACHE_NAME);`);      
  let response = await cache.match(CACHE_TIMESTAMP_NAME);
  console.log('response', CACHE_TIMESTAMP_NAME ,response)
console.log(dateOfCache, NowISO8601(),`after let response = await cache.match(CACHE_TIMESTAMP_NAME);`);

  dateOfCache = await response.text();
console.log(dateOfCache, NowISO8601(),`after  answer = await response.text();`);

  console.log('date returned',dateOfCache)
  // fetch CACHE_TIMESTAMP_NAME  from the cache, get the contents into answer 
  return( dateOfCache );
  
}



async function cacheGetDate5a() {
  let dateOfCache='Alice';
  console.log('cacheGetDate finished', 'date returned',dateOfCache)
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

  console.log('cacheGetDate finished', 'date returned',dateOfCache)
  // fetch CACHE_TIMESTAMP_NAME  from the cache, get the contents into answer 
  return( dateOfCache );
  
}

 async function cacheGetDate(question) {
  let dateOfCache='Alice';
  console.log('cacheGetDate started', '',dateOfCache,NowISO8601())

  // async function getIt(){
      let cache = await self.caches.open(CACHE_NAME);
      console.log('getIt started   let cache = await self.caches.open(CACHE_NAME)',cache,NowISO8601())
      let response = await cache.match(CACHE_TIMESTAMP_NAME);
      console.log('getIt           let response = await cache.match(CACHE_TIMESTAMP_NAME);',response,NowISO8601())
      dateOfCache = await response.text();
      console.log('getIt           finished', 'date returned',dateOfCache,NowISO8601())
  // };
  // let prom = getIt();
  // console.log('cacheGetDate   let prom = getIt();', '', prom, NowISO8601())
  // dateOfCache = prom.resolved;
  // console.log('cacheGetDate   dateOfCache = prom.resolved;', '',dateOfCache,NowISO8601())
  // fetch CACHE_TIMESTAMP_NAME  from the cache, get the contents into answer 
  return( question +':' +  dateOfCache );
  
}




// All of these postMessage functions accept only the first, plain object, and do not handle target origin, or transferable objects.
function addSourceAndTimeToMessageObject(objMessage){
  objMessage.from='ServiceWorker ' + APP_NAME + ' ' + VER   ;
  objMessage.fromURL=self.location.href;
  objMessage.when=NowISO8601();
  
  return( objMessage ) ;// in case callerBoy use   let fixedMessage=addSourceAndTimeToMessageObject(   )
}

function postMessage_BroadcastChannel(objMessage){
  //appends some source properties for debugging use, then posts using broadcastChannel API
  addSourceAndTimeToMessageObject(objMessage);

  objMessage.how='BroadcastChannel '+ broadcastChannel.name;

  broadcastChannel.postMessage(objMessage);
}

function postMessage_ALLClients(objMessage){
  // from https://felixgerschau.com/how-to-communicate-with-service-workers/
  
  let matchOptions = {  includeUncontrolled: true,   type: 'window'}

  addSourceAndTimeToMessageObject(objMessage);
  objMessage.how='Client postMessage';
  
  console.log('in postMessage_ALLClients ' + JSON.stringify(objMessage) );  

  self.clients.matchAll(  matchOptions)
  .then( 
    (clients) => {
      console.log(clients);
      if (clients && clients.length) { // this is a check for clients exists and clients has elements
        console.log (clients.length )
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

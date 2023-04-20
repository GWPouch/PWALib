
const APP_NAME = 'Window+ServiceWorkerCommunicator';
const broadcastChannel = new BroadcastChannel( APP_NAME);
broadcastChannel.onmessage=ServiceWorker_message ;


const LF = "\n";
const VER='v.030'
function NowISO8601( ){  return(  ( new Date() ).toISOString()    ); }

function describeObject(obj){
  let retVal = 'ConstructorName: ' +  obj.constructor.name + EOL ;

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

  retVal = retVal  +  'allEnumerableMembers: [ ' ;
  for(let key3 in obj){
    //https://stackoverflow.com/questions/208016/how-to-list-the-properties-of-a-javascript-object/32413145#32413145
    retVal = retVal + key3 + ' , ' ; //stackoverflow claims this will get ancestor properties too
  }
  retVal = retVal  + '];\n' ;

  return(retVal);
} //end of describeObject

///////////////////////////////////////////////////////////////////////////////

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



function ServiceWorker_MAIN(){
  // set 'global' variables (accessible only to the ServiceWorker and its children)

  //attach eventlisteners


  self.addEventListener( 'install',     ServiceWorker_install) ;
  self.addEventListener( 'activate',    ServiceWorker_activate);
  self.addEventListener( 'fetch',       ServiceWorker_fetch);
  self.addEventListener( 'message',     ServiceWorker_message);
  

}
ServiceWorker_MAIN();


function exServiceWorker_install(installEvent){
  //event 1   This happens after a window calls 
  // navigator.serviceWorker.register(relURLOfServiceWorker, { scope: relScopeOfServiceWorker })
  // this file gets downloaded and parsed, and out-of-function statements are executed.
  //  After initializing variables, you would call 
  // self.addEventHandler('install', ServiceWorker_install) 
  // this is where you cache files for later use, and maybe set some global, persistent variables.
  // this might only happen once in several days

  // you might call
  //    self.skipWaiting()
  // to immediately pass into the next state   active
  // If this run is the first time the user has come to the site and loaded the page that loaded this ServiceWorker
  //   the install event happens immediately, but it remains in a waiting-state (called installed) until the user navigates away from that page. 
  // so calling self.skipWaiting()  is not a terrible idea for a simple should-be-file:// monolithic page. 
}
function ServiceWorker_activate(ActivateEvent){
  // The happens when this serviceWorker takes control of the scope-of-pages specified in the serviceWorker.register call.
  //  On a first visit, activate happens right after install.
  //  
  // clean up old caches, maybe transferring their contents to new caches
  
}




function processCommands(cmd){}

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
  broadcastChannel.postMessage( {txt:'this is a stupid message from the serviceWorker'})

}

function ServiceWorker_install(event){
  console.log('In start of ServiceWorker_install  event listener for install  ' + VER +' ' + NowISO8601() );
 //  function postMessage does not exist postMessage( {from:'ServiceWorker', what: 'install event handler', when:NowISO8601() } )  
  sendMessageToALLClients({from:'Service Worker', when: NowISO8601(), what:'install finished'})
} // end of ServiceWorker_install


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


self.addEventListener('install', ServiceWorker_install);
self.addEventListener('message', ServiceWorker_message);
broadcastChannel.onmessage = ServiceWorker_message ;
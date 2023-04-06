  function messageReceiver(event){
    let theData = event.data
    console.log( writeMessageToString(event) );

    // showMessageInConsole(event);

    console.log('worker received message: ' + JSON.stringify( theData ) );
    //take apart data here
    let base = theData.base;
    let exponent = theData.exponent;

    let result = Math.pow( base, exponent  );
    let obj ={result:result, base:base, exponent:exponent, time:nowISO8601() }
    self.postMessage( obj  );

  }

  function nowISO8601(){ return(  (new Date).toISOString() )  }
 

  function showMessageInConsole(event){
    console.log('Properties of event ' + ' ' + nowISO8601() );
    console.log('  type ' + typeof event ); //just comes in as 'object'
    console.log('  event.constructor.name '  + event.constructor.name );
    console.log('  event.lastEventId _' + event.lastEventId +'_'  ); //this was blank
    console.log('  event.source ' + event.source ); //this was null
    console.log('  event.origin _' + event.origin + '_' );
    console.log('  event.data ' +  JSON.stringify( event.data ) );
   

    console.log('  ');
  }

  function writeMessageToString(event){
    let retVal = ('Event processed at ' + ' ' + nowISO8601() +'\n' ) ;
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

    console.log('  type ' + typeof event ); //just comes in as 'object'
    console.log('  event.constructor.name '  + event.constructor.name );
    console.log('  event.lastEventId _' + event.lastEventId +'_'  ); //this was blank
    console.log('  event.source ' + event.source ); //this was null
    console.log('  event.origin _' + event.origin + '_' );
    console.log('  event.data ' +  JSON.stringify( event.data ) );



  }


  let strThreadStarted=nowISO8601();

  self.onmessage = messageReceiver ;
  


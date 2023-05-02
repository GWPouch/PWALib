////////////////////////////////////////////////////////////////////////////////
  // for debugging use.  LF,  NowISO8601, describeObject
  const LF = "\n";
  const EOL = ';\n';

  
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
  // con sole.log('navigator in a Worker', describeObject(navigator));
  // con sole.log('self in a Worker', describeObject(self))
///////////////////////////////////////////////////////////////////////////////

  function messageReceiver(event){
    let theData = event.data
    console.log( writeMessageToString(event) );

    // showMessageInConsole(event);

    console.log('worker received message: ' + JSON.stringify( theData ) );
    //take apart data here
    let base = theData.base;      
    let exponent = theData.exponent;

    let result = Math.pow( base, exponent  );
    let obj ={result:result, base:base, exponent:exponent, time:NowISO8601() }
    self.postMessage( obj  );

  }

  // function NowISO8601(){ return(  (new Date).toISOString() )  }
 

  function showMessageInConsole(event){
    console.log('Properties of event ' + ' ' + NowISO8601() );
    console.log('  type ' + typeof event ); //just comes in as 'object'
    console.log('  event.constructor.name '  + event.constructor.name );
    console.log('  event.lastEventId _' + event.lastEventId +'_'  ); //this was blank
    console.log('  event.source ' + event.source ); //this was null
    console.log('  event.origin _' + event.origin + '_' );
    console.log('  event.data ' +  JSON.stringify( event.data ) );
   

    console.log('  ');
  }

  function writeMessageToString(event){
    let retVal = ('Event processed at ' + ' ' + NowISO8601() +'\n' ) ;
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


  let strThreadStarted=NowISO8601();

  self.onmessage = messageReceiver ;
  


const inputField = document.getElementById('input-temp');
const fromUnitField = document.getElementById('input-unit');
const toUnitField = document.getElementById('output-unit');
const outputField = document.getElementById('output-temp');
const form = document.getElementById('converter');

const CACHE_NAME = `temperature-converter-v4`;
const FILES_TO_CACHE = [
  './temp-converter.html',
  './converter.js',
  './converter.css'
];   

function NowISO8601( ){  return( ( new Date() ).toISOString()    ); }

function cacheClear(){
  console.log('In cacheClear ' + NowISO8601()  )
  caches.delete(CACHE_NAME);
}

async function cacheRefresh(){
  //alert('This is in cacheRefresh()');
  console.log('In cacheRefresh ' + NowISO8601() );

  const cache =  await caches.open(CACHE_NAME);
  console.log('In cacheRefresh after caches.open() ' + NowISO8601() )
  console.log('In cacheRefresh '  +  cache.toString() )
  
  cache.addAll(FILES_TO_CACHE );
  
  //store a timestamp, and maybe display it to the user on the page

}



function convertTemp(value, fromUnit, toUnit) {
  if (fromUnit === 'c') {
    if (toUnit === 'f') {
      return value * 9 / 5 + 32;
    } else if (toUnit === 'k') {
      return value + 273.15;
    }
    return value;
  }
  if (fromUnit === 'f') {
    if (toUnit === 'c') {
      return (value - 32) * 5 / 9;
    } else if (toUnit === 'k') {
      return (value + 459.67) * 5 / 9;
    }
    return value;
  }
  if (fromUnit === 'k') {
    if (toUnit === 'c') {
      return value - 273.15;
    } else if (toUnit === 'f') {
      return value * 9 / 5 - 459.67;
    }
    return value;
  }
  throw new Error('Invalid unit');
}

form.addEventListener('input', () => {
  const inputTemp = parseFloat(inputField.value);
  const fromUnit = fromUnitField.value;
  const toUnit = toUnitField.value;

  const outputTemp = convertTemp(inputTemp, fromUnit, toUnit);
  outputField.value = (Math.round(outputTemp * 100) / 100) + ' ' + toUnit.toUpperCase();
});

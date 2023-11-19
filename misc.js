
function _ (s) {
  if (s[0] === '#') {
    return document.getElementById(s.slice(1));
  } else if (s[0] === '.') {
    return document.getElementsByClassName(s.slice(1));
  } else {
    throw Error('Not Implemented: selector=[' + s + ']');
  }
}

function getURLparam(name){
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function range(low, high, step){
  if(step===undefined){
    step = 1;
  }
  if(high===undefined){
    high = low;
    low = 0;
  }
  return [...Array(Math.round((high-low)/step)).keys()].map(x=>low + step*x);
}

function randi(low, high){
  if(high===undefined){
    high = low;
    low = 0;
  }
  return Math.floor(low + Math.random() * (high-low));
}

Array.prototype.randomElt = function(){
  return this[randi(this.length)];
}


function gen_random_key(len){
  return range(len).map(_ => gen_random_key.chars.randomElt()).join('');
}
gen_random_key.chars = [...'0123456789-qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'];


function genUniqueKey(dict){
  if(dict===undefined){
    dict = genUniqueKey.keys;
  }
  var tries = 0;
  if((!genUniqueKey.len)||(genUniqueKey.len < 1)){
    genUniqueKey.len = 3;
  }
  for(;;){
    var key = gen_random_key(genUniqueKey.len);
    if(key in genUniqueKey.keys){
      tries++;
      if(tries > 10){
        genUniqueKey.len++;
      }
    } else {
      genUniqueKey.keys[key] = 1;
      return key;
    }
  }
}

genUniqueKey.keys = {};
genUniqueKey.len = 3;

function _ (s) {
  if (s[0] === '#') {
    return document.getElementById(s.slice(1));
  } else if (s[0] === '.') {
    return document.getElementsByClassName(s.slice(1));
  } else {
    throw Error('Not Implemented: selector=[' + s + ']');
  }
}

var lruCookieName = "sgsLru";

function putLruToCookie(item, lruString, maxSize) {
  var lru = [];
  if (lruString) {
    lru = lruString.split(",");
  }
  var lrusize = lru.length;
  var startIndex=item.indexOf("(");
  var endIndex=item.indexOf(")")+1;
  cookieItem=item.substring(startIndex, endIndex);
  var curIndex = $.inArray(cookieItem, lru);
  if (curIndex == -1) {
    if (lru.length >= maxSize) {
      lru.pop();
    }
  } else {
    lru.splice(curIndex, 1);
  }
  lru.unshift(cookieItem);
  return lru.toString();
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  cookieValue = cname + "=" + cvalue + ";" + expires + ";path=/";
  document.cookie = cookieValue;
}

function updateLruCookie(item, dropdownSize) {
  var lruCookie = getCookie(lruCookieName);
  var newLruCookieString = putLruToCookie(item, lruCookie, dropdownSize);
  setCookie(lruCookieName, newLruCookieString, 7);
}

function getLruCookie(baseSet) {
  var lruCookie = getCookie(lruCookieName);
  var matches;
  matches = [];
  if(lruCookie){
    var lruCookies = lruCookie.split(",");
    for(k=0;k<lruCookies.length;k++){
      $.each(baseSet, function (i, str) {
        if (str.endsWith(lruCookies[k])) {
          matches.push(str);
        }
      });
    }
  }
  return matches;
}
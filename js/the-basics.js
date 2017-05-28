$(document).ready(function () {
  var goodtogo = "无禁将组合，请放心使用！";
  var bannedPrefix = "禁将表：";
  var wujiangBaseSet = Object.keys(wujiangBaseMap);
  var dropdownSize=15;

  var substringMatcher = function (strs) {
    return function findMatches(q, cb) {
      var matches, substringRegex;

      // an array that will be populated with substring matches
      matches = [];

      if(q.length>0){
        // regex used to determine if a string contains the substring `q`
        var newQ=".*";
        for(k=0;k< q.length;k++){
          newQ+=q[k]+".*";
        }
        substrRegex = new RegExp(newQ, 'i');

        // iterate through the pool of strings and for any string that
        // contains the substring `q`, add it to the `matches` array
        $.each(strs, function (i, str) {
          if (substrRegex.test(str)) {
            matches.push(str);
          }
        });
      }else{
        matches=getLruCookie(wujiangBaseSet);
      }
      if(isFalsy(matches)){
        cb(matches);
      }
    };
  };

  function isFalsy(matches) {
    if(matches && matches.length>0){
      for(i=0;i<matches.length;i++){
        if (matches[i]) {
          return true;
        }
      }
    }
    return false;
  }

  $('.typeahead').typeahead({
        hint: false,
        highlight: true,
        minLength: 0
      },
      {
        name: 'bannedKeys',
        source: substringMatcher(wujiangBaseSet),
        limit: dropdownSize
      }
  );

  function selectHandler(obj, datum, name) {
    var key = datum.replace(/\r?\n|\r/g, " ").trim();
    var banned = "";
    var fontcolor="black";
    if ($.inArray(key, wujiangBaseSet) >= 0) {
      if (wujiangBannedMap[key]) {
        banned = bannedPrefix + wujiangBannedMap[key];
        fontcolor="red";
      } else {
        banned = goodtogo;
        fontcolor="green";
      }
      $("#skillswrapper").html(renderSkills(wujiangBaseMap[key]));
      updateLruCookie(key, dropdownSize);
    }
    $("#outputwrapper").text(banned);
    $("#outputwrapper").css({ 'color': fontcolor });
    $("#btnClear").focus();
  }

  $('.typeahead').bind('typeahead:selected', selectHandler);

  function arrowHandler() {
    var fontcolor="black";
    var key = $(".typeahead").val();
    if(key){
      var banned = "";
      if ($.inArray(key, wujiangBaseSet) >= 0) {
        if (wujiangBannedMap[key]) {
          banned = bannedPrefix + wujiangBannedMap[key];
          fontcolor="red";
        } else {
          banned = goodtogo;
          fontcolor="green";
        }
        $("#skillswrapper").html(renderSkills(wujiangBaseMap[key]));
      }
      $("#outputwrapper").text(banned);
      $("#outputwrapper").css({ 'color': fontcolor });
    }
  }
  function renderSkills(skills) {
    //var list = '<ul><li>' + skills.join('</a></li><li>') + '</li></ul>';
    var $ul = $('<ul>')
        .append(skills.map(function(skill) {
          return $("<li>").addClass('skillItem').text(skill);
        })
    );
    return $ul;
  }

  $(".typeahead").on('typeahead:change keyup paste mouseup touchend', arrowHandler);

  $("#btnClear").click(function () {
    $('.typeahead').typeahead('val', '');
    $("#outputwrapper").text("");
    $("#skillswrapper").text("");
    $(".typeahead").focus();
  });

  $(".typeahead").focus();

  // validate that all of the banned map entries can be found in the base set
  function validate(){
    var matches=[];
    $.each(Object.keys(wujiangBannedMap), function (i, key) {
      if ($.inArray(key, wujiangBaseSet) == -1) {
        matches.push(key);
      }
    });

    var msg="";
    var cookieEnabled = navigator.cookieEnabled;
    if(!cookieEnabled){
      msg+="Cookie is currently disabled. <br/>Enable browser cookie for search history hint.";
    }
    if(matches && matches.length>0){
      msg+="<br/>keys missing base:"+JSON.stringify(matches);
    }
    if(!msg){
      msg="Data valid";
    }
    $("#outputwrapper").html(msg);
  }

  validate();

});


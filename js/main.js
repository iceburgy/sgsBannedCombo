$(document).ready(function () {
  var goodtogo = "无禁将组合，请放心使用！";
  var bannedPrefix = "禁将表：";
  var wujiangBaseMap={};
  var wujiangBaseSet=[];
  var wujiangBannedMap={};
  var dropdownSize=15;

  function populateBase(baseMap, baseSet) {
    wujiangBaseMap=baseMap;
    wujiangBaseSet = baseSet;
  }
  function readSgsWujiangBaseMap()
  {
    $.ajax({
      url: "https://api.dropboxapi.com/2/paper/docs/download",
      async: false,
      type: "POST",
      headers: {"Authorization": "Bearer wzahoqHWjoQAAAAAAAAAFV2iwzrw_BFSgaena__5iraqztOyTepnnUc5J1S-73FM",
        "Dropbox-API-Arg": "{\"doc_id\": \"UQrFsr20jVBKgsJPDBoBj\",\"export_format\": \"markdown\"}"},
      success: function(result) {
        var baseMap=result.split('\n');
        baseMap.splice(0, 1);
        baseMap=JSON.parse(baseMap.join(' '));
        var baseSet=Object.keys(baseMap);
        populateBase(baseMap, baseSet);

        $('.typeahead').typeahead({
              hint: false,
              highlight: true,
              minLength: 0
            },
            {
              name: 'bannedKeys',
              source: substringMatcher(baseSet),
              limit: dropdownSize
            }
        );
      }
    });
  }

  function populateBannedMap(bannedMap) {
    wujiangBannedMap=bannedMap;
  }

  function readSgsWujiangBannedMap()
  {
    $.ajax({
      url: "https://api.dropboxapi.com/2/paper/docs/download",
      async: false,
      type: "POST",
      headers: {"Authorization": "Bearer wzahoqHWjoQAAAAAAAAAFV2iwzrw_BFSgaena__5iraqztOyTepnnUc5J1S-73FM",
        "Dropbox-API-Arg": "{\"doc_id\": \"gO8sAY4eYAlF2OQ6QPk5T\",\"export_format\": \"markdown\"}"},
      success: function(result) {
        var bannedMap=result.split('\n');
        bannedMap.splice(0, 1);
        bannedMap=JSON.parse(bannedMap.join(' '));
        populateBannedMap(bannedMap);
      }
    });
  }

  function populateBannedMap(bannedMap) {
    wujiangBannedMap=bannedMap;
  }

  function readSgsGameRules()
  {
    $.ajax({
      url: "https://api.dropboxapi.com/2/paper/docs/download",
      async: false,
      type: "POST",
      headers: {"Authorization": "Bearer wzahoqHWjoQAAAAAAAAAFV2iwzrw_BFSgaena__5iraqztOyTepnnUc5J1S-73FM",
        "Dropbox-API-Arg": "{\"doc_id\": \"8vMPGb0J3phwyY8zQjJmP\",\"export_format\": \"markdown\"}"},
      success: function(result) {
        $("#gameRules").html(result.split('\n').join("<br/>"));
      }
    });
  }

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
        newQ=newQ.replace("\(","\\\(").replace("\)","\\\)");
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
      if(isTruthy(matches)){
        cb(matches);
      }
    };
  };

  function isTruthy(matches) {
    if(matches && matches.length>0){
      for(i=0;i<matches.length;i++){
        if (matches[i]) {
          return true;
        }
      }
    }
    return false;
  }

  function selectHandler(obj, datum, name) {
    var key = datum.replace(/\r?\n|\r/g, " ").trim();
    var skills = "";
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
      skills=renderSkills(wujiangBaseMap[key]);
      updateLruCookie(key, dropdownSize);
    }
    $("#skillswrapper").html(skills);
    $("#outputwrapper").text(banned);
    $("#outputwrapper").css({ 'color': fontcolor });
    $("#btnClear").focus();
  }

  function arrowHandler() {
    var fontcolor="black";
    var key = $(".typeahead").val();
    if(key){
      var skills = "";
      var banned = "";
      if ($.inArray(key, wujiangBaseSet) >= 0) {
        if (wujiangBannedMap[key]) {
          banned = bannedPrefix + wujiangBannedMap[key];
          fontcolor="red";
        } else {
          banned = goodtogo;
          fontcolor="green";
        }
        skills=renderSkills(wujiangBaseMap[key]);
      }
      $("#skillswrapper").html(skills);
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

  $(".tablinks").click(function (data) {

     $.each($(".mainWrapper"), function (i, element) {
       $(element).hide();
     });
     $.each($(".tablinks"), function (i, element) {
       $(element).removeClass("active");
     });

     // Show the current tab, and add an "active" class to the button that opened the tab
     var contentId=data.target.id.split("_")[1];
     $("#"+contentId).show();
     $(data.target).addClass("active");
  });

  readSgsGameRules();
  readSgsWujiangBaseMap();
  readSgsWujiangBannedMap();
  $('.typeahead').bind('typeahead:selected', selectHandler);

  $(".typeahead").on('typeahead:change keyup paste mouseup touchend', arrowHandler);

  $("#btnClear").click(function () {
    $('.typeahead').typeahead('val', '');
    $("#outputwrapper").text("");
    $("#skillswrapper").text("");
    $(".typeahead").focus();
  });

  validate();

});


$(document).ready(function () {
  var goodtogo = "无禁将组合，请放心使用！";
  var bannedPrefix = "禁将表：";
  var wujiangBaseMap={"a":"b"};
  var wujiangBaseSet=[""];
  var wujiangBannedMap={"a":"b"};
  var dropdownSize=15;



  readSgsWujiangBaseMap();
  readSgsWujiangBannedMap();
  function populateBase(bs) {
    wujiangBaseMap=bs;
    wujiangBaseSet = Object.keys(wujiangBaseMap);
    for(i=0;i< wujiangBaseSet.length;i++){
      wujiangBaseSet[i]=wujiangBaseSet[i].replace(/\r?\n|\r/g, " ").trim();
    }
  }
  function readSgsWujiangBaseMap()
  {
    $.ajax({
      url: "https://api.dropboxapi.com/2/paper/docs/download",
      type: "POST",
      headers: {"Authorization": "Bearer wzahoqHWjoQAAAAAAAAAFV2iwzrw_BFSgaena__5iraqztOyTepnnUc5J1S-73FM",
        "Dropbox-API-Arg": "{\"doc_id\": \"UQrFsr20jVBKgsJPDBoBj\",\"export_format\": \"markdown\"}"},
      success: function(result) {
        var raw=result.split('\n');
        raw.splice(0, 1);
        raw=JSON.parse(raw.join(' '));
        var bs=Object.keys(raw);
        for (var i = 0; i < bs.length; i++) {
          bs[i]=bs[i].replace(/\r?\n|\r/g, " ").trim();
        }

        populateBase(raw);
        $('.typeahead').typeahead({
              hint: false,
              highlight: true,
              minLength: 1
            },
            {
              name: 'bannedKeys',
              source: substringMatcher(bs),
              limit: 20
            }
        );
      }
    });
  }

  function populateBannedMap(bm) {
    wujiangBannedMap=bm;
  }

  function readSgsWujiangBannedMap()
  {
    $.ajax({
      url: "https://api.dropboxapi.com/2/paper/docs/download",
      type: "POST",
      headers: {"Authorization": "Bearer wzahoqHWjoQAAAAAAAAAFV2iwzrw_BFSgaena__5iraqztOyTepnnUc5J1S-73FM",
        "Dropbox-API-Arg": "{\"doc_id\": \"gO8sAY4eYAlF2OQ6QPk5T\",\"export_format\": \"markdown\"}"},
      success: function(result) {
        var raw=result.split('\n');
        raw.splice(0, 1);
        raw=JSON.parse(raw.join(' '));
        populateBannedMap(raw);
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

  $('.typeahead').bind('typeahead:selected', selectHandler);

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

  $(".typeahead").on('typeahead:change keyup paste mouseup touchend', arrowHandler);

  $("#btnClear").click(function () {
    $('.typeahead').typeahead('val', '');
    $("#outputwrapper").text("");
    $("#skillswrapper").text("");
    $(".typeahead").focus();
  });

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


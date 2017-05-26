$(document).ready(function () {
  var goodtogo="无禁将组合，请放心使用！";
  var bannedKeys = [];
  var bannedMap = new Map();

  readSgsWujiangSet();
  readSgsWujiangMap();
  function populateBannedSet(bs) {
    bannedKeys=bs;
  }
  function readSgsWujiangSet()
  {
    $.ajax("https://spreadsheets.google.com/spreadsheet/pub?key=1_Wel_JJ-zD-mL8AKWb_P3dhJiQeERwdgwtTMVXMv2mI&output=csv").done(function(result){
      var bs=result.split("\n");
      for (var i = 0; i < bs.length; i++) {
        bs[i]=bs[i].replace(/\r?\n|\r/g, " ").trim();
      }

      populateBannedSet(bs);
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
    });
  }

  function populateBannedMap(bm) {
    bannedMap=bm;
  }

  function readSgsWujiangMap()
  {
    $.ajax("https://spreadsheets.google.com/spreadsheet/pub?key=1oQ6G8YwcG1d53P8MBtsAmN2PI-MtzvVZYvcb8HBRHWs&output=csv").done(function(result){
      var bm=new Map();
      var rows = result.split("\n");
      for (var i = 0; i < rows.length; i++) {
        var cells = rows[i].split(",");
        bm.set(cells[0].replace(/\r?\n|\r/g, " ").trim(), cells[1].replace(/\r?\n|\r/g, " ").trim());

      }
      populateBannedMap(bm);
    });
  }

  function isUpperCase(aCharacter)
  {
    return (aCharacter >= 'A') && (aCharacter <= 'Z');
  }
  function getInitials(input)
  {
    var res = "";
    for (var i = 0, len = input.length; i < len; i++) {
      if(isUpperCase(input[i]))
      {
        res = res+input[i];
      }
    }
    return res;
  }
  var substringMatcher = function (strs) {
    return function findMatches(q, cb) {
      var matches, substringRegex;

      // an array that will be populated with substring matches
      matches = [];

      // regex used to determine if a string contains the substring `q`
      substrRegex = new RegExp(q, 'i');

      // iterate through the pool of strings and for any string that
      // contains the substring `q`, add it to the `matches` array
      $.each(strs, function (i, str) {
        var initials=getInitials(str);
        if (substrRegex.test(str) || substrRegex.test(initials)) {
          matches.push(str);
        }
      });

      cb(matches);
    };
  };

  function selectHandler(obj, datum, name) {
    var key = datum.replace(/\r?\n|\r/g, " ").trim();
    var banned = "";
    if ($.inArray(key, bannedKeys) >= 0) {
      if (bannedMap.get(key)) {
        banned = bannedMap.get(key);
      } else {
        banned = goodtogo;
      }
    }
    $("#outputwrapper").text(banned);
    $("#btnClear").focus();
  }
  $('.typeahead').bind('typeahead:selected', selectHandler);

  function arrowHandler() {
    var key = $(".typeahead").val();
    var banned = "";
    if ($.inArray(key, bannedKeys) >= 0) {
      if (bannedMap.get(key)) {
        banned = bannedMap.get(key);
      } else {
        banned = goodtogo;
      }

    }
    $("#outputwrapper").text(banned);
  }
  $(".typeahead").on('change keyup paste mouseup', arrowHandler);

  $("#btnClear").click(function() {
    $(".typeahead").val("");
    $("#outputwrapper").text("");
    $(".typeahead").focus();
  });

  $(".typeahead").focus();

});


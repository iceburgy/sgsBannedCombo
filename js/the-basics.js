$(document).ready(function () {
  var goodtogo = "无禁将组合，请放心使用！";

  function isUpperCase(aCharacter) {
    return (aCharacter >= 'A') && (aCharacter <= 'Z');
  }

  function getInitials(input) {
    var res = "";
    for (var i = 0, len = input.length; i < len; i++) {
      if (isUpperCase(input[i])) {
        res = res + input[i];
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
        var initials = getInitials(str);
        if (substrRegex.test(str) || substrRegex.test(initials)) {
          matches.push(str);
        }
      });

      cb(matches);
    };
  };

  $('.typeahead').typeahead({
        hint: false,
        highlight: true,
        minLength: 1
      },
      {
        name: 'bannedKeys',
        source: substringMatcher(wujiangBaseSet),
        limit: 20
      }
  );

  function selectHandler(obj, datum, name) {
    var key = datum.replace(/\r?\n|\r/g, " ").trim();
    var banned = "";
    if ($.inArray(key, wujiangBaseSet) >= 0) {
      if (wujiangBannedMap[key]) {
        banned = wujiangBannedMap[key];
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
    if ($.inArray(key, wujiangBaseSet) >= 0) {
      if (wujiangBannedMap[key]) {
        banned = wujiangBannedMap[key];
      } else {
        banned = goodtogo;
      }

    }
    $("#outputwrapper").text(banned);
  }

  $(".typeahead").on('change keyup paste mouseup', arrowHandler);

  $("#btnClear").click(function () {
    $(".typeahead").val("");
    $("#outputwrapper").text("");
    $(".typeahead").focus();
  });

  $(".typeahead").focus();

});


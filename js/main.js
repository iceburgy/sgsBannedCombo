$(document).ready(function () {
  var goodtogo = "无禁将组合，请放心使用！";
  var bannedPrefix = "禁将表：";
  var wujiangBaseMap={};
  var wujiangBaseSet=[];
  var wujiangBannedMap={};
  var dropdownSize=15;
  var wujiangPageSize=999;
  var paginationBar="";
  var PAGE="page";
  var BUTTON="button";
  var editMade=false;

  function populateBase(baseMap, baseSet) {
    wujiangBaseMap=baseMap;
    wujiangBaseSet = baseSet;
  }
  function readSgsWujiangBaseMap()
  {
    $.ajax({
      url: "https://api.dropboxapi.com/2/paper/docs/download",
      async: true,
      type: "GET",
      headers: {"Authorization": "Bearer wzahoqHWjoQAAAAAAAAAFV2iwzrw_BFSgaena__5iraqztOyTepnnUc5J1S-73FM",
        "Dropbox-API-Arg": "{\"doc_id\": \"UQrFsr20jVBKgsJPDBoBj\",\"export_format\": \"markdown\"}"},
      success: function(result) {
        var baseMap=result.split('\n');
        baseMap.splice(0, 1);
        baseMap=JSON.parse(baseMap.join(' '));
        var baseSet=Object.keys(baseMap);

        populateBase(baseMap, baseSet);

        var container=$("<div>").addClass("activePage")
            .attr({
              id: PAGE+"1"});
        $.each(baseSet, function (i, name) {
          container.append(renderWujiang(name, baseMap[name]));
          if((i+1)%wujiangPageSize==0 || i+1==baseSet.length){
            //$("#wujiang").append(container);
            container=$("<div>").addClass("visuallyHidden")
                .attr({
                  id: PAGE+(Math.floor((i+1)/wujiangPageSize)+1)});
          }
        });
        paginationBar=$("<div>").addClass("w3-bar w3-center paginationBar");
        paginationBar.append($("<a>")
            .attr({
              href: "javascript:void(0)",
              id: BUTTON+"Prev"})
            .addClass("w3-bar-item w3-button pageButton")
            .html("&laquo;"));
        for(i=0;i<=(baseSet.length-1)/wujiangPageSize;i++){
          var pageNum=i+1;
          var darkGrey="";
          if(i==0){
            darkGrey="w3-dark-grey";
          }
          paginationBar.append($("<a>")
              .attr({
                href: "javascript:void(0)",
                id: BUTTON+pageNum})
              .addClass("w3-bar-item w3-button pageButton "+darkGrey)
              .html(pageNum));
        }
        paginationBar.append($("<a>")
            .attr({
              href: "javascript:void(0)",
              id: BUTTON+"Next"})
            .addClass("w3-bar-item w3-button pageButton")
            .html("&raquo;"));
        //$("#wujiang").append(paginationBar);

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

  function readSgsWujiangBannedMap()
  {
    $.ajax({
      url: "https://api.dropboxapi.com/2/paper/docs/download",
      async: true,
      type: "GET",
      headers: {"Authorization": "Bearer wzahoqHWjoQAAAAAAAAAFV2iwzrw_BFSgaena__5iraqztOyTepnnUc5J1S-73FM",
        "Dropbox-API-Arg": "{\"doc_id\": \"gO8sAY4eYAlF2OQ6QPk5T\",\"export_format\": \"markdown\"}"},
      success: function(result) {
        var bannedMap=result.split('\n');
        bannedMap.splice(0, 1);
        bannedMap=JSON.parse(bannedMap.join('\n'));
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
      async: true,
      type: "GET",
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

      matches = [];

      if(q.length>0){
        var newQ=".*";
        for(k=0;k< q.length;k++){
          newQ+=q[k]+".*";
        }
        newQ=newQ.replace("\(","\\\(").replace("\)","\\\)");
        substrRegex = new RegExp(newQ, 'i');

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

  function btnAddDeleteComboHandler(event) {
    var outputwrapperid='#editoutputwrapper';
    if(event.currentTarget.id=='btnEditSubmit'){
      if(editMade){
        uploadWujiangBannedMap(outputwrapperid);
        editMade=false;
      }
      else{
        $(outputwrapperid).append("<br/>No edits made, submit skipped");
      }
      return;
    }
    var role1=$(".typeaheadedit1").val();
    var role2=$(".typeaheadedit2").val();

    if(!role1) $(outputwrapperid).append("<br/>Missing first role");
    else if(!role2) $(outputwrapperid).append("<br/>Missing second role");
    else if ($.inArray(role1, wujiangBaseSet) == -1) {
      $(outputwrapperid).append("<br/>Invalid first role name: "+role1);
    }
    else if ($.inArray(role2, wujiangBaseSet) == -1) {
      $(outputwrapperid).append("<br/>Invalid second role name: "+role2);
    }
    else if (role1==role2) {
      $(outputwrapperid).append("<br/>Same role name: "+role1);
    }
    else {
      var updated1to2=false, updated2to1=false;
      if(event.currentTarget.id=='btnAddCombo'){
        updated1to2=addCombo(role1, role2, outputwrapperid);
        updated2to1=addCombo(role2, role1, outputwrapperid);
      }else{
        updated1to2=deleteCombo(role1, role2, outputwrapperid);
        updated2to1=deleteCombo(role2, role1, outputwrapperid);
      }
      editMade=editMade||updated1to2||updated2to1
    }
  }

  function addCombo(role1, role2, outputwrapperid) {
    var updated=false;
    if($.inArray(role2, wujiangBannedMap[role1]) >= 0){
      $(outputwrapperid).append("<br/>mapping from "+role1+" to "+role2+" already exists, skipped");
    }
    else{
      if(!wujiangBannedMap[role1]){
        wujiangBannedMap[role1]=[];
      }
      wujiangBannedMap[role1].push(role2);
      $(outputwrapperid).append("<br/>mapping from "+role1+" to "+role2+" added");
      updated=true;
    }
    return updated;
  }

  function deleteCombo(role1, role2, outputwrapperid) {
    var updated=false;
    if(wujiangBannedMap[role1]&&wujiangBannedMap[role1].length){
      var index2in1=$.inArray(role2, wujiangBannedMap[role1])
      if(index2in1>=0){
        wujiangBannedMap[role1].splice(index2in1, 1);
        if(wujiangBannedMap[role1].length==0){
          delete wujiangBannedMap[role1];
        }
        updated=true;
      }
    }
    if(updated){
      $(outputwrapperid).append("<br/>mapping from "+role1+" to "+role2+" found and deleted");
    }
    else{
      $(outputwrapperid).append("<br/>mapping from "+role1+" to "+role2+" does not exist, skipped");
    }
    return updated;
  }

  function uploadWujiangBannedMap(outputwrapperid) {
    var httpReq = new XMLHttpRequest();
    var url='https://api.dropboxapi.com/2/paper/docs/download';
    httpReq.open("GET",url,false);
    httpReq.setRequestHeader('Authorization','Bearer wzahoqHWjoQAAAAAAAAAFV2iwzrw_BFSgaena__5iraqztOyTepnnUc5J1S-73FM');
    httpReq.setRequestHeader('Dropbox-API-Arg',"{\"doc_id\": \"gO8sAY4eYAlF2OQ6QPk5T\",\"export_format\": \"markdown\"}");
    httpReq.send();
    var revision=JSON.parse(httpReq.getResponseHeader("Dropbox-Api-Result")).revision;
    console.log('current doc version identified: '+revision);
    $(outputwrapperid).append("<br/>current doc version identified: "+revision);

    var httpReqUpdate = new XMLHttpRequest();
    var urlUpdate='https://api.dropboxapi.com/2/paper/docs/update';
    httpReqUpdate.open("POST",urlUpdate,false);
    httpReqUpdate.setRequestHeader("Authorization","Bearer wzahoqHWjoQAAAAAAAAAFV2iwzrw_BFSgaena__5iraqztOyTepnnUc5J1S-73FM");
    httpReqUpdate.setRequestHeader("Content-Type","application/octet-stream");
    httpReqUpdate.setRequestHeader("Dropbox-API-Arg","{\"doc_id\": \"gO8sAY4eYAlF2OQ6QPk5T\",\"doc_update_policy\": \"overwrite_all\",\"revision\":"+revision+",\"import_format\": \"markdown\"}");

    var title='wujiangBannedMap';
    var content=JSON.stringify(wujiangBannedMap,null,4);
    httpReqUpdate.send(title+"\n"+content);
    console.log('Uploaded total wujiangBannedMap entries: '+Object.keys(wujiangBannedMap).length);
    $(outputwrapperid).append("<br/>Uploaded total wujiangBannedMap entries: "+Object.keys(wujiangBannedMap).length);
    $(outputwrapperid).append("<br/>Success!");
  }

  function selectHandler(obj, datum, name) {
    var key = datum.replace(/\r?\n|\r/g, " ").trim();
    renderRoleInfoWithPageUpdate(key);
  }
  function arrowHandler() {
    var key = $(".typeaheadmain").val();
    renderRoleInfo(key);
  }
  function roleClickHandler(event) {
    var key=event.data.key;
    renderRoleInfoWithPageUpdate(key);
  }
  function renderRoleInfoWithPageUpdate(key) {
    if(renderRoleInfo(key)){
      if($('.typeaheadmain').typeahead('val')!=key) {
        $('.typeaheadmain').typeahead('val',key);
      }
      updateLruCookie(key, dropdownSize);
      $("#btnClear").focus();
    }
  }
  function renderRoleInfo(key) {
    var keyFound=false;
    if(key){
      var skills = "";
      var banned = "";
      var fontcolor="black";
      if ($.inArray(key, wujiangBaseSet) >= 0) {
        if (wujiangBannedMap[key]) {
          $("#outputwrapper").text('');
          var banList=wujiangBannedMap[key];
          var ul = $('<ul>').text(bannedPrefix).append(
            banList.map(banitem =>
              $("<li>").append(
                $("<a>")
                  .attr("href", "#")
                  .text(banitem)
                  .click({key: banitem}, roleClickHandler)
              ))
          );
          fontcolor="red";
        } else {
          $("#outputwrapper").text(goodtogo);
          fontcolor="green";
        }
        skills=renderSkills(wujiangBaseMap[key]);
        keyFound=true;
      }
      $("#skillswrapper").html(skills);
      $("#outputwrapper").append(ul);
      $("#outputwrapper").css({ 'color': fontcolor });
    }
    return keyFound;
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
  function renderWujiang(name, skills) {
    var skillsHtml = renderSkills(skills);
    var $ul = $('<div>')
        .append(name)
        .append(skillsHtml);
    return $ul;
  }

  function performResizing() {
    var bufferHeight = $('#header').height() + $('#footer').height();
    $(window).resize(function() {
      $('#mainContent').height($(window).height() - bufferHeight-2);
    });
    $(window).trigger('resize');
  }

  // validate that all of the banned map entries can be found in the base set
  function validate(){
    $("#outputwrapper").text("");
    var matches=[];
    var missingPair=[];
    $.each(Object.keys(wujiangBannedMap), function (i, key) {
      if ($.inArray(key, wujiangBaseSet) == -1) {
        matches.push(key);
      }
      $.each(wujiangBannedMap[key], function (i, str) {
        if ($.inArray(str, wujiangBaseSet) == -1&&$.inArray(str, matches) == -1) {
          matches.push(str);
        }

        // check asymmetric: if key->str, but str does not -> key
        if ($.inArray(key, wujiangBannedMap[str]) == -1) {
          var pair=str+','+key;
          missingPair.push(pair);
        }
      });
    });

    var msg="";
    var cookieEnabled = navigator.cookieEnabled;
    if(!cookieEnabled){
      msg+="Cookie is currently disabled. <br/>Enable browser cookie for search history hint.";
    }
    if(matches && matches.length>0){
      msg+="<br/>keys missing in base:"+JSON.stringify(matches);
    }
    if(missingPair.length){
      $("#outputwrapper").append("<br/>missing pair(s) detected: "+JSON.stringify(missingPair));
      $("#outputwrapper").append("<br/>fixing...");
      fixMissingPair(missingPair);
      $("#outputwrapper").append("<br/>missing pair(s) fixed");
    }
    else if(!msg){
      msg="Data valid<br/>Total characters: "+wujiangBaseSet.length;
      msg+="<br/>Total combo ban entries: "+Object.keys(wujiangBannedMap).length;
      $("#outputwrapper").append(msg);
    }
  }

  function fixMissingPair(missingPair){
    var updated=false;
    for(var pair of missingPair){
      var pairs=pair.split(',');
      updated=(addCombo(pairs[0], pairs[1], '#outputwrapper')||updated);
    }
    if(updated) uploadWujiangBannedMap('#outputwrapper');
  }

  $(".menuButton").click(function (data) {
     $.each($(".w3-container"), function (i, element) {
       $(element).hide();
     });
     $.each($(".w3-bar-menu-item"), function (i, element) {
       $(element).removeClass("w3-dark-grey");
     });

     // Show the current tab, and add an "active" class to the button that opened the tab
     var contentId=data.target.id.split("_")[1];
     $("#"+contentId).show();
     $(data.target).addClass("w3-dark-grey");
  });

  $('.typeaheadmain').bind('typeahead:selected', selectHandler);

  $(".typeaheadmain").on('typeahead:change keyup paste mouseup touchend', arrowHandler);

  $("#btnClear").click(function () {
    $('.typeaheadmain').typeahead('val', '');
    $("#outputwrapper").text("");
    $("#skillswrapper").text("");
    $(".typeaheadmain").focus();
  });

  $("#btnAddCombo").on("click", btnAddDeleteComboHandler);
  $("#btnDeleteCombo").on("click", btnAddDeleteComboHandler);
  $("#btnEditSubmit").on("click", btnAddDeleteComboHandler);
  $("#btnEditClear").click(function (event) {
    $('.typeaheadedit1, .typeaheadedit2').typeahead('val', '');
    $("#editoutputwrapper").text("");
    $(".typeaheadedit1").focus();
  });
  $("#btnEditClearRole2").click(function (event) {
    $('.typeaheadedit2').typeahead('val', '');
    $(".typeaheadedit2").focus();
  });

  $(".pageButton").click(function (data) {
    var curPageId=$(".activePage").attr("id");
    var curPageNum=parseInt(curPageId.substring(PAGE.length));
    var newPageNum=curPageNum;
    var desiredPageNum=parseInt($(data.target).text());
    if(!desiredPageNum){
      var buttonId=$(data.target).attr("id");
      if(buttonId===BUTTON+"Prev" && curPageNum>1){
        newPageNum=curPageNum-1;
      }else if (buttonId===BUTTON+"Next" && curPageNum<Math.floor(wujiangBaseSet.length/wujiangPageSize)+1){
        newPageNum=curPageNum+1;
      }
    }else{
      newPageNum=desiredPageNum;
    }
    if(curPageNum!=newPageNum){
      $(".activePage").removeClass("activePage").addClass("visuallyHidden");
      $("#page"+newPageNum).removeClass("visuallyHidden").addClass("activePage");
      $("#"+BUTTON+curPageNum).removeClass("w3-dark-grey");
      $("#"+BUTTON+newPageNum).addClass("w3-dark-grey");
    }
  });

  // actual code to execute
  performResizing();
  readSgsGameRules();
  readSgsWujiangBaseMap();
  readSgsWujiangBannedMap();

  $(document).ajaxStop(function() {
    $("#overlay").remove();
    validate();
    performResizing();
  });

});

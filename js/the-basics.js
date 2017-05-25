$(document).ready(function(){
var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
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
  source: substringMatcher(bannedKeys)
});

function selectHandler(obj, datum, name) {
	var key=datum;	
	var banned="";
	if($.inArray( key, bannedKeys )>=0){
		if(dict[key]){
			banned=dict[key];	
		}else{
			banned="无禁将组合";
		}		
	}
  $( "#outputname" ).text(banned);
}
$('.typeahead').bind('typeahead:selected', selectHandler);

function arrowHandler(number) {
	var key=$(".typeahead").val();	
	var banned="";
	if($.inArray( key, bannedKeys )>=0){
		if(dict[key]){
			banned=dict[key];	
		}else{
			banned="无禁将组合";
		}
		
	}
  $( "#outputname" ).text(banned);
}
$(".typeahead").on('change keyup paste mouseup',arrowHandler);

});


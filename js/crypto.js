function authenticateToken(outputwrapperid) {
	var httpReq = new XMLHttpRequest();
	var url = 'https://api.dropboxapi.com/2/paper/docs/download';
	httpReq.open("GET", url, false);
	httpReq.setRequestHeader('Authorization', 'Bearer wzahoqHWjoQAAAAAAAAAFV2iwzrw_BFSgaena__5iraqztOyTepnnUc5J1S-73FM');
	httpReq.setRequestHeader('Dropbox-API-Arg', "{\"doc_id\": \"5wJbHsmFFeMXlaqBqrpIp\",\"export_format\": \"markdown\"}");
	httpReq.send();
	var authTokenRaw=httpReq.responseText.split('\n');
	authTokenRaw.splice(0, 1);
	authTokenRaw=authTokenRaw.join('\n');
	if(authTokenRaw&&(authTokenRaw.trim()).length>0){
		try{
			var passphrse = $("#authToken").val();
			if (passphrse){
				var authToken=CryptoJS.AES.decrypt(authTokenRaw.trim(),passphrse);
				if('dummytoken'==authToken.toString(CryptoJS.enc.Utf8)){
					$(outputwrapperid).append("<br/>authentication success");
					return true;
				} else {
					$(outputwrapperid).append("<br/>invalid authentication token");
				}
			}else{
				$(outputwrapperid).append("<br/>Missing token");
			}
		}
		catch(e){
			$(outputwrapperid).append("<br/>authentication token fetch failure");
		}
	} else {
		$(outputwrapperid).append("<br/>authentication token fetched empty");
	}
	return false;
}

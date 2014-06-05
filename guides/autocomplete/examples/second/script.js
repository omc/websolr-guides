function updateTerms() {
	var user_query  = document.getElementById('query').value;
	if (user_query) {
		var xmlhttp;
		var response;
		var url = 'proxy.php?q='+encodeURIComponent(user_query);
		if (window.XMLHttpRequest)	{
			// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp=new XMLHttpRequest();
		}
		else {
			// code for IE6, IE5
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}

		xmlhttp.onreadystatechange=function() {
			if (xmlhttp.readyState==4 && xmlhttp.status==200) {
			    try{
			        var data = JSON.parse(xmlhttp.responseText);
			    }catch(e){
			        alert("Failed to parse data from server:\n"+xmlhttp.responseText);
			    }
				printList(data);
			}
		}
		xmlhttp.open("GET",url,true);
		xmlhttp.send();
	}
	else {
		document.getElementById('suggestions').innerHTML= "";
	}
}

function printList(data) {
	var results      = data.response.numFound;
	var titles       = "";
	for (var item in data.response.docs) {
		title = data.response.docs[item].title;
		titles = titles + title + '<br />';
	}
	if (!results) {
		titles = "No titles found";
	}
	document.getElementById('suggestions').innerHTML= titles;
}
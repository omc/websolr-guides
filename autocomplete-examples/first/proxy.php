<?php
	$q = (in_array('q', array_keys($_GET))) ? $_GET['q'] : '';
	$url = 'http://index.websolr.com/solr/4d24e17b09c/select?q=title:"' . urlencode($q) . '"&sort=score+desc&defType=edismax&wt=json';
	$handle = fopen($url, "r");
	if ($handle) {
	    while (!feof($handle)) {
	        $buffer = fgets($handle, 4096);
	        echo $buffer;
	    }
	    fclose($handle);
	}
	exit();
?>
$(document).ready(function() {
	function addActive(imageId, textId) {
	    $('#' + imageId).delay(1500).animate({width: 80, height:80}, 1000);
	    $('#' + textId).addClass('activeArea');
	}

	if ($('#createIndicator').length) {
		addActive('create', 'createText');
	} else if ($('#contributeIndicator').length) {
		addActive('contribute', 'contributeText');
	} else {
		addActive('read', 'readText');
	}

	$('#create').click(function() {
		document.location = '/create';
	});

	$('#read').click(function() {
		document.location = '/';
	});
});
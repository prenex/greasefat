// Little module for extracting 'GET' parameters

// Function that builds the module and returns the built object
var GET = (function(){
	// This is the module itself we are building
	var GET = {};

	// Helper function that split the GET parameters into an assoc array
	function transformToAssocArray(prmstr) {
		var params = {};
		var prmarr = prmstr.split("&");
		for ( var i = 0; i < prmarr.length; i++) {
		var tmparr = prmarr[i].split("=");
		params[tmparr[0]] = tmparr[1];
		}
		return params;
	}

	// Fetch the GET parameters
	GET.parameters = function() {
		  var prmstr = window.location.search.substr(1);
		  return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
	}

	// Return the created module
	return GET;
}());

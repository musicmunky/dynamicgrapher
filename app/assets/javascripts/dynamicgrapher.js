jQuery( document ).ready(function() {});

function getItemByKey(i)
{
	var id = i || "";
	if(FUSION.lib.isBlank(id)) {
		console.log("ID is blank, could not return function");
		return false;
	}
	else {
		var item	= {};
		var lsstr	= localStorage.getItem(id);
		if(lsstr !== null)
		{
			try {
				item = JSON.parse(lsstr);
			}
			catch(err) {
				FUSION.error.logError(err);
			}
		}
		return item;
	}
}


function dump(text) {
	console.log(text);
}

function float_fix(num) {
	//Rounds floating points
	return Math.round(num * 10000000) / 10000000
}

function widthPlusPadding(elem) {
	return $(elem).width() + parseFloat($(elem).css('paddingRight')) + parseFloat($(elem).css('paddingLeft'));
}

function about() {
	alert("For demonstration purposes only.\n\nCalculations are not guaranteed to be correct and are often inaccurate due to floating point errors. Use at your own risk.");
}


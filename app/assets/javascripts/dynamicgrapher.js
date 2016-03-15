jQuery( document ).ready(function() {
	//IE doesn't like Google fonts...load Web Safe font for IE users
	var gbr = FUSION.get.browser();
	if(gbr.browser && gbr.browser == "IE")
	{
		document.body.style.setProperty("font-family", "'Trebuchet MS', Helvetica, sans-serif", "important");
	}
});

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
				FUSION.error.logError("Error in getItemByKey: " + err);
			}
		}
		return item;
	}
}


function setParamValues(k)
{
	var key = k || "";
	if(FUSION.lib.isBlank(key)) {
		console.log("Param is blank - unable to update sliders");
		return false;
	}
	var ls = getItemByKey(key);
	if(FUSION.get.objSize(ls) > 0)
	{
		var prms = ls.params;
		for(var p in prms)
		{
			try {
				var pstr = p.toString();
				var sldr = FUSION.get.node(pstr + "_slider");
				sldr.rangeSlider.update({min: prms[p].min, max: prms[p].max, value: prms[p].value});
				FUSION.get.node(pstr + "_min").value = prms[p].min;
				FUSION.get.node(pstr + "_max").value = prms[p].max;
				FUSION.get.node(pstr + "_val_span").innerHTML = prms[p].value;
			}
			catch(err) {
				console.log("Error in setParamValues: " + err.toString());
			}
		}
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


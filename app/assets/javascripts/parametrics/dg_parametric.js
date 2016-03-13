jQuery( document ).ready(function() {

	if(FUSION.lib.supportsHtml5Storage())
	{
		try {
			jsguip = new JSguiParam;
			jsgcalcp = new JSgCalcParam("graph");
			jsgcalcp.initCanvas();
		}
		catch(err) {
			console.log("Initialization Error: " + err);
		}

		document.body.onselectstart = function () { return false; }

		var allparms = getAllParametrics();
		if(allparms.length > 0)
		{
 			for(var j = 0; j < allparms.length; j++)
			{
				jsguip.addParamSystem(allparms[j]);
			}
		}
		else
		{
			jsguip.addParamSystem();
		}

		$(".toolbox_close a").click(function() {
			$(".toolbox").hide();
		})

		$(".graph_equation_display").keyup(function(event){
			if(event.keyCode == 13){
				jsguip.evaluate();
			}
		});

		// Initialize a new plugin instance for element or array of elements.
		var aslider = FUSION.get.node("a_slider");
		rangeSlider.create(aslider, {
			polyfill: true,     // Boolean, if true, custom markup will be created
			rangeClass: 'rangeSlider',
			fillClass: 'rangeSlider__fill',
			handleClass: 'rangeSlider__handle',
			startEvent: ['mousedown', 'touchstart', 'pointerdown'],
			moveEvent: ['mousemove', 'touchmove', 'pointermove'],
			endEvent: ['mouseup', 'touchend', 'pointerup'],
			borderRadius: 10,    // Number, if you use buffer + border-radius in css for looks good,
			onInit: function () {
				var s = FUSION.get.node("a_slider");
				FUSION.get.node("a_min").value = s.min;
				FUSION.get.node("a_max").value = s.max;
				FUSION.get.node("a_val_span").innerHTML = s.value;
			},
			onSlideStart: function (position, value) {},
			onSlide: function (value, percent, position) {
				updateDisplayParam("a", value);
				jsguip.evaluate();
			},
			onSlideEnd: function (value, percent, position) {
				updateLsParam("a", value);
			}
		});

		var bslider = FUSION.get.node("b_slider");
		rangeSlider.create(bslider, {
			polyfill: true,
			rangeClass: 'rangeSlider',
			fillClass: 'rangeSlider__fill',
			handleClass: 'rangeSlider__handle',
			startEvent: ['mousedown', 'touchstart', 'pointerdown'],
			moveEvent: ['mousemove', 'touchmove', 'pointermove'],
			endEvent: ['mouseup', 'touchend', 'pointerup'],
			borderRadius: 10,
			onInit: function () {
				var s = FUSION.get.node("b_slider");
				FUSION.get.node("b_min").value = s.min;
				FUSION.get.node("b_max").value = s.max;
				FUSION.get.node("b_val_span").innerHTML = s.value;
			},
			onSlide: function (value, percent, position) {
				updateDisplayParam("b", value);
				jsguip.evaluate();
			},
			onSlideEnd: function (value, percent, position) {
				updateLsParam("b", value);
			}
		});

		var cslider = FUSION.get.node("c_slider");
		rangeSlider.create(cslider, {
			polyfill: true,
			rangeClass: 'rangeSlider',
			fillClass: 'rangeSlider__fill',
			handleClass: 'rangeSlider__handle',
			startEvent: ['mousedown', 'touchstart', 'pointerdown'],
			moveEvent: ['mousemove', 'touchmove', 'pointermove'],
			endEvent: ['mouseup', 'touchend', 'pointerup'],
			borderRadius: 10,
			onInit: function () {
				var s = FUSION.get.node("c_slider");
				FUSION.get.node("c_min").value = s.min;
				FUSION.get.node("c_max").value = s.max;
				FUSION.get.node("c_val_span").innerHTML = s.value;
			},
			onSlide: function (value, percent, position) {
				updateDisplayParam("c", value);
				jsguip.evaluate();
			},
			onSlideEnd: function (value, percent, position) {
				updateLsParam("c", value);
			}
		});
	}
	else
	{
		alert("Sorry, your browser is not supported.");
		return false;
	}

});


function setTValues(k)
{
	var key = k || "";
	if(FUSION.lib.isBlank(key)) {
		console.log("Key is blank - unable to update T-Values");
		return false;
	}
	var ls = getItemByKey(key);
	if(FUSION.get.objSize(ls) > 0)
	{
		var t = ls.t;
		try {
			FUSION.get.node("t_min").value = t.min;
			FUSION.get.node("t_max").value = t.max;
		}
		catch(err) {
			console.log("Error Setting Parameter info: " + err.toString());
		}
	}

}


function updateLsParam(p, v)
{
	var param = p || "";
	var value = v || 0;
	if(FUSION.lib.isBlank(param)) {
		console.log("Param is blank - unable to update functions");
		return false;
	}

	var ls = getItemByKey(jsguip.currSys);
	if(!FUSION.lib.isBlank(jsguip.currSys) && FUSION.get.objSize(ls) > 0)
	{
		ls.params[param].value = v;
		localStorage.setItem(ls.id, JSON.stringify(ls));
	}
}


function updateDisplayParam(p, v)
{
	var param = p || "";
	var value = v || 0;
	if(FUSION.lib.isBlank(param)) {
		console.log("Param is blank - unable to update functions");
		return false;
	}
	var spn = FUSION.get.node(param + "_val_span");
	spn.innerHTML = value;
}


function updateTvalMinMax()
{
	var min = FUSION.get.node("t_min");
	var max = FUSION.get.node("t_max");
	if(FUSION.lib.isBlank(min.value) || FUSION.lib.isBlank(max.value)) {
		console.log("T-Min or T-Max is blank - Please put in a value for both of them");
		return false;
	}
	try {
		var i = parseFloat(min.value);
		var a = parseFloat(max.value);
		if(isNaN(i) || isNaN(a)) {
			console.log("Undefined value for T-Min or T-Max: " + i + "   " + a);
			return false;
		}

		var pfmin = parseFloat(min.value);
		var pfmax = parseFloat(max.value);

		var ls = getItemByKey(jsguip.currSys);
		if(!FUSION.lib.isBlank(jsguip.currSys) && FUSION.get.objSize(ls) > 0)
		{
			ls.t.min = pfmin;
			ls.t.max = pfmax;
			localStorage.setItem(ls.id, JSON.stringify(ls));
		}
		jsguip.evaluate();
	}
	catch(err) {
		console.log("Error updating T-Min / T-Max: " + err.toString());
		return false;
	}
}


function updateMinMax(p)
{
	var min = FUSION.get.node(p + "_min");
	var max = FUSION.get.node(p + "_max");
	var sld = FUSION.get.node(p + "_slider");

	if(FUSION.lib.isBlank(min.value) || FUSION.lib.isBlank(max.value)) {
		console.log("Min or Max is blank for Param: " + p + ".  Please put in a value for both of them");
		return false;
	}

	try {
		var i = parseFloat(min.value);
		var a = parseFloat(max.value);
		if(isNaN(i) || isNaN(a)) {
			console.log("Undefined value for Min or Max: " + i + "   " + a);
			return false;
		}

		var newval = sld.rangeSlider.value;
		if(newval < i) {
			newval = i;
		}
		else if(newval > a) {
			newval = a;
		}

		var pfmin = parseFloat(min.value);
		var pfmax = parseFloat(max.value);
		var pfval = parseFloat(newval);

		var ls = getItemByKey(jsguip.currSys);
		if(!FUSION.lib.isBlank(jsguip.currSys) && FUSION.get.objSize(ls) > 0)
		{
			ls.params[p].min = pfmin;
			ls.params[p].max = pfmax;
			ls.params[p].value = pfval;
			localStorage.setItem(ls.id, JSON.stringify(ls));
		}

		sld.rangeSlider.update({min: pfmin, max: pfmax, value: pfval});
		updateDisplayParam(p, pfval);
	}
	catch(err) {
		console.log("Error updating Min/Max: " + err.toString());
		return false;
	}
}


function getAllParametrics()
{
	// lsa = localStorage Array
	// lso = localStorage Object
	// lss = localStorage String
	var gaplsa = [];
	var gaplso = {};
	var gaplss = "";

	for(var i = 0; i < localStorage.length; i++)
	{
		gaplss = localStorage.getItem(localStorage.key(i));
		if(typeof gaplss !== undefined && localStorage.key(i).match(/^DynGraph_\d{6}_parametric$/))
		{
			try
			{
				gaplso = JSON.parse(gaplss);
				if(gaplso.equation && !FUSION.lib.isBlank(gaplso.equation)) {
					gaplsa.unshift(gaplso);
				}
				else {
					gaplsa.push(gaplso);
				}
			}
			catch(err)
			{
				FUSION.error.logError(err);
			}
		}
	}
	return gaplsa;
}


function updateFunctionColor() {
	var ls = getItemByKey(jsguip.currSys);
	var div = FUSION.get.node("graph_color_indicator_" + ls.id);
	ls.color = div.style.backgroundColor;
	localStorage.setItem(ls.id, JSON.stringify(ls));
}



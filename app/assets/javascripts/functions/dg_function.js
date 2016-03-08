jQuery( document ).ready(function() {

	if(FUSION.lib.supportsHtml5Storage())
	{
		try {
			jsgui = new JSgui;
			jsgcalc = new JSgCalc("graph");
			jsgcalc.initCanvas();
		}
		catch(err) {
			console.log("Initialization Error: " + err);
		}

		document.body.onselectstart = function () { return false; }

		var allfncs = getAllFunctions();
		if(allfncs.length > 0)
		{
			jsgui.selectEquation(allfncs[0].id);
 			for(var j = 0; j < allfncs.length; j++)
			{
				jsgui.addInput(allfncs[j]);
			}
		}
		else
		{
			var eq = jsgui.addInput();
			jsgui.selectEquation(eq);
		}

		$(".toolbox_close a").click(function() {
			$(".toolbox").hide();
		})

		$(".graph_equation_display").keyup(function(event){
			if(event.keyCode == 13){
				jsgui.evaluate();
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
			onSlideStart: function (value, percent, position) {},
			onSlide: function (value, percent, position) {
				updateDisplayParam("a", value);
				jsgui.evaluate();
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
				jsgui.evaluate();
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
				jsgui.evaluate();
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


function updateLsParam(p, v)
{
	var param = p || "";
	var value = v || 0;
	if(FUSION.lib.isBlank(param)) {
		console.log("Param is blank - unable to update functions");
		return false;
	}

	var ls = getItemByKey(jsgui.currEq);
	if(!FUSION.lib.isBlank(jsgui.currEq) && FUSION.get.objSize(ls) > 0)
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


function updateMinMax(p)
{
	var min = FUSION.get.node(p + "_min");
	var max = FUSION.get.node(p + "_max");
	var sld = FUSION.get.node(p + "_slider");

	if(FUSION.lib.isBlank(min.value) || FUSION.lib.isBlank(max.value)) {
		console.log("Min or Max is blank for Param: " + p + ".  Please put in a value for one or both of them");
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

		var ls = getItemByKey(jsgui.currEq);
		if(!FUSION.lib.isBlank(jsgui.currEq) && FUSION.get.objSize(ls) > 0)
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


function getAllFunctions()
{
	// lsa = localStorage Array
	// lso = localStorage Object
	// lss = localStorage String
	var gaflsa = [];
	var gaflso = {};
	var gaflss = "";

	for(var i = 0; i < localStorage.length; i++)
	{
		gaflss = localStorage.getItem(localStorage.key(i));
//		if(typeof gnbflss !== undefined && localStorage.key(i).match(/^DynGraph_\d{6}_(function|parametric|ode|odesystem)$/))
		if(typeof gaflss !== undefined && localStorage.key(i).match(/^DynGraph_\d{6}_function$/))
		{
			try
			{
				gaflso = JSON.parse(gaflss);
				if(gaflso.equation && !FUSION.lib.isBlank(gaflso.equation)) {
					//add functions with an equation to the front of the array...
					gaflsa.unshift(gaflso);
				}
				else {
					//otherwise, throw it on the end
					gaflsa.push(gaflso);
				}
			}
			catch(err)
			{
				FUSION.error.logError(err);
			}
		}
	}
	return gaflsa;
}


function updateFunctionColor() {
	var ls = getItemByKey(jsgui.currEq);
	var div = FUSION.get.node("graph_color_indicator_" + ls.id);
	ls.color = div.style.backgroundColor;
	localStorage.setItem(ls.id, JSON.stringify(ls));
}



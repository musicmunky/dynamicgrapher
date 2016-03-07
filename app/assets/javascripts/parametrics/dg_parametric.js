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

		var allparms = getAllParametrics();
		if(allparms.length > 0)
		{
 			for(var j = 0; j < allparms.length; j++)
			{
				jsgui.addParamSystem(allparms[j]);
			}
		}
		else
		{
			jsgui.addParamSystem();
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
			onSlideStart: function (position, value) {
				//console.info('onSlideStart', 'position: ' + position, 'value: ' + value);
			},
			onSlide: function (value, percent, position) {
				updateParam("a", value);
				jsgui.evaluate();
				//console.log('onSlide', 'position: ' + position, 'value: ' + value, 'percent: ' + percent);
			},
			onSlideEnd: function (position, value) {
				//console.warn('onSlideEnd', 'position: ' + position, 'value: ' + value);
			}
		});

		var bslider = FUSION.get.node("b_slider");
		rangeSlider.create(bslider, {
			polyfill: true,     // Boolean, if true, custom markup will be created
			rangeClass: 'rangeSlider',
			fillClass: 'rangeSlider__fill',
			handleClass: 'rangeSlider__handle',
			startEvent: ['mousedown', 'touchstart', 'pointerdown'],
			moveEvent: ['mousemove', 'touchmove', 'pointermove'],
			endEvent: ['mouseup', 'touchend', 'pointerup'],
			borderRadius: 10,    // Number, if you use buffer + border-radius in css for looks good,
			onInit: function () {
				var s = FUSION.get.node("b_slider");
				FUSION.get.node("b_min").value = s.min;
				FUSION.get.node("b_max").value = s.max;
				FUSION.get.node("b_val_span").innerHTML = s.value;
			},
			onSlide: function (value, percent, position) {
				updateParam("b", value);
				jsgui.evaluate();
			},
		});

		var cslider = FUSION.get.node("c_slider");
		rangeSlider.create(cslider, {
			polyfill: true,     // Boolean, if true, custom markup will be created
			rangeClass: 'rangeSlider',
			fillClass: 'rangeSlider__fill',
			handleClass: 'rangeSlider__handle',
			startEvent: ['mousedown', 'touchstart', 'pointerdown'],
			moveEvent: ['mousemove', 'touchmove', 'pointermove'],
			endEvent: ['mouseup', 'touchend', 'pointerup'],
			borderRadius: 10,    // Number, if you use buffer + border-radius in css for looks good,
			onInit: function () {
				var s = FUSION.get.node("c_slider");
				FUSION.get.node("c_min").value = s.min;
				FUSION.get.node("c_max").value = s.max;
				FUSION.get.node("c_val_span").innerHTML = s.value;
			},
			onSlide: function (value, percent, position) {
				updateParam("c", value);
				jsgui.evaluate();
			},
		});
	}
	else
	{
		alert("Sorry, your browser is not supported.");
		return false;
	}

});


function updateParam(p, v)
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
		sld.rangeSlider.update({min: parseFloat(min.value), max: parseFloat(max.value), value: parseFloat(newval)});
		updateParam(p, newval);
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
					//add functions with an equation to the front of the array...
					gaplsa.unshift(gaplso);
				}
				else {
					//otherwise, throw it on the end
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
	var ls = getItemByKey(jsgui.currEq);
	var div = FUSION.get.node("graph_color_indicator_" + ls.id);
	ls.color = div.style.backgroundColor;
	localStorage.setItem(ls.id, JSON.stringify(ls));
}



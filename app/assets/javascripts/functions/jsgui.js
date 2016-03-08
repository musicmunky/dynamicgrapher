function JSgui() {
	this.currtool = "pointer";
	this.currEq = "";
	this.gridlines = "normal";
	this.settings = {};

	this.setQuality = function(q) {
		$("#quality_select a").removeClass("option_selected");
		q2 = String(q).replace(".", "");
		$("#quality_select_" + q2).addClass("option_selected");

		jsgcalc.quality = q;
		jsgcalc.draw();
	}

	this.setAngles = function(q) {
		$("#angle_select a").removeClass("option_selected");
		$("#angle_select_" + q).addClass("option_selected");

		Calc.angles = q;
		jsgcalc.draw();
	}

	this.selectEquation = function(x) {
		this.currEq = x;
		$("#graph_inputs div.graph_input_wrapper").removeClass("active_equation");
		$("#graph_input_wrapper_" + x).addClass("active_equation");
		jsgcalc.draw();
	}

	this.setTool = function(t) {
		$("#tool_select a").removeClass("toolbar_selected");
		$("#tool_select_" + t).addClass("toolbar_selected");

		//Toolbox
		$(".toolbox").hide();
		$("#toolbox_" + t).show();
		$("#toolbox_" + t).css("top", $("#tool_select_" + t).offset().top - 23);
		$("#toolbox_" + t).css("right", $(document).width() - $("#tool_select_" + t).offset().left + 5);

		this.currtool = t;
		jsgcalc.draw();
	}

	this.doTrace = function(xval) {
		jsgcalc.draw();
		jsgcalc.drawTrace(jsgcalc.getEquation(this.currEq), "#000000", xval);
	}

	this.setGridlines = function(t) {
		$("#gridlines_select a").removeClass("option_selected");
		$("#gridlines_select_" + t).addClass("option_selected");

		this.gridlines = t;
		jsgcalc.draw();
	}

	this.hideSidebar = function() {
		$("#sidewrapper").hide();
		$("#hideSidebar").hide();
		$("#showSidebar").show();
		$("#toolbar").css("right", "0px");
		jsgcalc.resizeGraph($("#wrapper").width() - widthPlusPadding("#toolbar"), $("#wrapper").height());
		this.setTool(this.currtool);
	}

	this.showSidebar = function() {
		$("#sidewrapper").show();
		$("#hideSidebar").show();
		$("#showSidebar").hide();
		$("#toolbar").css("right", "282px");
		jsgcalc.resizeGraph($("#wrapper").width() - $("#sidewrapper").width() - widthPlusPadding("#toolbar"), $("#wrapper").height());
		this.setTool(this.currtool);
	}

	this.updateInputData = function() {
		var id = "";
		var ky = "";
		var ls = {};
		$("#graph_inputs div.graph_input_wrapper").each(function() {
			id = $(this).attr('id');
			ky = String(id).replace("graph_input_wrapper_", "");
			ls = getItemByKey(ky);
			ls.equation = FUSION.get.node("graph_input_" + ky).value;
			ls.color = $(".graph_color_indicator", this).css('backgroundColor');
			localStorage.setItem(ky, JSON.stringify(ls));
		});
	}

	this.evaluate = function() {
		this.updateInputData();
		jsgcalc.draw();
	}

	//Update gui values
	this.updateValues = function() {
		$("input.jsgcalc_xmin").val(Math.round(jsgcalc.currCoord.x1 * 1000) / 1000);
		$("input.jsgcalc_xmax").val(Math.round(jsgcalc.currCoord.x2 * 1000) / 1000);
		$("input.jsgcalc_ymin").val(Math.round(jsgcalc.currCoord.y1 * 1000) / 1000);
		$("input.jsgcalc_ymax").val(Math.round(jsgcalc.currCoord.y2 * 1000) / 1000);
	}

	this.addInput = function(h) {
		var func = h || {};
		var nfid = "";
 		try {
			if(!("equation" in func)) //completely new function
			{
				var allfuncs = getAllFunctions();
				if(allfuncs.length < 5) {
					this.updateInputData();
					var newcolor = randomColor();
					var fid = "DynGraph_" + FUSION.lib.getRandomInt(100000,999999) + "_function";
					func = {
						equation: "",
						color: newcolor,
						id: fid,
						params: { a:{ min:-10, max:10, value: 0 }, b:{ min:-10, max:10, value: 0 }, c:{ min:-10, max:10, value: 0 } }
					};
					try {
						localStorage.setItem(fid, JSON.stringify(func));
						nfid = fid;
					}
					catch(err) {
						FUSION.error.logError(err, "Unable to create localStorage item: ");
						return false;
					}

				}
				else {
					console.log("Tried to add too many equations");
					alert("Sorry, there is a limit of 5 equations for this app!");
				}
			}
			this.refreshInputs();
			return nfid;
		}
		catch(err) {
			console.log("JSGui Error: " + err.message);
			return false;
		}
	}

	this.removeInput = function(i) {
		var id = i;
		if(FUSION.lib.isBlank(id)) {
			console.log("Blank id - can not remove function");
			alert("Unable to remove a function without a function id!");
			return false;
		}

		var div = FUSION.get.node("graph_input_wrapper_" + id);
		var parent = div.parentNode;
		parent.removeChild(div);
		localStorage.removeItem(id);

		if(parent.childNodes.length < 1) {
			var eq = this.addInput();
			this.selectEquation(eq);
 			//this.refreshInputs();
		}
	}

	this.refreshInputs = function() {
		var functions = getAllFunctions();
		for(var i = 0; i < functions.length; i++) {
			if(!FUSION.get.node("graph_input_wrapper_" + functions[i].id)) {
				var giw = FUSION.lib.createHtmlElement({"type":"div", "attributes":{"id":"graph_input_wrapper_" + functions[i].id, "class":"graph_input_wrapper"},
													    "style":{"float":"left", "width":"100%"}});
				var rem = FUSION.lib.createHtmlElement({"type":"button", "onclick":"jsgui.removeInput('" + functions[i].id + "')",
														"attributes":{"id":"graph_equation_remover_" + functions[i].id, "class":"glyphicon glyphicon-trash graph_equation_remover"}});


				var gci = FUSION.lib.createHtmlElement({"type":"div","attributes":{"id":"graph_color_indicator_" + functions[i].id, "class":"graph_color_indicator"}});
				var btn = FUSION.lib.createHtmlElement({"type":"input",
														"attributes":{"id":"gcibtn_" + functions[i].id, "value":"", "type":"button"},
													    "style":{"background-color":"rgba(0,0,0,0)", "width":"100%", "height":"100%", "border":"none", "padding":"0px", "cursor":"pointer"}});

				var ged = FUSION.lib.createHtmlElement({"type":"div", "attributes":{"class":"graph_equation_display"}});
				var spn = FUSION.lib.createHtmlElement({"type":"span", "text":"y ="});
				var fin = FUSION.lib.createHtmlElement({"type":"input", "attributes":{"id":"graph_input_" + functions[i].id, "size":"20", "value":functions[i].equation}});

				ged.appendChild(spn);
				ged.appendChild(fin);
				gci.appendChild(btn);
				giw.appendChild(rem);
				giw.appendChild(gci);
				giw.appendChild(ged);
				FUSION.get.node("graph_inputs").appendChild(giw);

				var opts = {
					closable:true,
					valueElement:'colorpickervalue',
					styleElement:'graph_color_indicator_' + functions[i].id,
					required: false,
					value: functions[i].color
				};

				var picker = new jscolor(FUSION.get.node("gcibtn_" + functions[i].id), opts);

				$("#graph_color_indicator_" + functions[i].id).css("backgroundColor", functions[i].color);
			}
		}

		$("#graph_inputs div.graph_input_wrapper").each(function() {
			$(this).bind("click", function() {
				var id = $(this).attr("id");
				var ky = String(id).replace("graph_input_wrapper_", "");
				jsgui.selectEquation(ky);
				setParamValues(ky);
			});
		});

		$(".graph_equation_display").keyup(function(event){
			if(event.keyCode == 13){
				jsgui.evaluate();
			}
		});

		$("#graph_input_wrapper_" + this.currEq).addClass("active_equation");
	}

}


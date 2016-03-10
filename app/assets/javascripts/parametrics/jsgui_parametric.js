function JSguiParam() {
	this.currtool = "pointer";
	this.currEq = 0;
	this.gridlines = "normal";
	this.settings = {};

	this.setQuality = function(q) {
		$("#quality_select a").removeClass("option_selected");
		q2 = String(q).replace(".", "");
		$("#quality_select_" + q2).addClass("option_selected");

		jsgcalcp.quality = q;
		jsgcalcp.draw();
	}

	this.setAngles = function(q) {
		$("#angle_select a").removeClass("option_selected");
		$("#angle_select_" + q).addClass("option_selected");

		CalcParam.angles = q;
		jsgcalcp.draw();
	}

	this.selectEquation = function(x) {
		this.currEq = x;
		$("#graph_systems div.graph_system_wrapper").removeClass("active_equation");
		$("#graph_system_wrapper_" + x).addClass("active_equation");
		jsgcalcp.draw();
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
		jsgcalcp.draw();
	}

	this.doTrace = function(xval) {
		jsgcalcp.draw();
		jsgcalcp.drawTrace(jsgcalcp.getEquation(this.currEq), "#000000", xval);
	}

	this.setGridlines = function(t) {
		$("#gridlines_select a").removeClass("option_selected");
		$("#gridlines_select_" + t).addClass("option_selected");

		this.gridlines = t;
		jsgcalcp.draw();
	}

	this.hideSidebar = function() {
		$("#sidewrapper").hide();
		$("#hideSidebar").hide();
		$("#showSidebar").show();
		$("#toolbar").css("right", "0px");
		jsgcalcp.resizeGraph($("#wrapper").width() - widthPlusPadding("#toolbar"), $("#wrapper").height());

		this.setTool(this.currtool);
	}

	this.showSidebar = function() {
		$("#sidewrapper").show();
		$("#hideSidebar").show();
		$("#showSidebar").hide();
		$("#toolbar").css("right", "282px");
		jsgcalcp.resizeGraph($("#wrapper").width() - $("#sidewrapper").width() - widthPlusPadding("#toolbar"), $("#wrapper").height());

		this.setTool(this.currtool);
	}

	this.updateInputData = function() {
		var id = "";
		var ky = "";
		var ls = {};
		$("#graph_systems div.graph_system_wrapper").each(function() {
			id = $(this).attr('id');
			ky = String(id).replace("graph_system_wrapper_", "");
			ls = getItemByKey(ky);
			ls.x.equation = FUSION.get.node("graph_system_x_" + ky).value;
			ls.y.equation = FUSION.get.node("graph_system_y_" + ky).value;
			ls.color = $(".graph_color_indicator", this).css('backgroundColor');
			localStorage.setItem(ky, JSON.stringify(ls));
		});
	}

	this.evaluate = function() {
		this.updateInputData();
		jsgcalcp.draw();
	}

	//Update gui values
	this.updateValues = function() {
		$("input.jsgcalc_xmin").val(Math.round(jsgcalcp.currCoord.x1 * 1000) / 1000);
		$("input.jsgcalc_xmax").val(Math.round(jsgcalcp.currCoord.x2 * 1000) / 1000);
		$("input.jsgcalc_ymin").val(Math.round(jsgcalcp.currCoord.y1 * 1000) / 1000);
		$("input.jsgcalc_ymax").val(Math.round(jsgcalcp.currCoord.y2 * 1000) / 1000);
	}

	this.addParamSystem = function(h) {
		var syst = h || {};
 		try {
			if(!("x" in syst) || !("y" in syst)) //completely new system
			{
				var allsysts = getAllParametrics();
				if(allsysts.length < 5) {
					this.updateInputData();
					var newcolor = randomColor();
					var sid = "DynGraph_" + FUSION.lib.getRandomInt(100000,999999) + "_parametric";
					syst = {
						x: { equation: "" },
						y: { equation: "" },
						color: newcolor,
						id: sid,
						params: { a:{ min:-10, max:10, value: 0 }, b:{ min:-10, max:10, value: 0 }, c:{ min:-10, max:10, value: 0 } }
					};
					try {
						localStorage.setItem(sid, JSON.stringify(syst));
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
			this.refreshParamSystems();
		}
		catch(err) {
			console.log("JSguiParam Error: " + err.message);
			return false;
		}
	}


	this.removeSystem = function(i) {
		var id = i;
		if(FUSION.lib.isBlank(id)) {
			console.log("Blank id - can not remove function");
			alert("Unable to remove a function without a function id!");
			return false;
		}

		var div = FUSION.get.node("graph_system_wrapper_" + id);
		var parent = div.parentNode;
		parent.removeChild(div);
		localStorage.removeItem(id);

		if(parent.childNodes.length < 1) {
			this.addParamSystem();
 			this.refreshParamSystems();
		}
	}


	this.refreshParamSystems = function() {
		var systems = getAllParametrics();
		for(var i = 0; i < systems.length; i++) {
			if(!FUSION.get.node("graph_system_wrapper_" + systems[i].id)) {
				var giw = FUSION.lib.createHtmlElement({"type":"div", "attributes":{"id":"graph_system_wrapper_" + systems[i].id, "class":"graph_system_wrapper"},
													    "style":{"float":"left", "width":"100%"}});
				var rem = FUSION.lib.createHtmlElement({"type":"button", "onclick":"jsguip.removeInput('" + systems[i].id + "')",
														"style":{"margin-top":"13px"},
														"attributes":{"id":"graph_equation_remover_" + systems[i].id, "class":"glyphicon glyphicon-trash graph_equation_remover"}});

				var gci = FUSION.lib.createHtmlElement({"type":"div","attributes":{"id":"graph_color_indicator_" + systems[i].id, "class":"graph_color_indicator"}, "style":{"margin-top":"15px"}});
				var btn = FUSION.lib.createHtmlElement({"type":"input",
														"attributes":{"id":"gcibtn_" + systems[i].id, "value":"", "type":"button"},
													    "style":{"background-color":"rgba(0,0,0,0)", "width":"100%", "height":"100%", "border":"none", "padding":"0px", "cursor":"pointer"}});

				var gedx = FUSION.lib.createHtmlElement({"type":"div", "attributes":{"class":"graph_equation_display"}, "style":{"margin-bottom":"3px"}});
				var gedy = FUSION.lib.createHtmlElement({"type":"div", "attributes":{"class":"graph_equation_display"}});
				var spnx = FUSION.lib.createHtmlElement({"type":"span", "text":"x ="});
				var spny = FUSION.lib.createHtmlElement({"type":"span", "text":"y ="});
				var finx = FUSION.lib.createHtmlElement({"type":"input", "attributes":{"id":"graph_system_x_" + systems[i].id, "size":"20", "value":systems[i].x.equation}});
				var finy = FUSION.lib.createHtmlElement({"type":"input", "attributes":{"id":"graph_system_y_" + systems[i].id, "size":"20", "value":systems[i].y.equation}});

				gedx.appendChild(spnx);
				gedx.appendChild(finx);
				gedy.appendChild(spny);
				gedy.appendChild(finy);
				gci.appendChild(btn);
				giw.appendChild(rem);
				giw.appendChild(gci);
				giw.appendChild(gedx);
				giw.appendChild(gedy);
				FUSION.get.node("graph_systems").appendChild(giw);

				var opts = {
					closable:true,
					valueElement:'colorpickervalue',
					styleElement:'graph_color_indicator_' + systems[i].id,
					required: false,
					value: systems[i].color
				};

				var picker = new jscolor(FUSION.get.node("gcibtn_" + systems[i].id), opts);

				$("#graph_color_indicator_" + systems[i].id).css("backgroundColor", systems[i].color);
			}
		}

		$("#graph_systems div.graph_system_wrapper").each(function() {
			$(this).bind("click", function() {
				var id = $(this).attr("id");
				var ky = String(id).replace("graph_system_wrapper_", "");
				jsguip.selectEquation(ky);
			});
		});

		$(".graph_equation_display").keyup(function(event){
			if(event.keyCode == 13){
				jsguip.evaluate();
			}
		});

		$("#graph_system_wrapper_" + this.currEq).addClass("active_equation");
	}


}


function JSgCalcParam(element) {
	try {
		this.graph = document.getElementById(element);
		this.graphElement = $("#" + element);
		this.width = $("#wrapper").width();
		this.height = $("#wrapper").height();
		this.maxgridlines = {x : 13, y : 13};
		this.charHeight = 8;
		this.startDrag = {x : 0, y : 0};
		this.prevDrag = {x : 0, y : 0};
		this.startCoord = {x1 : 0, y1 : 0, x2 : 0, y2 : 0};
		this.currCoord = {x1 : -5, y1 : -5, x2 : 5, y2 : 5};
		this.mousebutton = 0;
		this.canvasX = this.graph.offsetLeft;
		this.canvasY = this.graph.offsetTop;
		this.calccache = new Object;
		this.quality = 1;
		this.zoomFactor = 0.1;
		this.fillareapath;
	}
	catch(err) {
		console.log("JSgCalcParam Initialization Error: " + err.message);
		return false;
	}

	this.arbRound = function(value, roundTo) {
		return Math.round(value/roundTo)*roundTo;
	};

	this.arbFloor = function(value, roundTo) {
		return Math.floor(value/roundTo)*roundTo;
	};

	this.copyCoord = function(coord) {
		return {x1 : coord.x1, y1 : coord.y1, x2 : coord.x2, y2 : coord.y2};
	};

	this.clearScreen = function() {
		this.ctx.fillStyle = "rgb(255,255,255)";
		this.ctx.fillRect (0, 0, this.width, this.height);
	};

	this.getEquation = function(lineid) {
		var sys = getItemByKey(lineid);
		if(("x" in sys))
			return sys.x.equation;
		return false;
	};

	this.getColor = function(lineid) {
		var eq = getItemByKey(lineid);
		if(("equation" in eq))
			return eq.color;
		return "#000000";
	};

	this.drawSystem = function(xeq, yeq, color, thickness) {
		if(!xeq || !yeq)
			return false;

		var x1 = this.currCoord.x1;
		var x2 = this.currCoord.x2;
		var y1 = this.currCoord.y1;
		var y2 = this.currCoord.y2;

		var scale = this.getScale();

		this.ctx.strokeStyle = color;
		var old_linewidth = this.ctx.linewidth
		if(thickness)
			this.ctx.linewidth = thickness;
		this.ctx.beginPath();

		//We don't want to draw lines that go off the screen too much, so we keep track of how many times we've had
		//to go off the screen here
		var lineExists = 0;
		var lastpoint = 0;

		//Loop through each pixel
		this.fillareapath = [];
		this.fillareapath.push([0, this.height - ((-y1) * scale.y)]);

		var inverseQuality = 1.0 / this.quality;
		var inverseScaleX = 1.0 / scale.x;

		var maxxval = this.width + inverseQuality;

		var f = CalcParam.makeFunction(xeq);
		var g = CalcParam.makeFunction(yeq);

		var tmin = parseFloat(FUSION.get.node("t_min").value);
		var tmax = parseFloat(FUSION.get.node("t_max").value);

		var cntr = tmin;
		var incr = 0.01;
		var step = FUSION.get.node("t_step");
		if((!isNaN(parseFloat(step.value)) || !FUSION.lib.isBlank(step.value)) && parseFloat(step.value) > 0) {
			incr = parseFloat(step.value);
		}
		while(cntr < tmax) {

			var xval = f(cntr);
			var yval = g(cntr);

			var xpos = this.width - ((x2 - xval) * scale.x);
			var ypos = this.height - ((yval - y1) * scale.y);

			//The line is on the screen, or pretty close to it
			if(ypos >= (this.height * -1) && ypos <= this.height * 2) {
				if(lineExists > 1)
					this.ctx.beginPath();

				if(lastpoint !== false && ((lastpoint > 0 && yval < 0) || (lastpoint < 0 && yval > 0))) {
					this.ctx.moveTo(xpos, ypos);
				}
				else {
					this.ctx.lineTo(xpos, ypos);
				}

				lineExists = 0;
				lastpoint = false;
			}
			else if(lineExists <= 1) {	//The line is off the screen
				this.ctx.lineTo(xpos, ypos);
				lastpoint = yval;
				this.ctx.stroke();
				lineExists++;
			}
			this.fillareapath.push([xpos, ypos]);
			cntr += incr;
		}

		this.fillareapath.push([maxxval, this.height - ((-y1) * scale.y)]);
		this.ctx.stroke();
		this.ctx.linewidth = old_linewidth
	};

	this.drawFillArea = function() {
		if (this.fillareapath.length < 1) {
			return;
		}

		this.ctx.beginPath();
		this.ctx.fillStyle="rgba(0, 0, 0, 0.1)";
		for(var i = 0; i < this.fillareapath.length; i++) {
			if (i === 0) {
				this.ctx.lineTo(this.fillareapath[i][0], this.fillareapath[i][1]);
			}
			else {
				this.ctx.lineTo(this.fillareapath[i][0], this.fillareapath[i][1]);
			}
		}
		this.ctx.fill();
	}

	//Draws an arbritrary straight line from (x1, y1) to (x2, y2)
	this.drawLine = function(x1, y1, x2, y2, color, thickness) {
		if(!color)
			color = "#000000";

		this.ctx.strokeStyle = color;
		this.ctx.beginPath();
		var start = this.getCoord(x1, y1);
		var end = this.getCoord(x2, y2);
		this.ctx.moveTo(start.x, start.y);
		this.ctx.lineTo(end.x, end.y);

		var tmp = this.ctx.lineWidth
		if(thickness)
			this.ctx.lineWidth = thickness

		this.ctx.stroke();
		this.ctx.lineWidth = tmp
	};

	//Draws an arbritrary label on the graph, given the numeric values (rather than the pixel values)
	this.drawLabel = function(xval, yval, text, color) {
		if(!color)
			color = "#000000";

		var labelCoord = this.getCoord(xval, yval);
		var xpos = labelCoord.x;
		var ypos = labelCoord.y;

//		this.ctx.font = "12pt 'open sans'";
		this.ctx.font = "12pt 'Lucida Console'";
		this.ctx.fillStyle = color;
		this.ctx.beginPath();
		this.ctx.moveTo(xpos, ypos);

		if(ypos-4 < this.charHeight)
			ypos += this.charHeight * 2;
		var textwidth = this.ctx.measureText(text).width;
		if(xpos-4 < textwidth)
			xpos += textwidth + 3;
		this.ctx.fillText(text, xpos-3, ypos-3);
	};


	this.drawDot = function(xval, yval, color, radius) {
		if(!radius)
			radius = 4;
		if(!color)
			color = "#000000";

		var coord = this.getCoord(xval, yval);
		this.ctx.beginPath();
		this.ctx.fillStyle = color;
		this.ctx.arc(coord.x, coord.y, radius, 0, Math.PI*2, false);
		this.ctx.fill();
	};


	//Draws the trace on an equation
	//xpos is the pixel value of x, not the numerical value
	this.drawTrace = function(equation, color, xval) {
		var f = CalcParam.makeFunction(equation);
		var scale = this.getScale();

		var xval = float_fix(this.arbRound(xval, this.xgridscale / 100));
		var yval = f(xval);	//evaluate the equation
		yval = float_fix(yval);
		var xpos = this.getCoord(xval, yval).x;
		var ypos = this.getCoord(xval, yval).y;

		this.ctx.strokeStyle = color;
		//Draw the lines if the y-value is on the screen
		if(ypos <= this.height && ypos >= 0) {
			//Draw a line from the point to the x-axis
			this.drawLine(xval, yval, xval, 0, "#999");

			//Draw line from point to the y-axis
			this.drawLine(xval, yval, 0, yval, "#999");

			//draw label text
			this.drawLabel(xval, yval, xval + ", " + yval, "#000000");
		}

		//Draw dot
		this.drawDot(xval, yval, color, 4);

		//Update displayed trace values
		$("input.jsgcalc_trace_input").val(xval);
		$("input.jsgcalc_trace_output").val(yval);
	};

	this.drawGrid = function() {
		this.clearScreen();

		var x1 = this.currCoord.x1;
		var x2 = this.currCoord.x2;
		var y1 = this.currCoord.y1;
		var y2 = this.currCoord.y2;

		var xrange = x2 - x1;
		var yrange = y2 - y1;

		//Calculate the numeric value of each pixel (scale of the graph)
		var xscale = Math.max(xrange/this.width, 1E-20);
		var yscale = Math.max(yrange/this.height, 1E-20);

		//Calculate the scale of the gridlines
		for(var i = 0.000000000001, c = 0; xrange / i > this.maxgridlines.x - 1; c++) {
			if(c % 3 === 1) i *= 2.5;	//alternating between 2, 5 and 10
			else i *= 2;

            // Ensure we don't get into an infinite loop
            if (c > 10000) {
                break;
            }
		}
		this.xgridscale = i;

		//do the same for the y-axis
		for(var i = 0.000000000001, c = 0; yrange / i > this.maxgridlines.y -1; c++) {
			if(c % 3 == 1) i *= 2.5;
			else i *= 2;

            // Ensure we don't get into an infinite loop
            if (c > 10000) {
                break;
            }
		}
		this.ygridscale = i;

// 		this.ctx.font = "10pt 'open sans'";	//set the font
		this.ctx.font = "10pt 'Lucida Console'";	//set the font
		this.ctx.textAlign = "center";

		var xaxis = null;
		var yaxis = null;

		//currx is the current gridline being drawn, as a numerical value (not a pixel value)
		var currx = this.arbFloor(x1, this.xgridscale);	//set it to before the lowest x-value on the screen
		var curry = this.arbFloor(y1, this.ygridscale);
		var xmainaxis = this.charHeight * 1.5;	//the next two variables are the axis on which text is going to be placed
		var ymainaxis = -1;
		currx = float_fix(currx);	//flix floating point errors
		curry = float_fix(curry);

		if(y2 >= 0 && y1 <= 0)	//y=0 appears on the screen - move the text to follow
			xmainaxis = this.height - ((0 - y1) / (y2 - y1)) * this.height + (this.charHeight * 1.5);
		else if(y1 > 0)	//the smallest value of y is below the screen - the x-axis labels get pushed to the bottom of the screen
			xmainaxis = this.height - 5;

		//the x-axis labels have to be a certain distance from the bottom of the screen
		if(xmainaxis > this.height - (this.charHeight / 2))
			xmainaxis = this.height - 5;

		//do the same as above with the y-axis
		if(x2 >= 0 && x1 <= 0)	//y-axis in the middle of the screen
			ymainaxis = ((0-x1)/(x2-x1))*this.width - 2;
		else if(x2 < 0)	//y-axis on the right side of the screen
			ymainaxis = this.width-6;

		if(ymainaxis < (this.ctx.measureText(curry).width + 1)) {
			ymainaxis = -1;
		}

		var sigdigs = String(currx).length + 3;
		//VERTICAL LINES
		for(i = 0; i < this.maxgridlines.x; i++) {
			var xpos = ((currx - x1) / (x2 - x1)) * this.width;	//position of the line (in pixels)
			//make sure it is on the screen
			if(xpos-0.5 > this.width + 1 || xpos < 0) {
				currx += this.xgridscale;
				continue;
			}

			//currx = CalcParam.roundToSignificantFigures(currx, sigdigs);
			currx =  float_fix(currx);

			if(currx === 0)
				xaxis = xpos;

			if(jsguip.gridlines === "normal" || (jsguip.gridlines === "less" && CalcParam.roundFloat(currx) % CalcParam.roundFloat((this.xgridscale*2)) === 0)) {
				this.ctx.fillStyle = "rgb(190,190,190)";
				this.ctx.fillRect (xpos-0.5, 0, 1, this.height);
			}
			this.ctx.fillStyle = "rgb(0,0,0)";

			//Draw label
			if (currx != 0) {
				var xtextwidth = this.ctx.measureText(currx).width;
				if (xpos + xtextwidth * 0.5 > this.width) //cannot overflow the screen
					xpos = this.width - xtextwidth * 0.5 + 1;
				else
					if (xpos - xtextwidth * 0.5 < 0)
						xpos = xtextwidth * 0.5 + 1;
				this.ctx.fillText(currx, xpos, xmainaxis);
			}

			currx += this.xgridscale;

		}
		this.ctx.textAlign = "right";
		sigdigs = String(curry).length + 3;

		//HORIZONTAL LINES
		for(i = 0; i < this.maxgridlines.y; i++) {
			var ypos = this.height - ((curry - y1) / (y2 - y1)) * this.height;	//position of the line (in pixels)
			//make sure it is on the screen
			if(ypos - 0.5 > this.height + 1 || ypos < 0) {
				curry += this.ygridscale;
				continue;
			}

			//curry = CalcParam.roundToSignificantFigures(curry, sigdigs);
			curry = float_fix(curry);

			if(curry == 0)
				yaxis = ypos;

			if(jsguip.gridlines == "normal" || (jsguip.gridlines == "less" && CalcParam.roundFloat(curry) % (CalcParam.roundFloat(this.ygridscale*2)) == 0)) {
				this.ctx.fillStyle = "rgb(190,190,190)";
				this.ctx.fillRect (0, ypos-0.5, this.width, 1);
			}
			this.ctx.fillStyle = "rgb(0,0,0)";

			//Draw label
			if (curry != 0) {
				var ytextwidth = this.ctx.measureText(curry).width;
				if (ypos + (this.charHeight / 2) > this.height) //cannot overflow the screen
					ypos = this.height - (this.charHeight / 2) - 1;
				if (ypos - 4 < 0)
					ypos = 4;
				var xaxispos = ymainaxis;
				if (ymainaxis == -1)
					xaxispos = ytextwidth + 1;
				this.ctx.fillText(curry, xaxispos, ypos + 3);
			}
			curry += this.ygridscale;
		}
		//Draw the axis
		if(xaxis)
			this.ctx.fillRect (xaxis-0.5, 0, 1, this.height);
		if(yaxis)
			this.ctx.fillRect (0, yaxis-0.5, this.width, 1);
	};

	//get the pixel coordinates of a value
	this.getCoord = function(x, y) {
		var xpos = ((x - this.currCoord.x1) / (this.currCoord.x2 - this.currCoord.x1)) * this.width;
		var ypos = this.height - ((y - this.currCoord.y1) / (this.currCoord.y2-this.currCoord.y1)) * this.height;
		return {x : xpos, y : ypos};
	};

	//get the (numerical) position of a (pixel) coordinate
	this.getValue = function(x, y){
		var scale = this.getScale();
		var xpos = x / scale.x + this.currCoord.x1;
		var ypos = (this.height - y) / scale.y + this.currCoord.y1;
		return {x : xpos, y : ypos};
	};

	//zoom to a box. the inputs are pixel coordinates
	this.doZoomBox = function(x1, y1, x2, y2) {
		if(x1 === x2 || y1 === y2) {
			dump("Invalid doZoomBox");
			return;
		}
		var coord1 = this.getValue(x1, y1);
		var coord2 = this.getValue(x2, y2);

		if(x1 > x2) {
			this.currCoord.x1 = coord2.x;
			this.currCoord.x2 = coord1.x;
		}
		else {
			this.currCoord.x1 = coord1.x;
			this.currCoord.x2 = coord2.x;
		}

		if(y2 > y1) {
			this.currCoord.y1 = coord2.y;
			this.currCoord.y2 = coord1.y;
		}
		else {
			this.currCoord.y1 = coord1.y;
			this.currCoord.y2 = coord2.y;
		}

		this.startCoord = this.copyCoord(this.currCoord);
		this.draw();
	};

	this.draw = function() {
		this.drawGrid();
		var alleqs = getAllParametrics();
		for(var i = 0; i < alleqs.length; i++) {
			var xeq = alleqs[i].x.equation;
			var yeq = alleqs[i].y.equation;
			this.drawSystem(xeq, yeq, alleqs[i].color, 3);
		}
		jsguip.updateValues();
	};

	//Gets the scale (pixels per unit)
	this.getScale = function() {
		return {x : (this.width / (this.startCoord.x2 - this.startCoord.x1)),
			y : (this.height / (this.startCoord.y2 - this.startCoord.y1))}
	};

	//get the range of values on the screen
	this.getRange = function() {
		return {x : Math.abs(this.startCoord.x2 - this.startCoord.x1),
			y : Math.abs(this.startCoord.y2 - this.startCoord.y1)}
	};

	var started = false;
	this.checkMove = function(x, y) {
		if(x === this.prevDrag.x && y === this.prevDrag.y)
			return;

		var scale = this.getScale();
		if(this.mousebutton === 1) {
			if(jsguip.currtool === "zoombox" || jsguip.currtool === "zoombox_active") {	//ZOOM BOX
				this.draw();
				this.ctx.strokeStyle = "rgb(150,150,150)";
				this.ctx.strokeRect (this.startDrag.x, this.startDrag.y, x-this.startDrag.x, y-this.startDrag.y);
			}
			else { //CLICK AND DRAG
				this.currCoord.x1 = this.startCoord.x1 - ((x - this.startDrag.x) / scale.x);
				this.currCoord.x2 = this.startCoord.x2 - ((x - this.startDrag.x) / scale.x);

				this.currCoord.y1 = this.startCoord.y1 + ((y - this.startDrag.y) / scale.y);
				this.currCoord.y2 = this.startCoord.y2 + ((y - this.startDrag.y) / scale.y);

				this.draw();
			}
		}
		else if(jsguip.currtool === "trace") {	//TRACE
			this.draw();
			this.drawTrace(this.getEquation(jsguip.currSys), this.getColor(jsguip.currSys), x / scale.x + this.currCoord.x1);
		}
		this.prevDrag = {x : x, y : y};
	};

	this.mouseDown = function(event) {
		document.body.style.cursor = "hand";
		if(this.mousebutton == 0) {
			if(jsguip.currtool === "zoombox") {
				jsguip.currtool = "zoombox_active";
			}
			this.startDrag.x = event.pageX - this.canvasX;
			this.startDrag.y = event.pageY - this.canvasY;
			this.startCoord = this.copyCoord(this.currCoord);
		}
		this.mousebutton = 1;
	};

	this.mouseUp = function(event) {
		//document.body.style.cursor = "auto";
		if(jsguip.currtool === "zoombox_active") {
			this.doZoomBox(this.startDrag.x, this.startDrag.y, event.pageX - this.canvasX, event.pageY - this.canvasY);
			jsguip.setTool("pointer");
		}
		if(jsguip.currtool === "zoomin") {
			if(Math.abs((event.pageX - this.canvasX) - this.startDrag.x) + Math.abs((event.pageY - this.canvasY) - this.startDrag.y) < 5)
				this.zoom(0.10, event);
		}
		if(jsguip.currtool === "zoomout") {
			if(Math.abs((event.pageX - this.canvasX) - this.startDrag.x) + Math.abs((event.pageY - this.canvasY) - this.startDrag.y) < 5)
				this.zoom(-0.10, event);
		}
		this.mousebutton = 0;
		this.startCoord = this.copyCoord(this.currCoord);
	};

	this.mouseWheel = function(event, delta) {
		if(delta > 0) {
			this.zoom(this.zoomFactor, event);
		}
		else {
			this.zoom(-this.zoomFactor, event);
		}
	};

	this.setWindow = function(x1, x2, y1, y2) {
		this.currCoord.x1 = x1;
		this.currCoord.x2 = x2;
		this.currCoord.y1 = y1;
		this.currCoord.y2 = y2;
		this.startCoord = this.copyCoord(this.currCoord);
		this.draw();
	};

	this.zoom = function(scale, event) {
		var range = this.getRange();
		if(event) {
			var mousex = event.pageX - this.canvasX;
			var mousey = event.pageY - this.canvasY;
			var mousetop = 1 - (mousey / this.height);	//if we divide the screen into two halves based on the position of the mouse, this is the top half
			var mouseleft = mousex / this.width;	//as above, but the left hald
			this.currCoord.x1 += range.x * scale * mouseleft;
			this.currCoord.y1 += range.y * scale * mousetop;
			this.currCoord.x2 -= range.x * scale * (1-mouseleft);
			this.currCoord.y2 -= range.y * scale * (1-mousetop);
		}
		else {
			this.currCoord.x1 += range.x * scale;
			this.currCoord.y1 += range.y * scale;
			this.currCoord.x2 -= range.x * scale;
			this.currCoord.y2 -= range.y * scale;
		}
		this.startCoord = this.copyCoord(this.currCoord);
		this.draw();
	};

	this.animate = function() {
		this.currCoord.x1 += 0.05;
		this.currCoord.y1 += 0.05;
		this.currCoord.x2 += 0.05;
		this.currCoord.y2 += 0.05;
		this.draw();
		setTimeout('jsgcalcp.animate()', 50);
	};

	this.resizeGraph = function(width, height) {
		var oldheight = this.height;
		var oldwidth = this.width;

		//Resize the elements
		$("#graph").width(width);
		$("#graph").height(height);
		this.ctx.height = height;
		this.ctx.width = width;
		this.graph.height = height;
		this.graph.width = width;
		this.height = height;
		this.width = width;
		dump("Resized to " + width + "x" + height);

		//Compute the new boundaries of the graph
		this.currCoord.x1 *= (width / oldwidth);
		this.currCoord.x2 *= (width / oldwidth);
		this.currCoord.y1 *= (height / oldheight);
		this.currCoord.y2 *= (height / oldheight);
		this.startCoord = this.copyCoord(this.currCoord);

		//Compute how many grid lines to show
		this.maxgridlines.x = 0.015 * width;
		this.maxgridlines.y = 0.015 * height;
		this.draw();
	};

	this.resetZoom = function() {
		this.currCoord = {x1 : -5 * (this.width / this.height), y1 : -5, x2 : 5 * (this.width / this.height), y2 : 5};
		this.startCoord = this.copyCoord(this.currCoord);
		this.draw();
	};

	this.initCanvas = function() {
		if (this.graph.getContext){
			this.ctx = this.graph.getContext('2d');
			$("#graph_wrapper").width( $( window ).width() - $("#sidewrapper").innerWidth() - $("#toolbar").innerWidth() );
			this.resizeGraph($("#graph_wrapper").innerWidth(), $("#graph_wrapper").height());
			this.currCoord = {x1 : -5 * (this.width / this.height), y1 : -5, x2 : 5 * (this.width / this.height), y2 : 5};
			this.startCoord = this.copyCoord(this.currCoord);
			jsguip.evaluate();

			var self = this;
			$("#graph").mousemove(function(event) {
				self.canvasX = self.graph.offsetLeft;
				self.canvasY = self.graph.offsetTop;
				self.checkMove(event.pageX - self.canvasX, event.pageY - self.canvasY);
			}).mousedown(function(event) {
				self.mouseDown(event);
			}).mousewheel(function(event, delta) {
				self.mouseWheel(event, delta);
				return false;
			}).mouseup(function(event) {
				self.mouseUp(event);
			});

			$(window).resize(function() {
				if($("#sidewrapper").is(":visible"))
					$("#graph_wrapper").width($("#wrapper").width() - $("#sidewrapper").innerWidth() - $("#toolbar").innerWidth());
				else
					$("#graph_wrapper").width($("#wrapper").width() - $("#toolbar").innerWidth());
				self.resizeGraph($("#graph_wrapper").width(), $("#graph_wrapper").height());
			});
		}
		else {
			alert("Sorry, your browser is not supported.");
		}
	};
};


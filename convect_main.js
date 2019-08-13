const MODE_NONE = 0;
const MODE_VECTOR = 7;
const MODE_LINE = 2;
const MODE_CIRCLE = 10;

const POINT_SIZE = 2;
const POINT_STYLE = 0;


var appletParams = { "id": "app1", "width": 1000, "height": 600, "showToolBar": true, "customToolBar": "0 | 7 37 | 2 3 4 5 | 10 11 | 6", "borderColor": null,"showMenuBar": true, "showLogging": false, "showAlgebraInput": false, "showResetIcon": true, "enableLabelDrags": false, "enableShiftDragZoom": true, "enableRightClick": false, "capturingThreshold": null, "showToolBarHelp": false, "errorDialogsActive": true, "useBrowserForJS": false, "allowUpscale": false, "rounding": "5s" };
appletParams.appletOnLoad = function(api) {
	function clickListener(obj) {
		setSelected(obj);
	}

	function addListener(obj) {
		objectAdded(obj);
	}

	function updateListener(obj) {
		setSelected(obj);
	}

	api.registerClickListener(clickListener);
	api.registerAddListener(addListener);
	api.registerUpdateListener(updateListener);
	initConVect();
}

var ggbApp = new GGBApplet(appletParams, true);

window.addEventListener("load", function() { 
    ggbApp.inject('ggb-element');
});


var selectedObj;

function initConVect() {
	document.getElementById("loadbay").innerHTML = "";

	app1.setGridVisible(false);
	app1.setAxesVisible(false, false);

	document.getElementById("selected-name").value = "";
	document.getElementById("selected-mag").value = "";
	document.getElementById("selected-radius").value = "";
	document.getElementById("selected-angle-deg").value = "";

	document.getElementById("selected-name").addEventListener("keypress", onNameInput, false);
	document.getElementById("selected-mag").addEventListener("keypress", onMagInput, false);
	document.getElementById("selected-radius").addEventListener("keypress", onRadiusInput, false);
	document.getElementById("selected-angle-deg").addEventListener("keypress", onAngleInput, false);
}

function onNameInput(e) {
	if (e.which == 13) {
		name = document.getElementById("selected-name").value;
		app1.renameObject(selectedObj, name);
	}
}

function onMagInput(e) {
	if (e.which == 13) {
		mag = document.getElementById("selected-mag").value;
		resizeVector(selectedObj, mag);
	}
}

function onRadiusInput(e) {
	if (e.which == 13) {
		radius = document.getElementById("selected-radius").value;
		setCircleRadius(selectedObj, radius);
	}
}

function onAngleInput(e) {
	if (e.which == 13) {
		angle = document.getElementById("selected-angle-deg").value;
		setObjectAngle(selectedObj, angle);
	}
}

function objectAdded(obj) {
	type = app1.getObjectType(obj);
	if (type == "point") {
		setPointSize(obj, POINT_SIZE);
		setPointStyle(obj, POINT_STYLE);
		hideLabel(obj);
	}
	else if (type == "vector") {
		setSelected(obj);
	}
	else if (type == "line") {
		setSelected(obj);
		setColor(obj, 102, 178, 255);
	}
	else if (type == "circle") {
		setSelected(obj);
		setColor(obj, 102, 178, 255);	
	}
	else if (type == "angle") {
		// do nothing
	}
}

function setSelected(obj) {
	type = app1.getObjectType(obj);
	
	if (type == "vector") {
		selectedObj = obj;
		mag = app1.getValue("Length(" + obj + ")");
		radius = "hidden";
		angle = app1.getValue("Angle(" + obj + ")");
		setSelectedDisplay(type, obj, mag, radius, angle);

		app1.evalCommand("Φ = Angle(" + obj + ")");
	} 
	else if (type == "line") {
		selectedObj = obj;
		mag = "--";
		radius = "hidden";
		angle = app1.getValue("Angle(Line((0,0),(1,0)), " + obj + ")");				
		setSelectedDisplay(type, obj, mag, radius, angle);

		app1.evalCommand("Φ = Angle(Line((0,0),(1,0)), " + obj + ")");
	}
	else if (type == "circle") {
		selectedObj = obj;
		mag = "hidden";
		radius = app1.getValue("Radius(" + obj + ")");
		angle = "--"
		setSelectedDisplay(type, obj, mag, radius, angle);
	}
}

function setSelectedDisplay(type, name, mag, radius, angle) {
	document.getElementById("selected-object").innerHTML = type;
	document.getElementById("selected-name").value = name;

	if (mag == "hidden") {
		document.getElementById("mag-detail").style.display = "none";
	} else {
		document.getElementById("mag-detail").style.display = "";
		if (isNaN(mag)) {
			document.getElementById("selected-mag").value = mag;
			document.getElementById("selected-mag").disabled = true;
		} else {
			document.getElementById("selected-mag").disabled = false;
			document.getElementById("selected-mag").value = parseFloat(mag.toFixed(6));
		}
	}

	if (radius == "hidden") {
		document.getElementById("radius-detail").style.display = "none";
	} else {
		document.getElementById("radius-detail").style.display = "";
		if (isNaN(radius)) {
			document.getElementById("selected-radius").value = radius;
		} else {
			document.getElementById("selected-radius").value = parseFloat(radius.toFixed(6));
		}
	}

	if (isNaN(angle)) {
		document.getElementById("selected-angle-deg").value = angle;
		document.getElementById("selected-angle-deg").disabled = true;
	} else {
		document.getElementById("selected-angle-deg").disabled = false;
		document.getElementById("selected-angle-deg").value = parseFloat((angle * (180 / Math.PI)).toFixed(6));
	}
}


function resizeVector(obj, mag = 1) {
	if (app1.getObjectType(obj) == "vector") {
		str = app1.getDefinitionString(obj);

		startBracket = str.indexOf("(");
		comma = str.indexOf(",");
		endBracket = str.indexOf(")");
		startPoint = str.substring(startBracket + 1, comma);
		endPoint = str.substring(comma + 2, endBracket);
		
		angle = app1.getValue("Angle(" + obj + ")");
		app1.evalCommand("newPoint = " + startPoint + " + (" + mag + "; " + angle + ")");
		x = app1.getXcoord("newPoint");
		y = app1.getYcoord("newPoint");
		app1.deleteObject("newPoint");
		app1.setCoords(endPoint, x, y);
		setSelected(obj);
	}
}

function setObjectAngle(obj, angle) {
	if (app1.getObjectType(obj) == "vector") {
		setVectorAngle(obj, angle);
	} 
	else if (app1.getObjectType(obj) == "line") {
		setLineAngle(obj, angle);
	}
}

function setVectorAngle(obj, angle) {
	if (app1.getObjectType(obj) == "vector") {
		str = app1.getCommandString(obj);

		startBracket = str.indexOf("(");
		comma = str.indexOf(",");
		endBracket = str.indexOf(")");
		startPoint = str.substring(startBracket + 1, comma);
		endPoint = str.substring(comma + 2, endBracket);
		
		mag = app1.getValue("Length(" + obj + ")");

		app1.evalCommand("newPoint = " + startPoint + " + (" + mag + "; " + angle + "°)");
		x = app1.getXcoord("newPoint");
		y = app1.getYcoord("newPoint");
		app1.deleteObject("newPoint");
		app1.setCoords(endPoint, x, y);
		setSelected(obj);
	}
}

function setLineAngle(obj, angle) {
	if (app1.getObjectType(obj) == "line") {
		str = app1.getCommandString(obj);

		startBracket = str.indexOf("(");
		comma = str.indexOf(",");
		endBracket = str.indexOf(")");
		startPoint = str.substring(startBracket + 1, comma);
		endPoint = str.substring(comma + 2, endBracket);
		
		distance = app1.getValue("Distance(" + startPoint + ", " + endPoint + ")");

		foo = "newPoint = " + startPoint + " + (" + distance + "; " + angle + "°)";
		app1.evalCommand(foo);
		
		x = app1.getXcoord("newPoint");
		y = app1.getYcoord("newPoint");
		app1.deleteObject("newPoint");
		
		app1.setCoords(endPoint, x, y);
		setSelected(obj);
	}
}

function setCircleRadius(obj, radius) {
	if (app1.getObjectType(obj) == "circle") {
		// TODO: fix bug with below code!

		// str = app1.getCommandString(obj);

		// startBracket = str.indexOf("(");
		// comma = str.indexOf(",");
		// startPoint = str.substring(startBracket + 1, comma);

		// foo = obj + " = Circle(" + startPoint + ", " + radius + ")";
		// app1.evalCommand(foo);

		setSelected(obj);
	}
}

function setPointSize(obj, pointSize = POINT_SIZE) {
	if (isNaN(pointSize) || pointSize > 9 || pointSize < 1) {
		return;
	}
	app1.setPointSize(obj, pointSize);
}

function setPointStyle(obj, pointStyle = 0) {
	if (isNaN(pointStyle) || pointStyle > 9 || pointStyle < -1) {
		return;
	}
	app1.setPointStyle(obj, pointStyle);
}

function setColor(obj, red=102, green=178, blue=255) {
	app1.setColor(obj, red, green, blue);
}

function hideLabel(obj, hideLabel = true) {
	app1.setLabelVisible(obj, !hideLabel);
}

// Unused!
function saveXml() {
	xml = app1.getXML();

	filename = "construction.xml";
	var file = new Blob([xml], {type: "text/plain"});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"), url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

// Unused!
function loadXml() {
	// TODO
	app1.setXML(xml);
}

var log = require("/api/Log");
var _ = require("/lib/underscore");
var TiShadow = require("/api/TiShadow");

var windows = {};

function stack(e) {
	var win = e.source.__tishadowWin;
	var app = e.source.__tishadowApp;
	
	if (!windows[app]) {
		windows[app] = {};
	}
	
	windows[app][win] = e.source;
	
	log.debug("Stacked window #" + _.size(windows[app]) + " : " + app + " / " + win);
	
	return;
}

function unstack(e) {
	var win = e.source.__tishadowWin;
	var app = e.source.__tishadowApp;
	
	log.debug("Unstacked window #" + _.size(windows[app]) + " : " + app + "/" + win);
	
	delete windows[app][win];
	
	return;
}

exports.create = function(parameters) {
	var win = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
	var app = TiShadow.currentApp || '__REPL';
	
	var w = Ti.UI.createWindow(parameters);
	
	w.__tishadowWin = win;
	w.__tishadowApp = app;
	
	w.addEventListener('open', stack);
	w.addEventListener('close', unstack);
	
	log.debug("Created window: " + app + " / " + win);
	
	return w;
};

exports.closeApp = function(app) {

	if (app && windows[app]) {
		
		for (var win in windows[app]) {

			if (windows[app].hasOwnProperty(win)) {
				windows[app][win].close();
				
				log.debug("Closed window: " + app + " / " + win);
			}
		}
	}
	
	return;
};

exports.closeAll = function() {
	
	for (var app in windows) {
		windows.hasOwnProperty(app) && exports.closeApp(app);
	}
	
	return;
};
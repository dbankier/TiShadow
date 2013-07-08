var log = require("/api/Log");
var _ = require("/lib/underscore");
var TiShadow = require("/api/TiShadow");

var containers = {};

function stack(e) {
	var container = e.source.__tishadowContainer;
	var app = e.source.__tishadowApp;
	
	if (!containers[app]) {
		containers[app] = {};
	}
	
	containers[app][container] = e.source;
	
	log.debug("Stacked container #" + _.size(containers[app]) + " : " + app + " / " + container);
	
	return;
}

function unstack(e) {
	log.debug("Unstacked container #" + _.size(containers[e.app]) + " : " + e.app + "/" + e.container);
	
	delete containers[e.app][e.container];
	
	return;
}

var create = function(o) {
	var container = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
	var app = TiShadow.currentApp || '__REPL';
	
	o.__tishadowContainer = container;
	o.__tishadowApp = app;
	
	o.addEventListener('open', stack);
	o.addEventListener('close', function(e) {
    unstack({ app: app, container: container });
  });
	
	log.debug("Created container: " + app + " / " + container);
	
	return o;
};

exports.createWindow = function(paramaters) {
  return create(Ti.UI.createWindow(paramaters));
};

exports.createTabGroup= function(paramaters) {
  return create(Ti.UI.createTabGroup(paramaters));
};

exports.closeApp = function(app) {

	if (app && containers[app]) {
		
		for (var c in containers[app]) {

			if (containers[app].hasOwnProperty(c)) {
				containers[app][c].close();
				
				log.debug("Closed container: " + app + " / " + c);
			}
		}
	}
	
	return;
};

exports.closeAll = function() {
	
	for (var app in containers) {
		containers.hasOwnProperty(app) && exports.closeApp(app);
	}
	
	return;
};

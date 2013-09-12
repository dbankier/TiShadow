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
  return;
}

function unstack(e) {
  delete containers[e.app][e.container];
  return;
}

function prepareArgs(args) {
  var container = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
  var app = TiShadow.currentApp || '__REPL';

  args = args || {};
  args.__tishadowContainer = container;
  args.__tishadowApp = app;

  return args;
}

var create = function(fn,args) {
  args = prepareArgs(args);
  // exitOnClose hampers the upgrade process so we will prevent it
  args.exitOnClose = false;

  var o = fn(args);
  o.addEventListener('open', stack);
  o.addEventListener('close', function(e) {
    unstack({ app: args.__tishadowApp, container: args.__tishadowContainer });
  });
  return o;
};

//Dumb objects are those we can't rely on any listeners for...
var createDumb = function(fn,args) {
  args = prepareArgs(args);
  args.__tishadowDumb = true;

  // exitOnClose hampers the upgrade process so we will prevent it
  args.exitOnClose = false;

  var o = fn(args);
  stack({source: o});
  return o;
};

exports.createWindow = function(args) {
  return create(Ti.UI.createWindow, args);
};

exports.createTabGroup= function(args) {
  return create(Ti.UI.createTabGroup, args);
};
exports.createNavigationWindow = function(args) {
	return create(Ti.UI.iOS.createNavigationWindow,args);
};


exports.closeApp = function(app) {
  if (app && containers[app]) {
    for (var c in containers[app]) {
      if (containers[app].hasOwnProperty(c)) {
        containers[app][c].close();
        if (containers[app].__tishadowDumb) {
          unstack({app:app, container:container});
        }
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

/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var _ = require("/lib/underscore");
var log = require("/api/Log");

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

function prepareArgs(a) {
  var container = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
  var app = require("/api/TiShadow").currentApp || '__REPL';

  var args = a || {};
  args.__tishadowContainer = container;
  args.__tishadowApp = app;

  return args;
}

var create = function(fn,a) {
  var args = prepareArgs(a);
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
var createDumb = function(fn,a) {
  var args = prepareArgs(a);
  args.__tishadowDumb = true;

  var o = fn(args);
  stack({source: o});
  return o;
};
var createHideable = function(fn, evt, a) {
  var args = prepareArgs(a);
  var o = fn(args);
  o.__closeFn = 'hide';
  stack({source: o});

  o.addEventListener(evt, function(e) {
    unstack({ app: args.__tishadowApp, container: args.__tishadowContainer });
  });
  return o;
};

['createWindow', 'createTabGroup'].forEach(function(cmd) {
  exports[cmd]= function(args) {
    return create(Ti.UI[cmd], args);
  };
});

exports.createSplitWindow= function(args) {
  return create(Ti.UI.iPad.createSplitWindow, args);
};

exports.createNavigationWindow = function(args) {
	return create(Ti.UI.iOS.createNavigationWindow,args);
};

['createAlertDialog', 'createOptionDialog'].forEach(function(cmd) {
  exports[cmd]= function(args) {
    return createHideable(Ti.UI[cmd], 'click', args);
  };
});

exports.createPopover= function(args) {
  return createHideable(Ti.UI.iPad.createPopover, 'hide', args);
};

exports.closeApp = function(a) {
  var app = a || "__REPL";
  if (app && containers[app]) {
    _.keys(containers[app]).reverse().forEach(function(c) {
      if (containers[app].hasOwnProperty(c)) {
        var current = containers[app][c];
        if (current.__tishadowDumb) {
          unstack({app:app, container:c});
        }
        log.debug("CLOSING: " + c);
        log.debug(current.apiName);
        current[current.__closeFn || 'close']({animated:false});
      }
    });
  }
  return;
};

exports.closeAll = function() {

  for (var app in containers) {
    containers.hasOwnProperty(app) && exports.closeApp(app);
  }

  return;
};

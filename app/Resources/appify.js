/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

/*
 * This is a template used when TiShadow "appifying" a titanium project.
 * See the README.
 */

Titanium.App.idleTimerDisabled = true;

var TiShadow = require("/api/TiShadow");
TiShadow.Appify = "{{app_name}}";
var Compression = require('ti.compression');
require("/lib/ti-mocha");

// If new install clear cache
if (Ti.App.Properties.getString("tishadow::container_version",0) !== "{{date}}") {
  TiShadow.clearCache(true);
  Ti.App.Properties.setString("tishadow::container_version","{{date}}"); 
}


// Need to unpack the bundle on a first load;
var path_name = "{{app_name}}".replace(/ /g,"_");
var target = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, path_name);
if (!target.exists()) {
  target.createDirectory();
  Compression.unzip(Ti.Filesystem.applicationDataDirectory + "/" + path_name, Ti.Filesystem.resourcesDirectory + "/" + path_name + '.zip',true);
}

//Call Home
TiShadow.connect({
  proto: "{{proto}}",
  host : "{{host}}",
  port : "{{port}}",
  room : "{{room}}",
  name : Ti.Platform.osname + ", " + Ti.Platform.version + ", " + Ti.Platform.address
});

//Use LogCatcher
var Logger = require("yy.logcatcher");
Logger.addEventListener("error", function(e) {
  var Log = require("/api/Log");
  delete e.source;
  delete e.type;
  delete e.bubbles;
  delete e.cancelBubble;
  Log.error(JSON.stringify(e, null, "  "));
});

//Launch the app
TiShadow.launchApp(path_name);


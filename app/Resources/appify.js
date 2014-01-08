/*
 * This is a template used when TiShadow "appifying" a titanium project.
 * See the README.
 */

Titanium.App.idleTimerDisabled = true;

var TiShadow = require("/api/TiShadow");
var Compression = require('ti.compression');
require("/lib/ti-mocha");


// Need to unpack the bundle on a first load;
var path_name = "{{app_name}}".replace(/ /g,"_");
var target = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, path_name);
if (!target.exists()) {
  target.createDirectory();
  Compression.unzip(Ti.Filesystem.applicationDataDirectory + "/" + path_name, Ti.Filesystem.resourcesDirectory + "/" + path_name + '.zip',true);
}


//Call home
TiShadow.connect({
  proto: "{{proto}}",
  host : "{{host}}",
  port : "{{port}}",
  room : "{{room}}",
  name : Ti.Platform.osname + ", " + Ti.Platform.version + ", " + Ti.Platform.address
});

//Launch the app
TiShadow.launchApp(path_name);


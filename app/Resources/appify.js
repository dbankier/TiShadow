/*
 * This is a template used when TiShadow "appifying" a titanium project.
 * See the README.
 */

var TiShadow = require("/api/TiShadow");
var zipfile = Ti.Platform.osname === "android" ? require("com.yydigital.zip"): require("zipfile");


// Need to unpack the bundle on a first load;
var path_name = "{{app_name}}".replace(/ /g,"_");
var target = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, path_name);
if (!target.exists()) {
  target.createDirectory();
  var dataDir = Ti.Platform.osname === "android" ?  Ti.Filesystem.applicationDataDirectory :  Ti.Filesystem.applicationDataDirectory.slice(0,Ti.Filesystem.applicationDataDirectory.length - 1).replace('file://localhost','').replace(/%20/g,' ');
  var resDir = Ti.Platform.osname === "android" ?  Ti.Filesystem.resourcesDirectory:  Ti.Filesystem.resourcesDirectory.slice(0,Ti.Filesystem.resourcesDirectory.length - 1).replace('file://localhost','').replace(/%20/g,' ');
  zipfile.extract(resDir+'/' + "{{app_name}}" + '.zip', dataDir + "/" + path_name);
}


//Call home
TiShadow.connect({
  host: "{{host}}",
  port: "{{port}}",
  room: "{{room}}",
  name: Ti.Platform.osname + ", " + Ti.Platform.version + ", " + Ti.Platform.address
});

//Launch the app
TiShadow.launchApp("{{app_name}}");


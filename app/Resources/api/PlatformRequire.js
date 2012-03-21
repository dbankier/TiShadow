var log = require("/api/Log");
var os = Ti.Platform.osname;
exports.require = function(path) {
  try {
    //Try platform specific path first
    var platform_path =  path.replace(Ti.Filesystem.applicationDataDirectory, Ti.Filesystem.applicationDataDirectory + (os === "android" ? "android" : "iphone") + "/");
    var file = Ti.Filesystem.getFile(platform_path + ".js");
    if (file.exists()) {
      path = platform_path;   
    }
    if (os === "android") {
      return require(require("com.yydigital.zip").absolute(path + ".js"));
    } else {
      return require(path);
    }
  } catch(e) {
    log.error(e.toString());
  }
};

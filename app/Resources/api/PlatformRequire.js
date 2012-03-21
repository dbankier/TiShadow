var log = require("/api/Log");
var os = Ti.Platform.osname;


// The TiShadow build of the Titanium SDK does not cache CommonJS modules loaded
// from the applicationDataDirectory. This is so that if an update to the app is
// deployed, i.e. a file in the applicationDataDirectory is modified, the changes
// while be loaded. That said loading a CommonJS module every time that it is loaded
// make the deployed bundle run slowly. So we will manage the caching of those
// modules here in the code.
var cache={};

exports.require = function(path) {
  try {
    //Try platform specific path first
    var platform_path =  path.replace(Ti.Filesystem.applicationDataDirectory, Ti.Filesystem.applicationDataDirectory + (os === "android" ? "android" : "iphone") + "/");
    var file = Ti.Filesystem.getFile(platform_path + ".js");
    if (file.exists()) {
      path = platform_path;   
    }
    // Is the CommonJS module in the cache
    if (cache[path]) {
      return cache[path];
    }
    var mod;
    if (os === "android") {
      mod = require(require("com.yydigital.zip").absolute(path + ".js"));
    } else {
      mod = require(path);
    }
    cache[path] = mod;
    return mod;
  } catch(e) {
    log.error(e.toString());
  }
};

exports.clearCache = function () {
  cache = {};
};

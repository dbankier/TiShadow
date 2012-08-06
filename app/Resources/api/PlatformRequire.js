var log = require("/api/Log");
var utils = require("/api/Utils");
var os = Ti.Platform.osname;


// The TiShadow build of the Titanium SDK does not cache CommonJS modules loaded
// from the applicationDataDirectory. This is so that if an update to the app is
// deployed, i.e. a file in the applicationDataDirectory is modified, the changes
// while be loaded. That said loading a CommonJS module every time that it is loaded
// make the deployed bundle run slowly. So we will manage the caching of those
// modules here in the code.
var cache={};

exports.require = function(extension) {
  var base = Ti.Filesystem.applicationDataDirectory + require("/api/TiShadow").currentApp + "/";
  try {
    // In case of double mapping (if required from variable/s)
    if (extension.indexOf(base) !== -1) {
      var regex = new RegExp(base, 'g');
      extension = extension.replace(regex, "/");
      if (extension.indexOf("/") === 0) {
        extension = extension.substring(1);
      }
    }
    // Full Path
    var path = base + extension;
    //Try platform specific path first
    var platform_path =  base + (os === "android" ? "android" : "iphone") + "/" + extension;
    var file = Ti.Filesystem.getFile(platform_path + ".js");
    if (file.exists()) {
      path = platform_path;   
    }
    // Is the CommonJS module in the cache
    if (cache[path]) {
      return cache[path];
    }
    var mod;
    // From TiShadow SDK 2.1.0 we longer need to translate for Android
    // Set version in tiapp.xml to 1.0 if using SDK < 2.1.0
    // You can set version to, e.g. 2.0 if using SDK >= 2.1.0 but it won't break
    // anything if you don't.
    if (os === "android" && Ti.App.version === "1.0") {
      mod = require(require("com.yydigital.zip").absolute(path + ".js"));
    } else {
      mod = require(path);
    }
    cache[path] = mod;
    return mod;
  } catch(e) {
    log.error(utils.extractExceptionData(e));
  }
};

exports.clearCache = function () {
  cache = {};
};

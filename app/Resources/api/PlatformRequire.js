var log = require("/api/Log");
var utils = require("/api/Utils");
var os = Ti.Platform.osname;
var tishadow_version = Ti.version.replace(/tishadow_?/,"").replace(/\./g,"");


// The TiShadow build of the Titanium SDK does not cache CommonJS modules loaded
// from the applicationDataDirectory. This is so that if an update to the app is
// deployed, i.e. a file in the applicationDataDirectory is modified, the changes
// while be loaded. That said loading a CommonJS module every time that it is loaded
// make the deployed bundle run slowly. So we will manage the caching of those
// modules here in the code.
var cache={};

exports.require = function(extension) {
  try {
    // Full Path
    var path = exports.file(extension);
    // Is the CommonJS module in the cache
    if (cache[path]) {
      return cache[path];
    }
    var mod;
    // From TiShadow SDK 2.1.3+ we longer need to translate for Android.
    // The `if` statement is to support legacy tishadow sdks...
    // Was meant to be fixed in 2.1.0 but there is an off-by-one error that is planned to be fixed next release
    if (os === "android" && tishadow_version < 213) {
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

exports.file = function(extension) {
  var base = Ti.Filesystem.applicationDataDirectory + "/" + require("/api/TiShadow").currentApp + "/";
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
  //Add ".js" for CommonJS inclusion lookups.
  var extension_parts = extension.split("/");
  var needsJS = extension_parts[extension_parts.length-1].indexOf(".") === -1;
  var file = Ti.Filesystem.getFile(platform_path + (needsJS ? ".js" : ""));
  if (file.exists()) {
    path = platform_path;
  }
  return path;
};

exports.clearCache = function () {
  cache = {};
};

var log = require("/api/Log");
var utils = require("/api/Utils");
var os = Ti.Platform.osname;
var tishadow_version = Ti.version.replace(/tishadow_?/,"").replace(/\./g,"");
var _ = require("/lib/underscore");

if (os === "android") {
  var density_orientation = (Ti.Gesture.orientation === Ti.UI.LANDSCAPE_LEFT) ? "land" : "port",
      density_folders = (function () {

        var folders = [],
            ratio = ((Ti.Platform.displayCaps.platformWidth / Ti.Platform.displayCaps.platformHeight) < ((density_orientation === "land") ? (320 / 240) : (240 / 320))) ? "long" : "notlong",
            logicalDensityFactor = Ti.Platform.displayCaps.logicalDensityFactor,
            density;

        if (logicalDensityFactor <= 0.75) {
          density = "ldpi";
        } else if (logicalDensityFactor <= 1.0) {
          density = "mdpi";
        } else if (logicalDensityFactor <= 1.5) {
          density = "hdpi";
        } else {
          density = "xhdpi";
        }

        folders.push("res-" + ratio + "-%ORIENTATION%-" + density);
        folders.push("res-%ORIENTATION%-" + density);
        folders.push("res-" + density);

        if (density === "ldpi") {
          folders.push("low");
        } else if (density === "mdpi") {
          folders.push("medium");
        } else if (density === "hdpi") {
          folders.push("high");
        }

        folders.push("res-mdpi");

        return folders;
  })();

  Ti.Gesture.addEventListener("orientationchange", function (e) {
    density_orientation = (e.orientation === Ti.UI.LANDSCAPE_LEFT) ? "land" : "port";
  });
}

// The TiShadow build of the Titanium SDK does not cache CommonJS modules loaded
// from the applicationDataDirectory. This is so that if an update to the app is
// deployed, i.e. a file in the applicationDataDirectory is modified, the changes
// while be loaded. That said loading a CommonJS module every time that it is loaded
// make the deployed bundle run slowly. So we will manage the caching of those
// modules here in the code.
var cache={};

function custom_require(file) {
  try {
    log.info("Requiring: " + file);
    var rfile = Ti.Filesystem.getFile(file + ".js");
    var contents = rfile.read().text;
    return eval("(function(exports){var __OXP=exports;var module={'exports':exports};" + contents + ";if(module.exports !== __OXP){return module.exports;}return exports;})({})");
  } catch(e) { 
    e.file=file; 
    log.error(utils.extractExceptionData(e)); 
  }
}

exports.require = function(extension) {
  try {
    // Full Path
    var path = exports.file(extension);
    // Assuming that it is a native module if the path does not exist
    if (!Ti.Filesystem.getFile(path + ".js").exists()) {
      log.debug("Native module:" + extension);
      return require(extension);
    }
    // Is the CommonJS module in the cache
    if (cache[path]) {
      return cache[path];
    }
    var mod = custom_require(path);
    cache[path] = mod;
    return mod;
  } catch(e) {
    log.error(utils.extractExceptionData(e));
  }
};

exports.include = function(context) {
  try {
    // Full Path
    for (var i = 1, length = arguments.length; i< length; i++) {
      var path = exports.file(arguments[i]);
      var ifile = Ti.Filesystem.getFile(path);
      var contents = ifile.read().text;
      eval.call(context, contents);
    }
  } catch(e) {
    log.error(utils.extractExceptionData(e));
  }
};

// Currently only doing retina check for iOS. Android is TODO
function densityFile(file) {
  //iOS Retina Check
  if ((os === "ipad" || os === "iphone") && Ti.Platform.displayCaps.density === "high") {
    var file_parts = file.split(".");
    var ext = file_parts.pop();
    var ret_file_name = file_parts.join(".") + "@2x." + ext;
    if (Ti.Filesystem.getFile(ret_file_name).exists()) {
      return ret_file_name;
    }
  } else if (os === "android") {
    var d_file_name = file.replace("android//images/", "android//images/%FOLDER%/"),
        do_file_name,
        i;
    for (i in density_folders) {
      do_file_name = d_file_name.replace("%FOLDER%", density_folders[i].replace('%ORIENTATION%', density_orientation));
      do9_file_name = do_file_name.replace('.png', '.9.png');
      if (Ti.Filesystem.getFile(do_file_name).exists() || Ti.Filesystem.getFile(do9_file_name).exists()) {
        return do_file_name;
      }
    }
  }
  return null;

}
exports.file = function(extension) {
  if (extension === "/" || extension === "//" ) { // Avoid conflicts with Backbone.js
    return extension;
  }
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
  } else if (!needsJS) { // Might have density file only in platform specific folder
    var platform_dense = densityFile(platform_path);
    if (null !== platform_dense) {
      path = platform_dense;
    }
  }
  return path;
};

// if a list of files is provided it will selectively clear the cache
exports.clearCache = function (list) {
  if (_.isArray(list)) {
    list.forEach(function(file) {
      if (file.match(".js$")) {
        cache[exports.file(file.replace(/.js$/,""))] = null;
        cache[exports.file("/" + file.replace(/.js$/,""))] = null;
      }
    });
  } else {
    cache = {};
  }
};

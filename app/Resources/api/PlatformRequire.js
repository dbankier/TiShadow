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
        folders.push("");

        return folders;
  })();

  Ti.Gesture.addEventListener("orientationchange", function (e) {
    density_orientation = (e.orientation === Ti.UI.LANDSCAPE_LEFT) ? "land" : "port";
  });
}

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

function injectSuffix(file, suffix) {
  var file_parts = file.split(".");
  var ext = file_parts.pop();
  return file_parts.join(".") + suffix + "." + ext;
}

//density files only for png files
function densityFile(file) {
  //iOS Retina Check
  if ((os === "ipad" || os === "iphone")) {
    if (Ti.Filesystem.getFile(file).exists()) {
      return file;
    }
    var ret_file_name = injectSuffix(file, "@2x");
    if (Ti.Filesystem.getFile(ret_file_name).exists() && Ti.Platform.displayCaps.density === "high") {
      return ret_file_name;
    }
  } else if (os === "android") {
    var d_file_name = file.replace("android//images/", "android//images/%FOLDER%/"),
        do_file_name,
        i;
    for (i in density_folders) {
      do_file_name = d_file_name.replace("%FOLDER%", density_folders[i].replace('%ORIENTATION%', density_orientation));
      do9_file_name = injectSuffix(do_file_name, '.9');
      if (Ti.Filesystem.getFile(do_file_name).exists() || Ti.Filesystem.getFile(do9_file_name).exists()) {
        return do_file_name;
      }
    }
  }
  return null;
}
exports.file = function(extension) {
  var base = Ti.Filesystem.applicationDataDirectory + "/" + require("/api/TiShadow").currentApp + "/";
  var path = base + extension,
      platform_path =  base + (os === "android" ? "android" : "iphone") + "/" + extension;
  var extension_parts = extension.split("/");
  var needsJS = extension_parts[extension_parts.length-1].indexOf(".") === -1;
  var isPNG = extension.toLowerCase().match("\\.png$");
  if (!isPNG) {
    var file = Ti.Filesystem.getFile(platform_path + (needsJS ? ".js" : ""));
    if (file.exists()) {
      return platform_path;
    }
  } else { 
    var platform_dense = densityFile(platform_path);
    if (null !== platform_dense) {
      return platform_dense;
    }
  }

	if (Ti.Filesystem.getFile(path + (needsJS ? ".js" : "")).exists()) {
		return path;
	}
	return extension;
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

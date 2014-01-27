var log = require("/api/Log"),
    utils = require("/api/Utils"),
    densityFile = require("/api/DensityAssets"),
    os = Ti.Platform.osname,
    _ = require("/lib/underscore"),
    global_context = this,
    global_keys,
    cache={},
    spys = {};

/*
 * require() override
 */
function custom_require(file) {
  try {
    log.info("Requiring: " + file);
    var rfile = Ti.Filesystem.getFile(file);
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
    var path = exports.file(extension + ".js");
    // Assuming that it is a native module if the path does not exist
    if (!Ti.Filesystem.getFile(path).exists()) {
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

/*
 * Ti.include() override
 */
exports.include = function(context) {
  try {
    // Full Path
    for (var i = 1, length = arguments.length; i< length; i++) {
      var path = exports.file(arguments[i]);
      var ifile = Ti.Filesystem.getFile(path);
      var contents = ifile.read().text;
      eval.call(context || global_context, contents);
    }
  } catch(e) {
    log.error(utils.extractExceptionData(e));
  }
};

/*
 * Asset Redirection
 */
exports.file = function(extension) {
  if (_.isArray(extension)) {
    return extension.map(exports.file);
  } else if (typeof extension !== "string") {
    return extension;
  }
  extension = extension.replace(/^\//, '');
  var base = Ti.Filesystem.applicationDataDirectory + "/" + require("/api/TiShadow").currentApp + "/";
  var path = base + extension,
  platform_path =  base + (os === "android" ? "android" : "iphone") + "/" + extension;
  var isImage = extension.toLowerCase().match("\\.(png|jpg)$");
  if (!isImage) {
    var file = Ti.Filesystem.getFile(platform_path);
    if (file.exists()) {
      return platform_path;
    }
  } else { 
    var platform_dense = densityFile.find(platform_path);
    if (null !== platform_dense) {
      return platform_dense;
    }
  }

  if (Ti.Filesystem.getFile(path).exists()) {
    return path;
  }
  return extension;
};

/*
 * clear require and global cache
 */
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
  for (var a in global_context) {
    if (global_context.hasOwnProperty(a) && !_.contains(global_keys, a)) {
      delete global_context[a];
    }
  }
};

/*
 * new repl
 */
exports.eval = function(message) {
  try {
    __log.repl(eval.call(global_context, message.code));
  } catch (e) {
    __log.error(require('/api/Utils').extractExceptionData(e));
  }
};

exports.addSpy = function(name,spy) {
  spys[name]=spy;
};

/*
 * inject global functions
 */
(function(context) {
  context.__log = require('/api/Log');
  context.__p = exports;
  context.L = require('/api/Localisation').fetchString;
  context.assert = require('/api/Assert');
  context.closeApp =require('/api/TiShadow').closeApp;
  context.launchApp = require('/api/TiShadow').nextApp;
  context.clearCache = require('/api/TiShadow').clearCache;
  context.runSpec = function() {
    var path_name = require('/api/TiShadow').currentApp.replace(/ /g,"_");
    require("/api/Spec").run(path_name, false);
  };
  context.addSpy = exports.addSpy;
  context.getSpy = function(name) {
    return spys[name];
  };
  context.Ti.Shadow = true;
})(global_context);
//Needed for Android
Ti.Shadow = true;
global_keys = _.keys(global_context);

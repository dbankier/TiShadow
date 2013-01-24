var log = require("/api/Log");
var TiShadow = require("/api/TiShadow");
var TiDynamicFont = require('yy.tidynamicfont');

exports.loadCustomFonts = function(name, base) {
  base = base || "";
  var dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + name + "/fonts/" + base);
  log.debug(dir.nativePath);
  var files = dir.getDirectoryListing();
  if (!files) {
    return;
  }
  files.forEach(function(file_name) {
    if (file_name.toLowerCase().match(/\.otf$/) ||
       file_name.toLowerCase().match(/\.ttf$/) ) { // assume font
      log.debug("Registering Font: " + file_name);
      var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + name + "/fonts/" + base + file_name);
      TiDynamicFont.registerFont(file);
    } else { //assume directory (due to no isDirectory in iOS)
      exports.loadCustomFonts(name, base + file_name + "/");
    }
  });
};

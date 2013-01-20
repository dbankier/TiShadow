var log = require("/api/Log");
var TiShadow = require("/api/TiShadow");
var TiDynamicFont = require('yy.tidynamicfont');

exports.loadCustomFonts = function(name) {
  var dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + name + "/fonts");
  var files = dir.getDirectoryListing();
  if (!files) {
    return;
  }
  files.forEach(function(file_name) {
    log.debug("Registering Font: " + file_name);
    var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + name + "/fonts/" + file_name);
    TiDynamicFont.registerFont(file);
  });
};

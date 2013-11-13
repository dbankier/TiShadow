var log = require("/api/Log");
var TiShadow = require("/api/TiShadow");
var TiDynamicFont = require('yy.tidynamicfont');

function loadAll(root) {
  var dir = Ti.Filesystem.getFile(root);
  var files = dir.getDirectoryListing();
  if (!files) {
    return;
  }
  files.forEach(function(file_name) {
    if (file_name.toLowerCase().match(/\.otf$/) ||
       file_name.toLowerCase().match(/\.ttf$/) ) { // assume font
      log.debug("Registering Font: " + file_name);
      var file = Ti.Filesystem.getFile(root, file_name);
      TiDynamicFont.registerFont(file);
    } 
  });

}
exports.loadCustomFonts = function(name) {
  loadAll(Ti.Filesystem.applicationDataDirectory + name + "/fonts/");
  loadAll(Ti.Filesystem.applicationDataDirectory + name + "/iphone/fonts/");
};

var p = require('/api/PlatformRequire');
var log = require('/api/Log');
var jasmine = require('/lib/jasmine-1.2.0').jasmine;
var TiShadowReporter = require('/api/TiShadowReporter');

jasmine.getEnv().addReporter(new TiShadowReporter());


function loadSpecs(base, filter) {
  var dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + name + "/spec/" + base);
  var files = dir.getDirectoryListing();
  if (!files) {
    return;
  };
  files.forEach(function(file) {
    if (file.match(/_spec.js$/)) {
      p.require("/spec/" + base + "/" + (file.replace(".js", "")));
    } else if (filter === {} || filter[file]) {
      loadSpecs(name, base + "/" + file, filter);
    }
  });
}

exports.run = function (name) {
  var filter_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + name + "/spec/specs"); 
  var filter = {};
  if (filter_file.exists()) {
    filter_file.read().text.split("\n").forEach(function(dir) {
      filter[dir.trim()] = 1;
    });
  }
  p.clearCache();
  require("/api/Localisation").clear();
  loadSpecs(name, "", filter);
  jasmine.getEnv().execute();
}




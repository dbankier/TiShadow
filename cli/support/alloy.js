var fs     = require("fs"),
    path   = require("path"),
    crypto = require("crypto"),
    _      = require("underscore"),
    config = require("./config"),
    logger = require("../../server/logger.js");

var current_map, 
    file_list,
    previous_map_file = path.join(config.tishadow_build, 'alloy_map.json');

exports.mapFiles = function(last_stat) {
  // full build if the previous map doesn't exits
  if (!fs.existsSync(previous_map_file)) {
    return file_list;
  }
  var previous_map = require(previous_map_file);
  file_list.files = file_list.files.filter(function(file) {
    return (!file.match("\.js$") && fs.statSync(path.join(config.resources_path,file)).mtime > last_stat)
      || current_map[file] !== previous_map[file];
  });
  return file_list;
};

exports.buildMap = function() {
  // regular filtered by last_stat won't do it alone 
  file_list = fs.getList(config.resources_path);

  // create a map of hashes for js files
  var js_files = file_list.files.filter(function(name) { return name.match("\.js$"); }); 
  current_map = _.object(js_files, js_files.map(function(file) {
    return crypto.createHash('md5').update(fs.readFileSync(path.join(config.resources_path, file))).digest("hex");
  }));
};

exports.writeMap = function() {
  fs.writeFileSync(previous_map_file, JSON.stringify(current_map));
}

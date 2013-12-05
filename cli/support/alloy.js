var fs     = require("fs"),
    path   = require("path"),
    crypto = require("crypto"),
    _      = require("underscore"),
    config = require("./config"),
    logger = require("../../server/logger.js");

var current_map, 
    file_list,
    previous_map_file;

exports.mapFiles = function(last_stat) {
  // full build if the previous map doesn't exits
  if (!fs.existsSync(config.alloy_map_path)) {
    return file_list;
  }
  if (previous_map_file) {
    var previous_map = require(previous_map_file);
    file_list.files = file_list.files.filter(function(file) {
        return current_map[file] !== previous_map[file];
    });
  }
  return file_list;
};

exports.buildMap = function() {
  // regular filtered by last_stat won't do it alone 
  file_list = fs.getList(config.resources_path);

  // create a map of hashes for js files
  current_map = _.object(file_list.files,file_list.files.map(function(file) {
    return crypto.createHash('md5').update(fs.readFileSync(path.join(config.resources_path, file))).digest("hex");
  }));
};

exports.writeMap = function() {
  fs.writeFileSync(config.alloy_map_path, JSON.stringify(current_map));
}

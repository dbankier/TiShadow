var path = require("path"),
    fs = require("fs"),
    xml2js = require("xml2js"),
    base = process.cwd(),
    config = {
      base: base
    };

//get app name
function getAppName(callback) {
  var parser = new xml2js.Parser();
  fs.readFile(path.join(base,'tiapp.xml'), function(err, data) {
    parser.parseString(data, function (err, result) {
      callback(result);
    });
  });
}

config.init = function(callback) {
  getAppName(function(result) {
    var app_name = config.app_name = result.name || "bundle";

    config.resources_path    = path.join(base, 'Resources');
    config.i18n_path    = path.join(base, 'i18n');
    config.build_path        = path.join(base, 'build');
    config.tishadow_build    = path.join(config.build_path, 'tishadow');
    config.last_updated_file = path.join(config.tishadow_build, 'last_updated'); 
    config.tishadow_src      = path.join(config.tishadow_build, 'src');
    config.tishadow_dist     = path.join(config.tishadow_build, 'dist');
    config.bundle_file       = path.join(config.tishadow_dist, app_name + ".zip");

    config.isUpdate = process.argv[2] === "update" || process.argv[3] === "update";
    config.isSpec   = process.argv[2] === "spec";

    callback();
  });
}


module.exports = config;

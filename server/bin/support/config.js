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

//Default server setting
config.port = 3000;
config.host = "localhost";

//Config setup
config.buildPaths = function(env, callback) {
  config.init(env);
  getAppName(function(result) {
    var app_name = config.app_name = result.name || "bundle";

    config.resources_path    = path.join(base, 'Resources');
    config.i18n_path         = path.join(base, 'i18n');
    config.build_path        = path.join(base, 'build');
    config.tishadow_build    = path.join(config.build_path, 'tishadow');
    config.last_updated_file = path.join(config.tishadow_build, 'last_updated'); 
    config.tishadow_src      = path.join(config.tishadow_build, 'src');
    config.tishadow_dist     = path.join(config.tishadow_build, 'dist');
    config.bundle_file       = path.join(config.tishadow_dist, app_name + ".zip");
    config.alloy_path        = path.join(config.resources_path, 'app');
    config.jshint_path       = fs.existsSync(config.alloy_path) ? config.alloy_path : config.resources_path;
    
    callback();
  });
};

config.init = function(env) {
  config.isUpdate = env.update 
                    && fs.existsSync(config.tishadow_src)
                    && fs.existsSync(config.last_updated_file);
  config.isSpec   = env._name === "spec";
  config.isTailing = env.tailLogs || config.isSpec;
  config.locale   = env.locale;
  config.isJUnit  = env.junitXml;
  config.isREPL   = env._name === "repl";
  config.host     = env.host || config.host;
  config.port     = env.port || config.port;
  config.room     = env.room || "default";
  config.isLongPolling = env.longPolling;
};


module.exports = config;

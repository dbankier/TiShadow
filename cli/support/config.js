var path = require("path"),
    fs = require("fs"),
    xml2js = require("xml2js"),
    colors = require("colors"),
    base = process.cwd(),
    home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    config = {};

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
var config_path = path.join(home,'.tishadow.json');
if (fs.existsSync(config_path)) {
  config = require(config_path);
}
config.base = base;
config.alloy_path        = path.join(base, 'app');
config.resources_path    = path.join(base, 'Resources');
config.modules_path      = path.join(base, 'modules');
config.platform_path     = path.join(base, 'platform');
config.spec_path         = path.join(base, 'spec');
config.i18n_path         = path.join(base, 'i18n');
config.build_path        = path.join(base, 'build');

//Config setup
config.buildPaths = function(env, callback) {
  config.init(env);
  getAppName(function(result) {
    var app_name = config.app_name = result.name || "bundle";
    config.base              = base;
    config.tishadow_build    = path.join(config.build_path, 'tishadow');
    config.last_updated_file = path.join(config.tishadow_build, 'last_updated'); 
    config.tishadow_src      = path.join(config.tishadow_build, 'src');
    config.tishadow_spec     = path.join(config.tishadow_src, 'spec');
    config.tishadow_dist     = path.join(config.tishadow_build, 'dist');
    config.bundle_file       = path.join(config.tishadow_dist, app_name + ".zip");
    config.jshint_path       = fs.existsSync(config.alloy_path) ? config.alloy_path : config.resources_path;

    config.isAlloy = fs.existsSync(config.alloy_path);
    config.isPatch = env.patch;
    config.isUpdate = (env.update || env.patch) 
                    && fs.existsSync(config.tishadow_src)
                    && fs.existsSync(config.last_updated_file);

    callback();
  });
};

config.init = function(env) {
  config.isSpec     = env._name === "spec";
  config.isDeploy   = env._name === "deploy";
  config.isTailing  = env.tailLogs || config.isSpec;
  config.locale     = env.locale;
  config.isJUnit    = env.junitXml;
  config.isREPL     = env._name === "repl";
  config.isBundle   = env._name === "bundle";
  config.host       = env.host || config.host || "localhost";
  config.port       = env.port || config.port || "3000";
  config.room       = env.room || config.room || "default";
  config.internalIP = env.internalIp;
  config.isLongPolling = env.longPolling;
  config.isManageVersions = env.manageVersions;
};

config.write = function(env) {
  var new_config = {};
  if (fs.existsSync(config_path)) {
    new_config = require(config_path);
  }
  ['host','port','room'].forEach(function(param) {
    if (env[param] !== undefined) {
      new_config[param] = env[param];
    }
  });
  var config_text = JSON.stringify(new_config, null, 4);
  console.log(config_text.grey);
  console.log("TiShadow configuration file updated.");
  fs.writeFileSync(config_path, config_text);
}


module.exports = config;

var path = require("path"),
    fs = require("fs"),
    xml2js = require("xml2js"),
    colors = require("colors"),
    logger = require("../../server/logger"),
    base = process.cwd(),
    home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
    platforms = ['iphone','android','blackberry','mobileweb'],
    config = {};

//get app name
function getAppName(callback) {
  var parser = new xml2js.Parser();
  fs.readFile(path.join(base,'tiapp.xml'), function(err, data) {
    if (err) callback({});
    else {
      parser.parseString(data, function (err, result) {
        callback(result);
      });
    }
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
config.fonts_path        = path.join(config.resources_path, 'fonts');
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
    config.tishadow_src      = path.join(config.tishadow_build, 'src');
    config.tishadow_spec     = path.join(config.tishadow_src, 'spec');
    config.tishadow_dist     = path.join(config.tishadow_build, 'dist');
    config.bundle_file       = path.join(config.tishadow_dist, app_name + ".zip");
    config.jshint_path       = fs.existsSync(config.alloy_path) ? config.alloy_path : config.resources_path;
    if (config.isTiCaster && result.ticaster_user && result.ticaster_app) {
      config.room = result.ticaster_user + ":" + result.ticaster_app;
    }
    if (config.room === undefined) {
      logger.error("ticaster setting missing from tiapp.xml");
      process.exit();
    }
    config.isAlloy = fs.existsSync(config.alloy_path);
    if (!config.platform && config.isAlloy) {
      platforms.some(function(platform) {
        if (fs.existsSync(path.join(config.resources_path, platform, 'alloy', 'CFG.js'))) {
          config.platform = (platform === 'iphone') ? 'ios' : platform;
          return true;
        }
      });
    }
    config.last_updated_file = path.join(config.tishadow_build, 'last_updated' + (config.platform ? '_' + config.platform : ''));
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
  config.isTiCaster = env.ticaster;
  if (!env.ticaster) {
    config.host     = env.host || config.host || "localhost";
    config.port     = env.port || config.port || "3000";
    config.room     = env.room || config.room || "default";
  } else {
    config.host     = "www.ticaster.io";
    config.port     = 443;
  }
  config.internalIP = env.internalIp;
  config.isLongPolling = env.longPolling;
  config.isManageVersions = env.manageVersions;
  config.platform = env.platform;
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
};


module.exports = config;

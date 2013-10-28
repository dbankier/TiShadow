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
      var platform_folders = platforms
        .filter(function(platform) {
          return fs.existsSync(path.join(config.resources_path, platform, 'alloy', 'CFG.js'));
        })
      if (platform_folders.length === 1) {
        config.platform = platform_folders[0]
      } else { // alloy >= 1.3 uses platform folders for source code
        config.platform = platform_folders.sort(function(a,b) {
          return fs.statSync(path.join(config.resources_path, b, 'alloy.js')).mtime.getTime()
          - fs.statSync(path.join(config.resources_path, a,'alloy.js')).mtime.getTime()
        })[0];
      }

      // alloy >= 1.3 uses platform folders for source code, i.e "PlatformAlloy"
      config.isPlatformAlloy = fs.existsSync(path.join(config.resources_path, config.platform,'alloy.js'));
      config.platform = config.platform==="iphone" ? "ios": config.platform;
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
  config.screenshot_path = env.screenshotPath || "/tmp";
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

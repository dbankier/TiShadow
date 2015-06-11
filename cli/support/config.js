/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var path = require("path"),
    fs = require("fs"),
    os = require("os"),
    colors = require("colors"),
    logger = require("../../server/logger"),
    _ = require("underscore"),
    base,
    home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
    platforms = ['iphone','android','blackberry','mobileweb','tizen'],
    tiapp = require("tiapp"),
    glob = require("glob"),
    config = {};

//get app name
function getAppName(callback) {
  tiapp.find(process.cwd(),function(err,result) {
    if (err ) {
      if (!config.globalCmd) {
      	
      	if (fs.existsSync(path.join(process.cwd(), 'timodule.xml')) && fs.existsSync(path.join(process.cwd(), 'manifest'))) {
	      var data = fs.readFileSync(path.join(process.cwd(),'manifest'));
	          base = process.cwd();
	          var timod = {};
	          var module_id = /moduleid: (.*)/g;
	          var matches = module_id.exec(data);
	          if (matches) {
	          	timod.name = [matches[1]];
	          	timod.isModule = true;
	          	callback(timod);
	          	return;
	          }
	      
	    } else {
          logger.error("Script must be run within a Titanium project.");
	    }
	    process.exit();
      } else {
        callback(null);
        return;
      }
    }
    base = result.path;
    var local_regex = /<key>CFBundleDevelopmentRegion<\/key>(\s|\n)*<string>(\w*)<\/string>/g
    var matches = local_regex.exec(result.str);
    if (matches) {
      config.locale = matches[2].split("_")[0];
    }
    callback(result.obj['ti:app']);
  });
}

//Default server setting
var config_path = path.join(home,'.tishadow.json');
if (fs.existsSync(config_path)) {
  config = require(config_path);
}

//Config setup
config.buildPaths = function(env, callback) {
  config.init(env);
  getAppName(function(result) {
    if (!result) { // this is for the non-project specific commands
      callback();
      return;
    }
    config.locale     		 = env.locale || config.locale;

    config.base              = base;
    config.alloy_path        = path.join(base, 'app');
    config.resources_path    = path.join(base, 'Resources');
    config.assets_path	     = path.join(base, 'assets');
    config.res_alloy_path    = path.join(base, 'Resources', 'alloy');
    config.fonts_path        = path.join(config.resources_path, 'fonts');
    config.modules_path      = path.join(base, 'modules');
    config.platform_path     = path.join(base, 'platform');
    config.plugins_path      = path.join(base, 'plugins');
    config.spec_path         = path.join(base, 'spec');
    config.i18n_path         = path.join(base, 'i18n');
    config.build_path        = path.join(base, 'build');
    config.sourcemap_path    = path.join(config.build_path, 'map');
    config.tishadow_build    = path.join(config.build_path, 'tishadow');
    config.tishadow_coverage = path.join(config.tishadow_build, 'coverage');
    config.tishadow_src      = path.join(config.tishadow_build, 'src');
    config.tishadow_spec     = path.join(config.tishadow_src, 'spec');
    config.tishadow_dist     = path.join(config.tishadow_build, 'dist');
    config.fs_map_path       = path.join(config.tishadow_build, 'fs_map.json');

    var app_name = config.app_name = result.name[0] || "bundle";
    
    config.isModule = fs.existsSync(config.assets_path) && result.isModule;
    if (config.isModule) {
      config.module_name = app_name;
      config.module_path = path.join(config.tishadow_src, config.module_name);
    }
    
    config.bundle_name       = config.bundle_name || app_name;
    config.bundle_file       = path.join(config.tishadow_dist, config.bundle_name + ".zip");
    config.jshint_path       = fs.existsSync(config.alloy_path) ? config.alloy_path : config.resources_path;
    config.isAlloy = fs.existsSync(config.alloy_path);
    if (!config.platform && config.isAlloy) {
      var deploymentTargets = [];
      result['deployment-targets'][0].target.forEach(function(t) {
        if (t['_'] === 'true') {
          var platform = t['$'].device;
          if (platform === 'ipad' || platform === 'iphone') {
            if (deploymentTargets.indexOf('ios') !== -1) {
              return;
            }
            platform = 'ios';
          }
          deploymentTargets.push(platform);
        }
      });
      config.platform = deploymentTargets;
    }
    config.last_updated_file = path.join(config.tishadow_build, 'last_updated' + (config.platform ? '_' + config.platform.join('_') : ''));
    config.isPatch = env.patch;
    config.isUpdate = (env.update || env.patch)
                    && fs.existsSync(config.tishadow_src)
                    && fs.existsSync(config.last_updated_file);

    callback();
  });
};

config.init = function(env) {
  config.isSpec       = env._name === "spec";
  config.specType     = env.type || config.type  || "jasmine";
  config.runCoverage  = env.coverage;
  config.instrumentedfiles = {}; //stored instrumented files
  
  // commands that go through buildPath/init but done mandate a being in the project path
  config.globalCmd  = _.contains(['clear','close','screenshot','repl'], env._name);
  config.watchInterval = config.watchInterval || 100;
  config.watchDelay    = config.watchDelay || 0;
  if (['jasmine','mocha-chai','mocha-should','jasmine2'].indexOf(config.specType) === -1) {
    logger.error("Invalid test library, please choose from: jasmine, mocha-should or mocha-chai");
    process.exit(-1);
  }
  if(config.networkInterface){
    var ifaces = os.networkInterfaces(),
        ipOfNtworkInterface = _.find(ifaces[config.networkInterface],function(ip){ return ip.family=='IPv4';});
    if (ipOfNtworkInterface) {
    	config.hostOfNetworkInterface = ipOfNtworkInterface.address;
    }
  }
  config.isDeploy   = env._name === "deploy";
  config.inspector   = env.inspector !== undefined ? env.inspector : config.inspector || false;
  config.boost   = env.boost !== undefined ? env.boost : config.boost || false;
  config.isTailing  = env.tailLogs || config.isSpec;
  config.isJUnit    = env.junitXml;
  config.clearSpecFiles = env.clearSpecFiles;
  config.isREPL     = env._name === "repl";
  config.isPipe     = env.pipe;
  config.isBundle   = env._name === "bundle";
  config.isTicommonjs = env.ticommonjs;
  config.includeDotFiles = env.includeDotFiles;
  config.host     = env.host || config.host || config.hostOfNetworkInterface || "localhost";
  config.port     = env.port || config.port || "3000";
  config.room     = env.room || config.room || "default";
  config.screenshot_path = env.screenshotPath || os.tmpdir();
  config.modifyAppId = env.modifyAppId;
  config.internalIP = env.internalIp;
  config.isLongPolling = env.longPolling;
  config.skipAlloyCompile = env.skipAlloyCompile;
  config.skipSourcemapCompile = env.skipSourcemapCompile;
  config.alloyCompileFile = env.alloyCompileFile;
  config.isManageVersions = env.manageVersions;
  config.bundle_name = env.target;
  config.platform = (env.platform && env.platform !== 'all') ? env.platform.split(',') : undefined;
  config.package_version   = require("../../package.json").version;
};

config.write = function(env) {
  var new_config = {};
  if (fs.existsSync(config_path)) {
    new_config = require(config_path);
  }
  ['host','port','room', 'type', 'inspector', 'boost', 'watchInterval', 'watchDelay', 'watchExclude', 'networkInterface'].forEach(function(param) {
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

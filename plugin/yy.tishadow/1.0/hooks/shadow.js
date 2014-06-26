/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var sys = require('sys');
var spawn = require('child_process').spawn;
var os = require('os');
var path = require('path');
var fs = require('fs');
var commands = require('../commands/shadow');
var ipselector = require('ipselector');
var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

exports.cliVersion = '>=3.2.0';
exports.version = '1.0';
exports.title = 'TiShadow Express';
exports.desc  = 'For very basic and quick tishadow usage';
exports.extendedDesc = 'Requires tishadow: `[sudo] npm install -g tishadow`';

exports.init = init;
var logger;
function init(_logger, config, cli) {
  // users who are on the wrong SDK without this being set... TiShadow would just fail to work at all
  cli.config.cli.failOnWrongSDK = true;
  if (process.argv.indexOf('--shadow') !== -1 || process.argv.indexOf('--tishadow') !== -1) {
    cli.addHook('build.pre.compile', preCompileHook(true));
  } else if (process.argv.indexOf('--appify') !== -1) {
    cli.addHook('build.pre.compile', preCompileHook(false));
  }
  logger = _logger;
}
function preCompileHook(isExpress) {
  return function (build, finished) {
    // temp appify build path
    var new_project_dir = path.join(build.projectDir, 'build', 'appify');

    // pass through arguments
    var args = build.cli.argv.$_
               .filter(function(el) { return el !== "--shadow" && el !== "--tishadow" && el !== "--appify"})
               .concat(["--project-dir", new_project_dir]);

    if (build.certDeveloperName) {
      args.push("--developer-name");
      args.push(build.certDeveloperName);
    }

    if (build.provisioningProfileUUID) {
      args.push("--pp-uuid");
      args.push(build.provisioningProfileUUID);
    }

    // appify -> express
    function launch(ip_address){
      commands.startAppify(logger, new_project_dir, build.cli.argv.platform, ip_address, function() {
        if (args.indexOf("-p") === -1 && args.indexOf("--platform") === -1) {
          args.push("-p");
          args.push(build.cli.argv.platform);
        }
        commands.buildApp(logger,args)
        if (isExpress) {
          commands.startServer(logger);
          commands.startWatch(logger, build.cli.argv.platform, ip_address);
        }
      });
    }

    // existing tishadow config?
    var config;
    var config_path = path.join(home,'.tishadow.json');
    if (fs.existsSync(config_path)) {
      config = require(config_path);
    }

    if (config && config.host) {
      launch(config.host);
    } else {
      // get ip address
      var ip_address = ipselector.selectOne({
        family : 'IPv4',
        internal : false,
        networkInterface : config && config.networkInterface? config.networkInterface:undefined
      },function(ip_address) {
        launch(ip_address);
      });
    }
  }
}


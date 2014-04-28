var sys = require('sys');
var spawn = require('child_process').spawn;
var os = require('os');
var path = require('path');
var fs = require('fs');
var commands = require('../commands/shadow');
var ipselector = require('ipselector');

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
    var new_project_dir = path.join(build.projectDir, 'build', 'appify');

    // get ip address
    var ip_address = ipselector.selectOne({
      family : 'IPv4',
      internal : false
    },function(ip_address){
      var args = build.cli.argv.$_
           .filter(function(el) { return el !== "--shadow" && el !== "--tishadow" && el !== "--appify"})
           .concat(["--project-dir", new_project_dir]);
      commands.startAppify(logger, new_project_dir, build.cli.argv.platform, ip_address, function() {
        commands.buildApp(logger,args)
        if (isExpress) {
          commands.startServer(logger);
          commands.startWatch(logger, build.cli.argv.platform, ip_address);
        }
      });
    });
  }
}

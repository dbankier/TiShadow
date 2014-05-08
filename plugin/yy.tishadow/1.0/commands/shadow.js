/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var sys = require('sys');
var spawn = require('../../../../cli/support/spawn');
var os = require('os');
var path = require('path');
var fs = require('fs');


exports.cliVersion = '>=3.2.0';
exports.version = '1.0';
exports.title = 'TiShadow Express';
exports.desc  = 'For very basic and quick tishadow usage';
exports.extendedDesc = 'Requires tishadow: `[sudo] npm install -g tishadow`';

exports.config = function (logger, config, cli) {
  return {
    noAuth: true
  };
};

var children = [];
function exit() {
  children.forEach(function(p) {
    p.kill();
  });
  process.exit(1);
}
exports.startServer = function startServer(logger) {
  logger.info("Starting TiShadow server");
  var server = spawn("ts", ["server"]);
  server.stdout.pipe(process.stdout);
  server.stderr.pipe(process.stderr);
  server.on('exit', function(){
    logger.error("TiShadow Server exited.");
    exit();
  });
  server.on('error',function(err) {
    logger.error(err);
  });
  children.push(server);
}

exports.startAppify = function startAppify(logger, tmp_dir, platform, ip_address, callback) {
  fs.existsSync(tmp_dir) ||  fs.mkdirSync(tmp_dir);
  logger.info("Preparing App...");
  var args = ['appify', '-d', tmp_dir, "-P", platform];
  if (ip_address) {
    args = args.concat(['-o', ip_address]);
  }
  var appify = spawn('ts', args);
  appify.stdout.pipe(process.stdout);
  appify.stderr.pipe(process.stderr);
  appify.on('error',function() {
    logger.error("Appify Failed.");
    exit();
  });
  appify.on('exit',function() {
    if (callback) {
      callback();
    } else {
      exports.buildApp(logger,['build', '--project-dir',tmp_dir, '-p', platform]);
      exports.startWatch(logger, platform);
    }
  });
  children.push(appify);
}

exports.buildApp = function buildApp(logger, args) {
  logger.info("Building App...");
  var build = spawn('ti', args);
  build.stdout.pipe(process.stdout);
  build.stderr.pipe(process.stderr);
  build.on('error', function(err) {
    logger.error(err);
    logger.error("Titanium build exited.");
    exit();
  }); 
  children.push(build);
}

exports.startWatch = function startWatch(logger, platform, ip_address) {
  logger.info("Starting Watch...");
  var args = ['@', 'run', '-u', '-P', platform];
  if (ip_address) {
    args = args.concat(['-o', ip_address]);
  }

  var watch = spawn('ts', args);
  watch.on('exit', function() {
    logger.error("TiShadow watch exited.");
    exit();
  });
  children.push(watch);
  watch.stdout.pipe(process.stdout);
}

exports.run = function(logger, config, cli) {
  var platform = cli.argv.platform || cli.argv.p || 'ios';
  var tmp_dir = path.join(os.tmpDir(), Date.now().toString() + '-' + Math.random().toString().substring(2));

  logger.warn("\n===========\n" +
              "PLEASE NOTE\n" +
              "===========\n\n" +
              "The `shadow` command is limitted, experimental deprecated.\n" +
              "Please use the `--shadow` flag with the titanium build command, e.g:\n\n" +
              "titanium build -p android -T device --shadow\n\n" +
              "Press any key to continue using the old command or ctrl+c to exit");

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding( 'utf8' );
  var touched = false;
  process.stdin.on('data', function(key) {
    if ( key === '\u0003' ) {
      exit();
    } else {
      if (!touched) {
        exports.startServer(logger);
        exports.startAppify(logger, tmp_dir, platform);
      }
    }
    touched = true;
  });
};

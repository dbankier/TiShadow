var sys = require('sys');
var spawn = require('child_process').spawn;
var os = require('os');
var path = require('path');
var fs = require('fs');


exports.cliVersion = '>=3.1';
exports.title = 'TiShadow Basic';
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
function startServer(logger) {
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

function startAppify(logger, platform) {
  var tmp_dir = path.join(os.tmpDir(), Date.now().toString() + '-' + Math.random().toString().substring(2));
  fs.mkdirSync(tmp_dir);
  logger.info("Preparing App...");
  var appify = spawn('ts', ['appify', '-d', tmp_dir]);
  appify.stdout.pipe(process.stdout);
  appify.stderr.pipe(process.stderr);
  appify.on('error',function() {
    logger.error("Appify Failed.");
    exit();
  });
  appify.on('exit',function() {
    buildApp(logger, tmp_dir, platform);
    startWatch(logger, platform);
  });
  children.push(appify);
}

function buildApp(logger, tmp_dir, platform) {
  logger.info("Building App...");
  var build = spawn('ti', ['build', '--project-dir',tmp_dir, '-p', platform]);
  build.stdout.pipe(process.stdout);
  build.stderr.pipe(process.stderr);
  build.on('error', function(err) {
    logger.error(err);
    logger.error("Titanium build exited.");
    exit();
  }); 
  children.push(build);
}

function startWatch(logger, platform) {
  logger.info("Starting Watch...");
  var watch = spawn('ts', ['@', 'run', '-u', '-P', platform]);
  watch.on('exit', function() {
    logger.error("TiShadow watch exited.");
    exit();
  });
  children.push(watch);
  watch.stdout.pipe(process.stdout);
}
exports.run = function(logger, config, cli) {
  var platform = cli.argv.platform || cli.argv.p || 'ios';

  startServer(logger);
  startAppify(logger, platform);
};

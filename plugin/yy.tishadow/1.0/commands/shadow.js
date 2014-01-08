var sys = require('sys')
var exec = require('child_process').exec;
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
  }
};

var children = [];
function exit() {
  children.forEach(function(p) {
    p.kill();
  });
  process.exit(1);
}
exports.run = function(logger, config, cli) {
  var platform = cli.argv.platform || cli.argv.p || 'ios';
  logger.info("Starting TiShadow server");
  var server = exec("ts server", function(err, stdout, stderr){
    logger.error("TiShadow Server exited.")
    exit();
  });
  children.push(server);
  server.stdout.pipe(process.stdout);

  var tmp_dir = path.join(os.tmpDir(), Date.now().toString() + '-' + Math.random().toString().substring(2));
  fs.mkdirSync(tmp_dir);
  logger.info("Preparing App...");
  var appify = exec('ts appify -d "' + tmp_dir + '"', function(err, stdout, stderr) {
    if (stdout.indexOf("ERROR") > -1) {
      console.log(stdout);
      exit();
    }
    logger.info("Building App...");
    var build = exec('ti build --project-dir "' + tmp_dir + '" -p ' + platform, function(err, stdout, stderr) {
      if (err || stderr) {
        console.log(stderr || err);
        logger.error("Titanium build exited.")
        exit();
      }
    }); 
    children.push(build);
    build.stdout.pipe(process.stdout);
    logger.info("Starting Watch...");
    var watch = exec("ts @ run -u -P " + platform, function(err, stdout, stderr){
      logger.error(stdout || stderr || err)
      logger.error("TiShadow watch exited.")
      exit();
    });
    children.push(watch);
    watch.stdout.pipe(process.stdout);

  });
  
}

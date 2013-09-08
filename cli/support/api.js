var config = require("./config"),
    logger = require("../../server/logger"),
    colors = require('colors'),
    repl = require('repl'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    FormData =require('form-data'),
    connected_socket;


// Used to be an http request - now over sockets.
function postToServer(path, data) {
  if (connected_socket) {
    connected_socket.socket.reconnect();
    connected_socket.emit(path,data);
    logger.info(path.toUpperCase() + " sent.");
  } else {
    require("./socket").connect(function(socket) {
      connected_socket = socket;
      socket.emit(path,data);
      if (!config.isTailing){
        socket.disconnect();
      }
      logger.info(path.toUpperCase() + " sent.");
    });
  }
}

// For posting the zip file to a remote TiShadow server (http POST)
function postZipToServer (_path, data) {
  data.room = config.room;
  var form = new FormData();
  form.append('data', JSON.stringify(data));
  form.append('bundle', fs.createReadStream(config.bundle_file));
  logger.info('Uploading...');
  form.submit("http" + (config.isTiCaster ? "s" : "") + "://" + config.host + ":" + config.port + "/" + _path, function(err, response) {
    response.pipe(process.stdout);
  });
}

exports.clearCache = function(env) {
  config.buildPaths(env, function() {
    postToServer("clear");
  });
};

exports.closeApp = function(env) {
  config.buildPaths(env, function() {
    postToServer("close");
  });
};

exports.newBundle = function(file_list) {
  var fn;
  if (config.host === "localhost") {
    fn = postToServer;
  } else {
    fn = postZipToServer;
  }
  fn("bundle", {
    bundle:config.bundle_file,
    deployOnly: config.isDeploy || undefined,
    spec: {run: config.isSpec, junitxml: config.isJUnit},
    locale: config.locale,
    platform: config.platform,
    patch : {run: config.isPatch, files: file_list}
  });
};

exports.sendSnippet = function(env) {
  config.buildPaths(env, function() {
    var socket = require("./socket").connect();
    console.log("TiShadow REPL\n\nlaunchApp(appName), closeApp(), runSpec() and clearCache() methods available.\nrequire(), Ti.include() and assests are relative the running app.\n\n".grey);
    repl.start({
      eval: function(command, context, filename, callback) {
        if (command.trim() !== "(\n)") {
          socket.emit('snippet',{code: command.substring(1,command.length -2)}, function(e) {
            callback("".blue);
          });
        }
      }
    });
  });
};

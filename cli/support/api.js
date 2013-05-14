var config = require("./config"),
    logger = require("../../server/logger"),
    colors = require('colors'),
    repl = require('repl'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    rest = require('restler');

// Used to be an http request - now over sockets.
function postToServer(path, data) {
  require("./socket").connect(function(socket) {
    socket.emit(path,data);
    if (!config.isTailing) {
      socket.disconnect();
    }
    logger.info(path.toUpperCase() + " sent.");
  });
}

// For posting the zip file to a remote TiShadow server (http POST)
function postZipToServer (_path, data) {
  data.room = config.room;
  var r = rest.post("http://" + config.host + ":" + config.port + "/" + _path, {
    multipart:true,
    data: {
      data: JSON.stringify(data),
      bundle: rest.file(config.bundle_file, null, fs.statSync(config.bundle_file).size)
    }
  }).on("complete", function(o) {
    console.log(JSON.stringify(o));
  })
}

exports.clearCache = function(env) {
  config.init(env);
  postToServer("clear");
};

exports.newBundle = function(file_list) {
  var fn;
  if (config.host === "localhost") {
    fn = postToServer;
  } else {
    fn = postZipToServer;
  }
  fn("bundle", {bundle:config.bundle_file, spec: {run: config.isSpec, junitxml: config.isJUnit}, locale: config.locale, patch : {run: config.isPatch, files: file_list}});
};

exports.sendSnippet = function(env) {
  config.init(env);
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
};

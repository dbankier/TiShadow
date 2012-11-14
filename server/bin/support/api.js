var config = require("./config"),
    logger = require("../../logger"),
    colors = require('colors'),
    repl = require('repl');

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

exports.clearCache = function() {
  postToServer("clear");
};

exports.newBundle = function(data) {
  postToServer("bundle", {bundle:config.bundle_file, spec: {run: config.isSpec, junitxml: config.isJUnit}, locale: config.locale});
};

exports.sendSnippet = function(code) {
  if (code) {
    postToServer("snippet", { code: code});
  } else {
    var socket = require("./socket").connect();
    repl.start({
      eval: function(command, context, filename, callback) {
        if (command.trim() != "(\n)") {
          socket.emit('snippet',{code: command.substring(1,command.length -2)}, function(e) {
            callback("".blue);
          });
        }
      }
    });
  }
};

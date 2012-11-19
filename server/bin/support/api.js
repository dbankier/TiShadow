var config = require("./config"),
    logger = require("../../logger"),
    colors = require('colors'),
    repl = require('repl'),
    http = require('http'),
    path = require('path'),
    fs = require('fs');

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
  var post_options = {
    host: config.host,
    port: config.port,
    path: '/' + _path,
    method: 'POST'
  };
  // Send the room
  data.room = config.room;
  var request = http.request(post_options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('Response: ' + chunk);
    });
  }); 
  var boundaryKey = Math.random().toString(16); // random string
  request.setHeader('Content-Type', 'multipart/form-data; boundary="'+boundaryKey+'"');
  request.write(
    '--' + boundaryKey + '\r\n'
    + 'Content-Type: application/json\r\n' 
    + 'Content-Disposition: form-data; name="data"\r\n\r\n'
    + JSON.stringify(data)+ "\r\n"
    + '--' + boundaryKey + '\r\n'
    + 'Content-Type: application/zip\r\n' 
    + 'Content-Disposition: form-data; name="bundle"; filename="' + path.basename(config.bundle_file) + '"\r\n'
    + 'Content-Transfer-Encoding: binary\r\n\r\n' 
  );
  var stream = fs.createReadStream(config.bundle_file, { bufferSize: 4 * 1024 })
  .on('end', function() {
    request.end('\r\n--' + boundaryKey + '--'); 
  }).pipe(request, { end: false });
}

exports.clearCache = function(env) {
  config.init(env);
  postToServer("clear");
};

exports.newBundle = function(data) {
  var fn;
  if (config.host === "localhost") {
    fn = postToServer;
  } else {
    fn = postZipToServer;
  }
  fn("bundle", {bundle:config.bundle_file, spec: {run: config.isSpec, junitxml: config.isJUnit}, locale: config.locale});
};

exports.sendSnippet = function(env) {
  config.init(env);
  var socket = require("./socket").connect();
  console.log("TiShadow REPL\n\nlaunchApp(appName), closeApp() and clearCache() methods available.\nrequire(), Ti.include() and assests are relative the running app.\n\n".grey);
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

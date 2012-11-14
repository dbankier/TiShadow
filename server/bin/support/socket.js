var logger = require("../../logger"),
    io     = require("socket.io-client"),
    config = require("./config");


exports.connect = function(onconnect) {
  var socket = io.connect("http://localhost:3000");
  socket.on('connect', function(data) {
    socket.emit("join", {name: 'controller'});
    if (onconnect && typeof onconnect === 'function') {
      onconnect(socket);
    }
  });
  socket.on('device_connect', function(e){
    logger.log("INFO", e.name, "Connected");
  });
  socket.on('device_disconnect', function(e){
    logger.log("WARN", e.name,"Disconnected");
  });
  socket.on('device_log', function(data) {
    if (config.isSpec && data.message.match("Runner Finished$")) {
      socket.disconnect();
    }
    logger.log(data.level, data.name, data.message);
  });
  socket.on('connect_failed', function(data) {
    logger.error("connect_failed: " + data);
  });
  return socket;
};


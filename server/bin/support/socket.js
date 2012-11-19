var logger = require("../../logger"),
    io     = require("socket.io-client"),
    config = require("./config"),
    fs     = require("fs"),
    path   = require("path");


exports.connect = function(onconnect) {
  var socket = io.connect("http://" + config.host + ":" + config.port);
  socket.on('connect', function(data) {
    socket.emit("join", {name: 'controller', room: config.room});
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
    } else if (config.isJUnit && data.level === "TEST") {
      var target_file = path.join(config.tishadow_build, data.name.replace(/(, |\.)/g, "_") + "_result.xml");
      fs.writeFileSync(target_file,data.message);
      socket.disconnect();
      logger.info("Report Generated: " + target_file);
    } else if (!config.isJUnit) {
      logger.log(data.level, data.name, data.message);
    }
  });
  socket.on('connect_failed', function(data) {
    logger.error("connect_failed: " + data);
  });
  return socket;
};


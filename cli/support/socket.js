/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var logger = require("../../server/logger"),
    io     = require("socket.io-client"),
    config = require("./config"),
    fs     = require("fs"),
    path   = require("path");


exports.connect = function(onconnect) {
var running = 0;
  var socket = io.connect("http"+ (config.isTiCaster ? "s" : "") + "://" + config.host + ":" + config.port);
  socket.on('connect', function(data) {
	  
    socket.emit("join", {name: 'controller', room: config.room});
    if (onconnect && typeof onconnect === 'function') {
      onconnect(socket);
    }
  });
  socket.on('device_connect', function(e){
	  running++;
	  logger.log("INFO", e.name, "Connected");
  });
  socket.on('device_disconnect', function(e){
    running = running--;
    logger.log("WARN", e.name,"Disconnected");
  });
  socket.on('device_log', function(data) {
    if (data.message.match("Runner Finished$")) {
    	running--;
    	if (running <= 0) {
    		running = 0;
    		socket.disconnect();
    	}
    } else if(config.isJUnit && data.level === "TEST"){
    	var file_name = data.message.substring(0, data.message.indexOf(' '));
    	var content = data.message.substring(data.message.indexOf(' ')+1);
    	var target_file = path.join(config.tishadow_build, data.name.replace(/(, |\.)/g, "_") + "_" + file_name + "_" + Math.random().toString(36).substring(7) +  "_result.xml");
    	fs.writeFileSync(target_file,content);
    	logger.info("Report Generated: " + target_file);
    } else {
    	logger.log(data.level, data.name, data.message);
    }
  });
  socket.on('connect_failed', function(data) {
    logger.error("connect_failed: " + data);
  });
  return socket;
};


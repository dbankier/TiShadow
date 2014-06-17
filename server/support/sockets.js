/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var io = require('socket.io'),
    Logger = require('../logger'),
    rooms = require('./rooms'),
    path = require('path'),
    fs = require('fs'),
    uglify = require('../../cli/support/uglify'),
    config = require('../../cli/support/config');

var sio;

exports.listen = function(app) {
  //Setup socket
  sio=io.listen(app, {log: false});

  //force long-polling? e.g. heroku
  if(config.isLongPolling) {
    Logger.debug("Forced long polling.");
    sio.configure(function() {
      sio.set("transports",["xhr-polling"]);
      sio.set("polling duration", 10);
    });
  }

  //WEB SOCKET STUFF
  sio.sockets.on('connection', function(socket) {
    Logger.debug('A socket connected');
    // Join
    socket.on('join', function(e) {
      // Private Room (?)
      var room = e.room || "default";
      socket.join(room);
      socket.set('room', room);

      if (e.name === "controller") {
        socket.set('host', true, function() {Logger.log("INFO", "CONTROLLER", "Connected")});
        if (rooms.get(room).devices) {
          for (var uuid in rooms.get(room).devices) {
            socket.emit("device_connect", {name: rooms.get(room).devices[uuid].name, id:uuid}); 
          };
        }
      } else{
        if (e.app_version !== config.package_version) {
          Logger.log("WARN", e.name, "App-Server version mismatch");
          Logger.log("WARN", e.name, "  server : " + config.package_version);
          Logger.log("WARN", e.name, "  app    : " + e.app_version);
          Logger.log("WARN", e.name, "Please consider upgrading the container app:");
          Logger.log("WARN", e.name, "  ts app --upgrade -d [path-to-app]");
        }
        socket.set('uuid', e.uuid);
        socket.set('host', false, function() {Logger.log("INFO", e.name, "Connected")});
        e.id = e.uuid;
        sio.sockets.in(room).emit("device_connect", e);
        rooms.addDevice(room, e.uuid, e);
        if (config.isManageVersions && rooms.get(room).version && e.version !== rooms.get(room).version){
          socket.emit("bundle",{name: rooms.get(room).name, version: rooms.get(room).version});
        }
      }

    });

    // Host only commands
    // message event - for code snippets
    ['snippet','clear','bundle','close', 'screenshot'].forEach(function(command) {
      socket.on(command, function(data,fn) {
        socket.get("host", function (err,host){
          socket.get("room", function(err, room) {
            if (host && room){
              if(command === 'bundle') {
                data.name = path.basename(data.bundle).replace(".zip","");
                Logger.log("INFO", null, "New Bundle: " + data.bundle + " | " + data.name);
                rooms.addBundle(room, data.name, data.bundle);
                var curr = rooms.get(room);
                data.bundle = null;
                if (config.isManageVersions) {
                  data.version = curr.version;
                }
                if (!data.deployOnly) {
                  sio.sockets.in(room).emit(command, data);
                }
              } else  {
                Logger.info(command.toUpperCase() + " requested");
                if (command === 'screenshot') {
                  config.screencast = data.screencast;
                }
                try {
                  if (command === 'snippet' && data.code) {
                    data.code = uglify.toString(data.code);
                  }
                  sio.sockets.in(room).emit(command === "snippet" ? "message" : command, data);
                } catch(e) {
                  sio.sockets.in(room).emit("device_log", {level: 'ERROR', message: (e.message + " (" + e.line + ":" + e.col + ")")});
                }
              }
              if (fn) {
                fn();
              }
            }
          })
        });
      });
    });

    ['log', 'screenshot_taken'].forEach(function(command) {
      socket.on(command, function(data) {
        socket.get("uuid", function(err, uuid) {
          socket.get("room", function(err, room) {
            if (uuid && room) {
              var curr = rooms.getDevice(room, uuid); 
              if (curr) {
                if (command === "log") {
                  data.level = data.level || '';
                  data.name = curr.name;
                  data.message = data.message || '';
                  Logger.log(data.level, data.name, data.message);
                  sio.sockets.in(room).emit("device_log", data);
                } else {
                  if (config.screencast) {
                    data.name = curr.name;
                    sio.sockets.in(room).emit("screenshot_display", data);
                  } else {
                    var img = path.join(config.screenshot_path, curr.name.replace(/[ ,]+/g, "_") + "_" + (new Date()).getTime() + ".png");
                    fs.writeFileSync(img, data.image, 'base64');
                    Logger.log("INFO", curr.name, "screenshot taken: " + img);
                  }
                }
              }
            }
          });
        });
      });
    });
    // Disconnect
    socket.on('disconnect',function(data) {
      socket.get("host",function(err,host) {
        if (host) {
          //sio.sockets.emit('disconnect');
        } else {
          socket.get("uuid", function(err,uuid) {
            socket.get("room", function(err, room) {
              var curr = rooms.getDevice(room, uuid); 
              if (curr) {
                Logger.log("WARN", curr.name,"Disconnected");
                sio.sockets.in(room).emit("device_disconnect", {name: curr.name, id:uuid});
              }
              rooms.removeDevice(room, uuid);
            });
          });
        }
      });
    });
  });
};

exports.emit=function(room, message, data) {
  sio.sockets.in(room).emit(message, data);
};

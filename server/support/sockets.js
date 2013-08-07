var io = require('socket.io'),
    Logger = require('../logger'),
    rooms = require('./rooms'),
    path = require('path'),
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
    ['snippet','clear','bundle','close'].forEach(function(command) {
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
              } else  {
                Logger.info(command.toUpperCase() + " requested");
              }
              sio.sockets.in(room).emit(command === "snippet" ? "message" : command, data);
              if (fn) {
                fn();
              }
            }
          })
        });
      });
    });

    socket.on('log', function(data) {
      socket.get("uuid", function(err, uuid) {
        socket.get("room", function(err, room) {
          if (uuid && room) {
            var curr = rooms.getDevice(room, uuid); 
            data.level = data.level || '';
            data.name = curr.name;
            data.message = data.message || '';
            Logger.log(data.level, data.name, data.message);
            sio.sockets.in(room).emit("device_log", data);
          }
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

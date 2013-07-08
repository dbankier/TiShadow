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
        Logger.debug(JSON.stringify(rooms.get(room)));
        if (rooms.get(room).devices) {
          rooms.get(room).devices.forEach(function(d) {
            socket.emit("device_connect", {name: d, id: new Buffer(d).toString('base64')});
          });
        }
      } else{
        socket.set('name', e.name);
        socket.set('host', false, function() {Logger.log("INFO", e.name, "Connected")});
        e.id = new Buffer(e.name).toString('base64');
        sio.sockets.in(room).emit("device_connect", e);
        rooms.addDevice(room, e.name);
        if (config.isManageVersions && rooms.get(room).version && e.version !== rooms.get(room).version){
          socket.emit("bundle",{name: rooms.get(room).name});
        }
      }

    });

    // Host only commands
    // message event - for code snippets
    ['snippet','clear','bundle'].forEach(function(command) {
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
      socket.get("name", function(err, name) {
        socket.get("room", function(err, room) {
          if (name && room) {
            data.level = data.level || '';
            data.name = name;
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
          socket.get("name", function(err, name) {
            socket.get("room", function(err, room) {
              Logger.log("WARN", name,"Disconnected");
              sio.sockets.in(room).emit("device_disconnect", {name: name, id: new Buffer(name).toString('base64')});
              rooms.removeDevice(room, name);
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


/**
 * Module dependencies.
*/

var express = require('express'),
    io = require('socket.io'),
    routes = require('./routes'),
    fs = require('fs'),
    path = require('path'),
    Logger = require('./logger'),
    config = require('./bin/support/config');


var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.limit('150mb'));
});
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});
app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// allow for server-side port override (useful for PaaS)
config.port = process.env.PORT || config.port;

//Setup socket
var sio=io.listen(app, {log: false});

//force long-polling? e.g. heroku
if(config.isLongPolling) {
  Logger.debug("Forced long polling.");
  sio.configure(function() {
    sio.set("transports",["xhr-polling"]);
    sio.set("polling duration", 10);
  });
}

// HTTP Routes
app.get('/', routes.index);

// Bundles handled by GET/POST instead of socket connections.
var bundle={};
app.get('/bundle/:room', function(req,res) {
  Logger.debug("Bundle requested." );
  res.setHeader('Content-disposition', 'attachment; filename=bundle.zip');
  res.setHeader('Content-type', "application/zip");

  var filestream = fs.createReadStream(bundle[req.params.room]);
  filestream.on('data', function(chunk) {
    res.write(chunk);
  });
  filestream.on('end', function() {
    res.end();
  });
  filestream.on('error', function(exception) {
      Logger.error(exception);
  });
});

// For remote bundle posting.
app.post('/bundle', function(req, res) {
  Logger.log("WARN", null, "Remote Bundle Received");
  var data = JSON.parse(req.body.data);
  var name = req.files.bundle.name.replace(".zip","");

  bundle[data.room] = req.files.bundle.path;
  Logger.log("INFO", null, "New Bundle: " + bundle[data.room] + " | " + name);

  data.name = name;
  data.room = data.bundle = null;
  sio.sockets.emit("bundle", data);
  res.send("OK", 200);
});

//FIRE IT UP
app.listen(config.port);
Logger.debug("TiShadow server started. Go to http://"+ config.host + ":" + config.port);


//WEB SOCKET STUFF
var devices = {};
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
      if (devices[room]) {
        devices[room].forEach(function(d) {
          sio.sockets.in(room).emit("device_connect", {name: d, id: new Buffer(d).toString('base64')});
        });
      }
    } else{
      socket.set('name', e.name);
      socket.set('host', false, function() {Logger.log("INFO", e.name, "Connected")});
      e.id = new Buffer(e.name).toString('base64');
      sio.sockets.in(room).emit("device_connect", e);
      if (devices[room]) {
        devices[room].push(e.name);
      } else {
        devices[room] = [e.name];
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
              bundle[room] = data.bundle;
              data.bundle = null;
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
          data.name = name;
          Logger.log(data.level, data.name, data.message);
          sio.sockets.in(room).emit("device_log", data);
        }
      })
    });
  })
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
            devices[room].splice(devices[room].indexOf(name),1);
          });
        });
      }
    });
  });

});

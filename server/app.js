
/**
 * Module dependencies.
*/

var express = require('express'),
    io = require('socket.io'),
    routes = require('./routes'),
    fs = require('fs'),
    path = require('path'),
    Logger = require('./logger');


var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});
app.configure('production', function(){
  app.use(express.errorHandler()); 
});

//Setup socket
var sio=io.listen(app, {log: false});


// Routes
app.get('/', routes.index);
var bundle;
app.get('/bundle', function(req,res) {
  Logger.debug("Bundle requested." );
  res.setHeader('Content-disposition', 'attachment; filename=bundle.zip');
  res.setHeader('Content-type', "application/zip");

  var filestream = fs.createReadStream(bundle);
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


//FIRE IT UP
app.listen(3000);
Logger.debug("TiShadow server started. Go to http://localhost:3000");

//WEB SOCKET STUFF

var devices = [];
sio.sockets.on('connection', function(socket) {
  Logger.debug('A socket connected');
  // Join
  socket.on('join', function(e) {
    if (e.name === "controller") {
      socket.set('host', true, function() {Logger.log("INFO", "CONTROLLER", "Connected")});
      devices.forEach(function(d) {
        sio.sockets.emit("device_connect", {name: d, id: new Buffer(d).toString('base64')});
      });
    } else{
      socket.set('name', e.name);
      socket.set('host', false, function() {Logger.log("INFO", e.name, "Connected")});
      e.id = new Buffer(e.name).toString('base64');
      sio.sockets.emit("device_connect", e);
      devices.push(e.name);
    }
  });

  // Host only commands
  // message event - for code snippets
  ['snippet','clear','bundle'].forEach(function(command) {
    socket.on(command, function(data,fn) {
      socket.get("host", function (err,host){
        if (host){
          if(command === 'bundle') {
            data.name = path.basename(data.bundle).replace(".zip","");
            Logger.log("INFO", null, "New Bundle: " + data.bundle + " | " + data.name);
            bundle = data.bundle;
            data.bundle = null;
          } else  {
            Logger.info(command.toUpperCase() + " requested");
          }
          sio.sockets.emit(command === "snippet" ? "message" : command, data);
          if (fn) {
            fn();
          }
        }
      });
    });
  });

  socket.on('log', function(data) {
    socket.get("name", function(err, name) {
      data.name = name;
      Logger.log(data.level, data.name, data.message);
      sio.sockets.emit("device_log", data);
    });
  })
  // Disconnect
  socket.on('disconnect',function(data) {
    socket.get("host",function(err,host) {
      if (host) {
        //sio.sockets.emit('disconnect');
      } else {
        socket.get("name", function(err, name) {
          Logger.log("WARN", name,"Disconnected");
          sio.sockets.emit("device_disconnect", {name: name, id: new Buffer(name).toString('base64')});
          devices.splice(devices.indexOf(name),1);
        });
      }
    });
  });

});

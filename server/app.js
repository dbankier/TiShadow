
/**
 * Module dependencies.
*/

var express = require('express'),
io = require('socket.io'),
routes = require('./routes'),
fs = require('fs'),
path = require('path')
;


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
app.post('/', function(req, res) {
  console.log("New Bundle: " + req.body.bundle);
  bundle = req.body.bundle;
  sio.sockets.emit("bundle");
  res.send("OK", 200);
});
app.get('/bundle', function(req,res) {
  console.log(bundle);
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
      console.log("[ERROR] " + exception);
  });
});


//FIRE IT UP
app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

//WEB SOCKET STUFF

var devices = [];
sio.sockets.on('connection', function(socket) {
  console.log('A socket connected!');
  // Join
  socket.on('join', function(e) {
    if (e.name === "controller") {
      socket.set('host', true, function() {console.log("CONTROLLER IS HERE")});
      devices.forEach(function(d) {
        sio.sockets.emit("device_connect", {name: d, id: new Buffer(d).toString('base64')});
      });
    } else{
      socket.set('name', e.name);
      socket.set('host', false, function() {console.log(e.name + " ARRIVED")});
      e.id = new Buffer(e.name).toString('base64');
      sio.sockets.emit("device_connect", e);
      devices.push(e.name);
    }
  });
  // generate event
  socket.on('generate', function(data) {
    socket.get("host", function (err,host){
      if (host){
        sio.sockets.emit("message", data);
      }
    });
  });

  socket.on('log', function(data) {
    socket.get("name", function(err, name) {
      data.name = name;
      sio.sockets.emit("device_log", data);
    });
  })
  // Disconnect
  socket.on('disconnect',function(data) {
    socket.get("host",function(err,host) {
      if (host) {
        sio.sockets.emit('disconnect');
      } else {
        socket.get("name", function(err, name) {
          console.log(name + " Disconnected");
          sio.sockets.emit("device_disconnect", {name: name, id: new Buffer(name).toString('base64')});
          devices.splice(devices.indexOf(name),1);
        });
      }
    });
  });

});


/**
 * Module dependencies.
*/

var express = require('express'),
io = require('socket.io'),
routes = require('./routes');


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

// Routes
app.get('/', routes.index);

//FIRE IT UP
app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

//WEB SOCKET STUFF

var devices = [];
var sio=io.listen(app);
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

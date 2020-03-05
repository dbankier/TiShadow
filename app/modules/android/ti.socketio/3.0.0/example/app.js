var io = require('ti.socketio');
var socket = io.connect('http://localhost:8080/', { /* Options */ });

var win = Ti.UI.createWindow({
  backgroundColor: 'white'
});

var label = Ti.UI.createLabel({ text: 'Connecting ...' });
win.add(label);
win.open();

socket.on('connect', function() {
  label.text = 'Socket connected';
  socket.emit('hello', 'world');
});

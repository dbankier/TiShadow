// Handling rooms in memory

var rooms = {};

exports.addBundle = function(room, name, bundle) {
  rooms[room] = rooms[room] || {};
  rooms[room].bundle = bundle;
  rooms[room].name = name;
  rooms[room].version = (new Date()).getTime();
};

exports.addDevice = function(room, device) {
  rooms[room] = rooms[room] || {};
  rooms[room].devices = rooms[room].devices || [];
  rooms[room].devices.push(device);
};

exports.removeDevice = function(room, device) {
  rooms[room].devices.splice(rooms[room].devices.indexOf(device),1);
};

exports.get = function(room) {
  return rooms[room] || {};
};

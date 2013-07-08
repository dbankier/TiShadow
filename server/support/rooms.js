// Handling rooms in memory

var rooms = {};

exports.addBundle = function(room, name, bundle) {
  rooms[room] = rooms[room] || {};
  rooms[room].bundle = bundle;
  rooms[room].name = name;
  rooms[room].version = (new Date()).getTime();
};

exports.addDevice = function(room, uuid, o) {
  rooms[room] = rooms[room] || {};
  rooms[room].devices = rooms[room].devices || {};
  rooms[room].devices[uuid] = o;
};

exports.removeDevice = function(room, uuid) {
  delete rooms[room].devices[uuid];
};

exports.getDevice = function(room, uuid) {
  return rooms[room].devices[uuid];
}

exports.get = function(room) {
  return rooms[room] || {};
};

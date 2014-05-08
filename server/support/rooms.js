/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

// Handling rooms in memory

var rooms = {};

function safeCheck(room) {
  rooms[room] = rooms[room] || {};
  rooms[room].devices = rooms[room].devices || {};
}

exports.addBundle = function(room, name, bundle) {
  safeCheck(room);
  rooms[room].bundle = bundle;
  rooms[room].name = name;
  rooms[room].version = (new Date()).getTime().toString();
};

exports.addDevice = function(room, uuid, o) {
  safeCheck(room);
  rooms[room].devices[uuid] = o;
};

exports.removeDevice = function(room, uuid) {
  delete rooms[room].devices[uuid];
};

exports.getDevice = function(room, uuid) {
  safeCheck(room);
  return rooms[room].devices[uuid];
};

exports.get = function(room) {
  return rooms[room] || {};
};

/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var fs = require('fs'),
    path = require('path'),
    Logger = require('../logger'),
    sockets = require('../support/sockets'),
    rooms = require('../support/rooms'),
    config = require('../../cli/support/config');


/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'TiShadow' });
};
exports.screencast = function(req, res){
  res.render('screencast', { title: 'TiShadow' });
};


// Bundles handled by GET/POST instead of socket connections.
exports.getBundle = function(req,res) {
  Logger.debug("Bundle requested." );
  res.setHeader('Content-disposition', 'attachment; filename=bundle.zip');
  res.setHeader('Content-type', "application/zip");

  var filestream = fs.createReadStream(rooms.get(req.params.room).bundle);
  filestream.on('data', function(chunk) {
    res.write(chunk);
  });
  filestream.on('end', function() {
    res.end();
  });
  filestream.on('error', function(exception) {
      Logger.error(exception);
  });
};

// For remote bundle posting.
exports.postBundle = function(req, res) {
  Logger.log("WARN", null, "Remote Bundle Received");
  var data = JSON.parse(req.body.data),
      name = req.files.bundle.name.replace(".zip",""),
      room = data.room;
  rooms.addBundle(room, name, req.files.bundle.path);
  var curr = rooms.get(room);
  Logger.log("INFO", null, "New Bundle: " + curr.bundle + " | " + name);

  data.name = name;
  data.room = data.bundle = null;
  if (config.isManageVersions) {
    data.version = curr.version;
  }
  if (!data.deployOnly) {
    sockets.emit(room, "bundle", data);
  }
  res.send("OK", 200);
};



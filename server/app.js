/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var app = express();
var _ = require('underscore');
var os = require('os');
var routes = require('./routes');
var sockets = require('./support/sockets');
var Logger = require('./logger');
var config = require('../cli/support/config');
var bodyParser = require('body-parser');

var server = (module.exports = http.createServer(app));

// Configuration
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser({ limit: '150mb' }));

// if executed from package.json - "main":"app.js"
if (config.port === undefined) {
  config.init({
    port: process.env.PORT,
    longPolling: true,
    manageVersions: true
  });
}

// HTTP Routes
app.get('/', routes.index);
app.get('/api', routes.api);
app.get('/screencast', routes.screencast);
app.get('/bundle/:room/:uuid?', routes.getBundle);
app.post('/bundle', routes.postBundle);

//FIRE IT UP
sockets.listen(server);
server.listen(config.port, config.internalIP);

//test if server is up
function isUp() {
  if (server.address() != null) {
    var address = server.address().address;
    var port = server.address().port;
    if (address === '0.0.0.0') {
      address = 'localhost';
    }
    Logger.debug(
      'TiShadow server started. Go to http://' + address + ':' + port
    );
    if (config.host !== 'localhost') {
      Logger.debug('connect to ' + config.host + ':' + port);
    } else {
      _.each(os.networkInterfaces(), function(iface, dev_name) {
        iface.forEach(function(i) {
          if (i.family === 'IPv4' && !i.internal) {
            Logger.debug('connect to ' + i.address + ':' + port);
          }
        });
      });
    }
  } else {
    Logger.error('Failed to start server on port: ' + config.port);
  }
}
// we need a delay when binding to internal ip/host
if (config.internalIP) {
  setTimeout(isUp, 1000);
} else {
  isUp();
}

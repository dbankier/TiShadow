/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */


/**
 * Module dependencies.
*/

var express = require('express'),
    http = require("http"),
    app = express(),
    routes = require('./routes'),
    sockets = require('./support/sockets'),
    Logger = require('./logger'),
    config = require('../cli/support/config');

var server = module.exports = http.createServer(app);

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
app.get('/screencast', routes.screencast);
app.get('/bundle/:room/:uuid?', routes.getBundle);
app.post('/bundle', routes.postBundle);

//FIRE IT UP
sockets.listen(server);
server.listen(config.port, config.internalIP);

//test if server is up
function isUp() {
  if (server.address() != null) {
      Logger.debug("TiShadow server started. Go to http://"+ config.host + ":" + config.port);
  } else {
      Logger.error("Failed to start server on port: " + config.port );
  }
}
// we need a delay when binding to internal ip/host
if (config.internalIP) {
  setTimeout(isUp, 1000);
} else {
  isUp();
}

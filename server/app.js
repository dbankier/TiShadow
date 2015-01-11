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
app.get('/api', routes.api);
app.get('/screencast', routes.screencast);
app.get('/bundle/:room/:uuid?', routes.getBundle);
app.post('/bundle', routes.postBundle);

//FIRE IT UP
sockets.listen(server);
server.listen(config.port, config.internalIP);

function getIPAddress() {
  var interfaces = require('os').networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];

    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
        return alias.address;
    }
  }
  return '0.0.0.0';
}


//test if server is up
function isUp() {
  if (server.address() != null) {
    var address = server.address().address;
    var internalIP = getIPAddress();
    if (address === "0.0.0.0") {
      address = "localhost";
    }
    Logger.debug("TiShadow server started. Go to http://"+ address + ":" + server.address().port);
    Logger.debug("Connect TiShadow app to "+ internalIP);
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

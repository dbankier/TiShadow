
/**
 * Module dependencies.
*/

var express = require('express'),
    routes = require('./routes'),
    sockets = require('./support/sockets'),
    Logger = require('./logger'),
    config = require('../cli/support/config');

var app = module.exports = express.createServer();

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
    longPolling: true
  });
}

// HTTP Routes
app.get('/', routes.index);
app.get('/bundle/:room', routes.getBundle);
app.post('/bundle', routes.postBundle);

//FIRE IT UP
sockets.listen(app);
app.listen(config.port);
if (app.address() != null) {
    Logger.debug("TiShadow server started. Go to http://"+ config.host + ":" + config.port);
} else {
    Logger.error("Failed to start server on port: " + config.port );
}

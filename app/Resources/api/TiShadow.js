var log = require('/api/Log');
var utils = require('/api/Utils');
var zipfile = Ti.Platform.osname === "android" ? require("com.yydigital.zip"): require("zipfile");
var p = require('/api/PlatformRequire');
var assert = require('/api/Assert');
var Spec = require("/api/Spec");
var io = require('/lib/socket.io');
var Beach = require('/api/Beach');

exports.currentApp;
var socket;
exports.connect = function(o) {
  if (socket) {
    exports.disconnect();
  }
  socket = io.connect("http://" + o.host + ":3000");

  socket.on("connect", function() {
    socket.emit("join", {
      name : o.name
    });
    if(o.callback) {
      o.callback();
    }
  });

  socket.on("connect_failed", function() {
    if(o.onerror) {
      o.onerror();
    }
  });

  socket.on('message', function(message) {
    try {
      var ret = eval.call(Beach, message.code);
      log.repl(ret);
    } catch (e) {
      var ret = utils.extractExceptionData(e)
      log.error(ret);
    }
  });

  socket.on('bundle', function(o) {
    if(o.locale) {
      require("/api/Localisation").locale = o.locale;
    }
    loadRemoteZip(o.name, "http://" + Ti.App.Properties.getString("address") + ":3000/bundle", o.spec);
  });

  socket.on('clear', function() {
    try {
      var files = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory).getDirectoryListing();
      files.forEach(function(file_name) {
        var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,file_name);
        if (Ti.Platform.osname === "android") {
          if (file.isFile()) {
            file.deleteFile();
          } else if (file.isDirectory()) {
            file.deleteDirectory(true);
          }
        } else {
          file.deleteFile();
          file.deleteDirectory(true);
        }
      });
      Ti.App.fireEvent("tishadow:refresh_list");
    } catch (e) {
      log.error(utils.extractExceptionData(e));
    }
    log.info("Cache cleared");
  });

  socket.on('disconnect', function() {
    if(o.disconnected) {
      o.disconnected();
    }
  });

};

exports.emitLog = function(e) {
  if (socket) {
    socket.emit("log", e);
  }
};

exports.disconnect = function() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};




var bundle;
exports.launchApp = function(name) {
  try {
    if (bundle && bundle.close !== undefined) {
      bundle.close();
      log.info("Previous bundle closed.");
    }
    p.clearCache();
    require("/api/Localisation").clear();
    Ti.App.fireEvent("tishadow:refresh_list");
    exports.currentApp = name;
    bundle = p.require("/app");
    log.info(exports.currentApp.replace(/_/g," ") + " launched.");
  } catch(e) {
    log.error(utils.extractExceptionData(e));
  }
};

function loadRemoteZip(name, url, spec) {
  var xhr = Ti.Network.createHTTPClient();
  xhr.setTimeout(1000);
  xhr.onload=function(e) {
    try {
      log.info("Unpacking new bundle: " + name);

      var path_name = name.replace(/ /g,"_");
      // SAVE ZIP
      var zip_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, name + '.zip');
      zip_file.write(this.responseData);
      // Prepare path
      var target = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, path_name);
      if (!target.exists()) {
        target.createDirectory();
      }
      // Extract
      var dataDir = Ti.Platform.osname === "android" ?  Ti.Filesystem.applicationDataDirectory :  Ti.Filesystem.applicationDataDirectory.slice(0,Ti.Filesystem.applicationDataDirectory.length - 1).replace('file://localhost','').replace(/%20/g,' ');
      zipfile.extract(dataDir+'/' + name + '.zip', dataDir + "/" + path_name);
      // Launch
      if (spec) {
        exports.currentApp = path_name;
        Spec.run(path_name);
      } else {
        exports.launchApp(path_name);
      }
    } catch (e) {
      log.error(utils.extractExceptionData(e));
    }
  };
  xhr.onerror = function(e){
    Ti.UI.createAlertDialog({title:'XHR', message:'Error: ' + e.error}).show();
  };
  xhr.open('GET', url);
  xhr.send();
}



// FOR URL SCHEME - tishadow://
function loadRemoteBundle(url) {
  if (url.indexOf(".zip") === -1) {
    alert("Invalid Bundle");
  } else {
    var name_parts = url.split("/");
    var name = name_parts[name_parts.length -1].replace(".zip","");
    loadRemoteZip(name, url);
  }
}

var url = '';
if (Ti.Platform.osname !== "android") {
  var cmd = Ti.App.getArguments();
  if ( (typeof cmd == 'object') && cmd.hasOwnProperty('url') ) {
    url = cmd.url;
    loadRemoteBundle(url.replace("tishadow", "http"));
  }

  Ti.App.addEventListener( 'resumed', function(e) {
    cmd = Ti.App.getArguments();
    if ( (typeof cmd == 'object') && cmd.hasOwnProperty('url') ) {
      if ( cmd.url !== url ) {
        url = cmd.url;
        loadRemoteBundle(url.replace("tishadow", "http"));
      }
    }
  });
}

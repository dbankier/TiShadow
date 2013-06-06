var log = require('/api/Log');
var utils = require('/api/Utils');
var Compression = require("ti.compression");
var p = require('/api/PlatformRequire');
var assert = require('/api/Assert');
var Spec = require("/api/Spec");
var io = require('/lib/socket.io');
var osname = Ti.Platform.osname;

exports.currentApp;
var socket, room;
exports.connect = function(o) {
  room = o.room;
  if (socket) {
    exports.disconnect();
  }
  socket = io.connect("http://" + o.host + ":"  + o.port, {'force new connection': true});

  socket.on("connect", function() {
    socket.emit("join", {
      name : o.name,
      room : o.room
    });

    if(o.callback) {
      o.callback();
    }
  });
  socket.on("error", function(e) {
    if (o.onerror) {
      o.onerror(e);
    }
  });
  socket.on("connect_failed", function(e) {
    if(o.onerror) {
      o.onerror(e);
    }
  });
  
  // REPL messages
  socket.on('message',require('/api/Beach').eval);

  socket.on('bundle', function(data) {
    if(data.locale) {
      require("/api/Localisation").locale = data.locale;
    }
    loadRemoteZip(data.name, "http://" + o.host + ":" + o.port + "/bundle", data);
  });

  socket.on('clear', function() {
    exports.clearCache();
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
  }
};




var bundle;
exports.closeApp = function(name) {
  if (bundle && bundle.close !== undefined) {
      bundle.close();
      log.info("Previous bundle closed.");
   }
};
exports.launchApp = function(name) {
  try {
    exports.closeApp();
    p.clearCache();
    require("/api/Localisation").clear();
    // Custom Fonts
    if (osname === "ipad" || osname === "iphone") {
      require("/api/Fonts").loadCustomFonts(name);
    }
    Ti.App.fireEvent("tishadow:refresh_list");
    exports.currentApp = name;
    bundle = p.require("/app");
    log.info(exports.currentApp.replace(/_/g," ") + " launched.");
  } catch(e) {
    log.error(utils.extractExceptionData(e));
  }
};

exports.clearCache = function() {
  var dirty_directories = [Ti.Filesystem.applicationDataDirectory];
  if (Ti.UI.iOS) {
    var applicationDatabaseDirectory = Ti.Filesystem.applicationDataDirectory.replace("Documents/","") + "Library/Private%20Documents/";
    if (Ti.Filesystem.getFile(applicationDatabaseDirectory).exists()) {
      dirty_directories.push(applicationDatabaseDirectory);
    }
  }

  try {
    dirty_directories.forEach(function(targetDirectory) {
      // Clear Applications
      var files = Ti.Filesystem.getFile(targetDirectory).getDirectoryListing();
      files.forEach(function(file_name) {
        var file = Ti.Filesystem.getFile(targetDirectory,file_name);
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
    });
    Ti.App.fireEvent("tishadow:refresh_list");
  } catch (e) {
    log.error(utils.extractExceptionData(e));
  }
  log.info("Cache cleared");
}


function loadRemoteZip(name, url, data) {
  var xhr = Ti.Network.createHTTPClient();
  xhr.setTimeout(10000);
  xhr.onload=function(e) {
    try {
      log.info("Unpacking new bundle: " + name);

      var path_name = name.replace(/ /g,"_");
      // SAVE ZIP
      var zip_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, path_name + '.zip');
      zip_file.write(this.responseData);
      // Prepare path
      var target = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, path_name);
      if (!target.exists()) {
        target.createDirectory();
      }
      // Extract
      var dataDir=Ti.Filesystem.applicationDataDirectory + "/";
      Compression.unzip(dataDir + path_name, dataDir + path_name + '.zip',true);
      // Launch
      if (data.spec.run) {
        exports.currentApp = path_name;
        Spec.run(path_name, data.spec.junitxml);
      } else if (data.patch.run) {
        p.clearCache(data.patch.files);
      } else  {
        exports.launchApp(path_name);
      }
    } catch (e) {
      log.error(utils.extractExceptionData(e));
    }
  };
  xhr.onerror = function(e){
    Ti.UI.createAlertDialog({title:'XHR', message:'Error: ' + e.error}).show();
  };
  xhr.open('GET', url + "/" + room);
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

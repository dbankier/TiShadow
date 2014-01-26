var log = require('/api/Log');
var utils = require('/api/Utils');
var Compression = require("ti.compression");
var assert = require('/api/Assert');
var io = require('/lib/socket.io');
var osname = Ti.Platform.osname;
var platform = (osname === 'ipad' || osname === 'iphone') ? 'ios' : osname;
var socket, room;

if (!Ti.App.Properties.hasProperty("tishadow:uuid")) {
  Ti.App.Properties.setString("tishadow:uuid",Ti.Platform.createUUID());
}

exports.currentApp;
exports.connect = function(o) {
  room = o.room;
  var version_property = "tishadow:" + room + ":version";
  if (socket) {
    exports.disconnect();
  }
  socket = io.connect((o.proto || "http") + "://" + o.host + ":"  + o.port, {'force new connection': true});

  socket.on("connect", function() {
    socket.emit("join", {
      name : o.name,
      uuid : Ti.App.Properties.getString("tishadow:uuid"),
      os_osname: Ti.Platform.osname,
      os_version: Ti.Platform.version,
      room : o.room,
      version: Ti.App.Properties.getString(version_property) || undefined
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
  socket.on('message', function(data) {
    if (!isTarget(data)) {
      return;
    }
    require('/api/PlatformRequire').eval(data);
  });

  socket.on('bundle', function(data) {
    if (!isTarget(data)) {
      return;
    }
    if(data.locale) {
      require("/api/Localisation").locale = data.locale;
    }
    loadRemoteZip(data.name, (o.proto || "http") + "://" + o.host + ":" + o.port + "/bundle", data, version_property);
  });

  socket.on('clear', function(data) {
    if (!isTarget(data)) {
      return;
    }
    exports.clearCache();
  });

  socket.on('close', function(data) {
    if (!isTarget(data)) {
      return;
    }
    exports.closeApp();
  });

  socket.on('screenshot', function(data) {
    if (!isTarget(data)) {
      return;
    }
    Ti.Media.takeScreenshot(function(o) {
      var image = o.media;
      if (data.scale) {
        var height = Ti.Platform.displayCaps.platformHeight * data.scale;
        var width = Ti.Platform.displayCaps.platformWidth * data.scale;
        image = image.imageAsResized(width, height);
      }
      var imgStr = Ti.Utils.base64encode(image).toString();
      socket.emit("screenshot_taken", {image: imgStr});
    });
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
exports.closeApp = function() {
  exports.disconnect();
  Ti.App.Properties.setString("tishadow::currentApp","" );
  Ti.App.Properties.setBool("tishadow::reconnectOnly",true );
  Ti.App._restart();
};
exports.nextApp = function(name) {
  Ti.App.Properties.setString("tishadow::currentApp", name ? name.replace(/ /g,"_") : exports.currentApp);
  Ti.App.Properties.setBool("tishadow::reconnectOnly",false );
  exports.disconnect();
  Ti.App._restart();
}
exports.launchApp = function(name) {
  try {
    var p = require('/api/PlatformRequire');
    // Custom Fonts
    if (osname === "ipad" || osname === "iphone") {
      require("/api/Fonts").loadCustomFonts(name);
    }
    // still requires cache clean on restart
    p.clearCache();
    require("/api/Localisation").clear();

    exports.currentApp = name;
    bundle = p.include(null, "/app.js");
    log.info(exports.currentApp.replace(/_/g," ") + " launched.");
    Ti.App.Properties.setString("tishadow::currentApp", "");
  } catch(e) {
    log.error(utils.extractExceptionData(e));
  }
};

exports.clearCache = function() {
  Ti.App.Properties.listProperties().forEach(function(property) {
    if (!property.match("^tishadow:")) {
      Ti.App.Properties.removeProperty(property);
    }
  });

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
  } catch (e) {
    log.error(utils.extractExceptionData(e));
  }
  log.info("Cache cleared");
  exports.closeApp();
};


function loadRemoteZip(name, url, data, version_property) {
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
      if (data && data.version && version_property) {
        Ti.App.Properties.setString(version_property, data.version);
      } else {
        Ti.App.Properties.removeProperty(version_property);
      }
      // Launch
      if (data && data.spec && data.spec.run) {
        exports.currentApp = path_name;
        require("/api/Spec").run(path_name, data.spec.junitxml, data.spec.type);
      } else if (data && data.patch && data.patch.run) {
        require('/api/PlatformRequire').clearCache(data.patch.files);
      } else  {
        exports.nextApp(path_name);
      }
    } catch (e) {
      log.error(utils.extractExceptionData(e));
    }
  };
  xhr.onerror = function(e){
    Ti.UI.createAlertDialog({title:'XHR', message:'Error: ' + e.error}).show();
  };
  xhr.open('GET', url + "/" + room + "/" + Ti.App.Properties.getString("tishadow:uuid") );
  xhr.send();
}

function isTarget(data) {
  return (!data.platform || data.platform.indexOf(osname) !== -1 || data.platform.indexOf(platform) !== -1);
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

function parseArguments() {
  cmd = Ti.App.getArguments();
  if ( (typeof cmd == 'object') && cmd.hasOwnProperty('url') ) {
    if ( cmd.url !== url ) {
      url = cmd.url;
      if (url.substring(0, 8) === 'tishadow') {
        loadRemoteBundle(url.replace("tishadow", "http"));
      }
    }
  }
}

var url = '';
if (osname !== "android") {
  parseArguments();
  Ti.App.addEventListener( 'resumed', parseArguments);
}

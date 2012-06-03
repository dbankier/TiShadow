var log = require('/api/Log');
var zipfile = Ti.Platform.osname === "android" ? require("com.yydigital.zip"): require("zipfile");
var p = require('/api/PlatformRequire');

var current;
Ti.App.addEventListener("tishadow:message", function(message) {
  try {
    if(current && current.close !== undefined) {
      current.close();
    }
    current = eval(message.code);
    if(current && current.open !== undefined) {
      current.open();
    }
    log.info("Deployed");
  } catch (e) {
    var error_message;
    if(e.line === undefined) {
      error_message = e.toString();
    } else { //iOS Error
      error_message = "Line " + e.line + ": " + e.message;
    }
    log.error(error_message);
  }
});


function loadRemoteZip(url) {
var xhr = Ti.Network.createHTTPClient();
  xhr.setTimeout(1000);
  xhr.onload=function(e) {
    try {
      if (bundle && bundle.close !== undefined) {
        bundle.close();
        log.info("Previous bundle closed.");
      }
      log.info("Unpacking new bundle.");
      var zip_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'bundle.zip');
      zip_file.write(this.responseData);
      var dataDir = Ti.Platform.osname === "android" ?  Ti.Filesystem.applicationDataDirectory :  Ti.Filesystem.applicationDataDirectory.slice(0,Ti.Filesystem.applicationDataDirectory.length - 1).replace('file://localhost','').replace(/%20/g,' ');
      zipfile.extract(dataDir+'/bundle.zip', dataDir);
      p.clearCache();
      bundle = p.require(Ti.Filesystem.applicationDataDirectory + "/app");
      log.info("New bundle deployed.");
    } catch (err) {
      log.error(err.toString());
    }
  };
  xhr.onerror = function(e){
    Ti.UI.createAlertDialog({title:'XHR', message:'Error: ' + e.error}).show();
  };
  xhr.open('GET', url);
  xhr.send();
}

var bundle;
Ti.App.addEventListener("tishadow:bundle", function(o) {
  loadRemoteZip("http://" + Ti.App.Properties.getString("address") + ":3000/bundle");
});


exports.loadFromCache = function() {
  try {
    p.clearCache();
    var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + "/app.js");
    if (file.exists()) {
      bundle = p.require(Ti.Filesystem.applicationDataDirectory + "/app");
      log.info("New bundle deployed.");
    } else {
      alert("No app found in cache.");
    }
  } catch (err) {
    log.error(err.toString());
  }
};


// FOR URL SCHEME - tishadow://
function loadRemoteBundle(url) {
  if (url.indexOf(".zip") === -1) {
    alert("Invalid Bundle");
  } else {
    loadRemoteZip(url);
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



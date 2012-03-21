/*globals, exports, require*/
var LoginView = require('/ui/LoginView').LoginView;
var Activity = require('/ui/Activity').Activity;
var log = require('/api/Log');
var zipfile = Ti.Platform.osname === "android" ? require("com.yydigital.zip"): require("zipfile");
var p = require('/api/PlatformRequire');
require("/api/Includes");

exports.StartScreen = function() {
  var win = Ti.UI.createWindow({
    backgroundColor : 'white',
    exitOnClose : true
  });

  var activity = new Activity("Connecting...");

  var webview = Ti.UI.createWebView({
    url : '/webview.html',
    top : 0,
    left : 0,
    width : 1,
    height : 1
  });
  win.add(webview);

  var login = new LoginView();

  login.addEventListener("connect", function(o) {
    activity.show();
    Ti.App.fireEvent('tishadow:socket_connect', {
      address : Ti.App.Properties.getString("address"),
      name : Ti.Platform.osname + ", " + Ti.Platform.version + ", " + Ti.Platform.address
    });
  });
  win.add(login);

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
  
  var bundle;
  Ti.App.addEventListener("tishadow:bundle", function(o) {
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
      } catch (e) {
        log.error(e.toString());
      }
    };
    xhr.onerror = function(e){
      Ti.UI.createAlertDialog({title:'XHR', message:'Error: ' + e.error}).show();
    };

    xhr.open('GET', "http://" + Ti.App.Properties.getString("address") + ":3000/bundle");
    xhr.send();
  });

  Ti.App.addEventListener("tishadow:connected", function(o) {
    activity.hide();
    alert("Connected");
    win.remove(login);
  });

  Ti.App.addEventListener("tishadow:connectfailed", function(o) {
    activity.hide();
    alert("Connect Failed");
    win.add(login);
  });

  Ti.App.addEventListener("tishadow:disconnected", function(o) {
    alert("Disconnected");
    win.add(login);
  });

  return win;
};

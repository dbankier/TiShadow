/*globals, exports, require*/
var LoginView = require('/ui/LoginView').LoginView;
var Activity = require('/ui/Activity').Activity;
var log = require('/api/Log');

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
    Ti.App.fireEvent('socket:connect', {
      address : Ti.App.Properties.getString("address"),
      name : Ti.Platform.osname + ", " + Ti.Platform.version + ", " + Ti.Platform.address
    });
  });
  win.add(login);

  var current;
  Ti.App.addEventListener("message", function(message) {
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
      if(Ti.Platform.osname === 'android') {
        error_message = e.toString();
      } else { //iOS Error
        error_message = "Line " + e.line + ": " + e.message;
      }
      log.error(error_message);
    }
  });

  Ti.App.addEventListener("connected", function(o) {
    activity.hide();
    alert("Connected");
    win.remove(login);
  });

  Ti.App.addEventListener("connectfailed", function(o) {
    activity.hide();
    alert("Connect Failed");
    win.add(login);
  });

  Ti.App.addEventListener("disconnected", function(o) {
    alert("Disconnected");
    win.add(login);
  });

    return win;
};

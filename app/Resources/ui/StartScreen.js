/*globals, exports, require*/
var LoginView = require('/ui/LoginView');
var Activity = require('/ui/Activity');
//Includes do not need to be included at runtime, just needed to trick
//require("/api/Includes");
var TiShadow = require('/api/TiShadow');

exports.StartScreen = function() {
  var win = Ti.UI.createWindow({
    backgroundColor : 'white',
    exitOnClose : true,
    title: "TiShadow",
  });
  var app_list= new (require("/ui/AppList"))();
  app_list.addEventListener("launch", function(e) {
    activity.show();
    TiShadow.launchApp(e.app);
    activity.hide();
  });

  (require("/ui/NavBar")).add({
    win:win,
    connect: function() {
      login.show();
    }
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

  var label = Ti.UI.createLabel({
    text: "Not Connected",
    font: {
      fontSize: "10dp",
      fontWeight: "bold"
    },
    bottom:  "0dp",
    height: "20dp",
    textAlign: 'center',
    width: Ti.UI.FILL,
    color: "black",
    backgroundColor: "#adbedd"
  });

  win.add(label);
  win.add(app_list);
  var login = new LoginView();
  login.zIndex = 10;
  function connect() {
    Ti.App.fireEvent('tishadow:socket_connect', {
      address : Ti.App.Properties.getString("address"),
      name : Ti.Platform.osname + ", " + Ti.Platform.version + ", " + Ti.Platform.address
    });
  }
  login.addEventListener("connect", function(o) {
    activity.show();
    connect();
  });

  win.addEventListener('open', function() { 
    login.open();
  });


  // Listeners
  Ti.App.addEventListener("tishadow:connected", function(o) {
    activity.hide();
    alert("Connected");
    label.text = "Connected";
    login.hide();
  });

  Ti.App.addEventListener("tishadow:connectfailed", function(o) {
    activity.hide();
    alert("Connect Failed");
    label.text = "Not Connected";
    login.show();
  });

  Ti.App.addEventListener("tishadow:disconnected", function(o) {
    alert("Disconnected");
    label.text = "Not Connected";
    login.show();
  });

  Ti.App.addEventListener("tishadow:refresh_list", function(o) {
    app_list.refreshList();
  });
  // To fix undetected connection loss when app backgrounded on iOS
  if (Ti.Platform.osname!=="android"){
    Ti.App.addEventListener("resumed", function() {
      Ti.App.fireEvent('tishadow:socket_disconnect');
      connect();
    });
  }

  return win;
};

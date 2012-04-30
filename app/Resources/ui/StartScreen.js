/*globals, exports, require*/
var LoginView = require('/ui/LoginView');
var Activity = require('/ui/Activity');
//Includes do not need to be included at runtime, just needed to trick
//require("/api/Includes");
var TiShadow = require('/api/TiShadow');

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

  var label = Ti.UI.createLabel({
    text: "Connected",
    font: {
      fontSize: "20dp",
      fontWeight: "bold"
    },
    color: "#adbedd"
  });
  
  label.addEventListener('click', function() {
  	Ti.App.fireEvent('tishadow:socket_disconnect');
    connect();
  });
  win.add(label);

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
  win.add(login);

  var button = Ti.UI.createButton({
    height : '40dp',
    width : '280dp',
    color : '#adbedd',
    backgroundColor : "white",
    borderColor: "#adbedd",
    borderWidth: 1,
    font : {
      fontSize : '16dp',
      fontWeight : 'bold'
    },
    borderRadius : '10',
    bottom : '20dp',
    title : "Load from Cache"
  });

  button.addEventListener('click', function() {
    TiShadow.loadFromCache();
  });

  win.add(button);


  // Listeners
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
// To fix undetected connection loss when app backgrounded on iOS
if (Ti.Platform.osname!=="android"){
  Ti.App.addEventListener("resumed", function() {
    Ti.App.fireEvent('tishadow:socket_disconnect');
    connect();
  });
}

return win;
};

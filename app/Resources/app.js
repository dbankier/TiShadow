var current_app = Ti.App.Properties.getString("tishadow::currentApp","");
if (current_app !== "") { 
  var TiShadow = require('/api/TiShadow');
  TiShadow.connect({
    host: Ti.App.Properties.getString("tishadow:address", "localhost"),
    port: Ti.App.Properties.getString("tishadow:port", "3000"),
    room: Ti.App.Properties.getString("tishadow:room", "default").trim() || "default",
    name: Ti.Platform.osname + ", " + Ti.Platform.version + ", " + Ti.Platform.address
  });
  TiShadow.launchApp(current_app);
} else {
  var StartScreen = require("/ui/StartScreen").StartScreen;
  new StartScreen().open();
}

require("/lib/ti-mocha");

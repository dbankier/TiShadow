/*globals, exports, require, mixin*/
var Styles = require('/ui/Styles').login;

function LoginView() {
  var window = Ti.UI.createWindow();
  var black = Ti.UI.createView({
     backgroundColor: 'black',
     opacity: 0.4
  });
  black.addEventListener('click', function() {
    window.hide();
  });
  window.add(black);
  
  //Container
  var container = Ti.UI.createView(Styles.container);
  
  // "Tabs"
  var leftTab = Ti.UI.createLabel(Styles.leftTab);
  var rightTab = Ti.UI.createLabel(Styles.rightTab);
  container.add(rightTab);
  container.add(leftTab);

  
  //views
  var header = Ti.UI.createLabel(Styles.header);

  var host   = Ti.UI.createTextField(Styles.host);
  var colon  = Ti.UI.createLabel(Styles.colon);
  var port   = Ti.UI.createTextField(Styles.port);
  var button = Ti.UI.createButton(Styles.button);
  var room   = Ti.UI.createTextField(Styles.room);

  leftTab.addEventListener('click', function() {
    leftTab.backgroundColor = 'transparent';
    rightTab.backgroundColor = '#4377d2';
    port.visible = colon.visible = room.visible = false;
    host.width = "280dp";
    container.height = "190dp";
  });

  rightTab.addEventListener('click', function() {
    host.width = "205dp";
    container.height = "230dp";
    rightTab.backgroundColor = 'transparent';
    leftTab.backgroundColor = '#4377d2';
    port.visible = colon.visible = room.visible = true;
  });


  host.value = Ti.App.Properties.getString("address");
  host.addEventListener("change", function() {
    Ti.App.Properties.setString("address", host.value);
  });

  port.value = Ti.App.Properties.getString("port");
  port.addEventListener("change", function() {
    Ti.App.Properties.setString("port", port.value);
  });

  room.value = Ti.App.Properties.getString("room");
  room.addEventListener("change", function() {
    Ti.App.Properties.setString("room", room.value);
  });



  button.addEventListener('click', function() {
    if (Ti.App.Properties.getString("port","").length === 0) {
      port.value = "3000";
    }
    Ti.App.Properties.setString("port", port.value);
    if (Ti.App.Properties.getString("address","").length === 0) {
      alert("IP Address Required");
    } else {
      window.fireEvent("connect");
    }
  });

  container.add(header);
  container.add(host);
  container.add(button);
  container.add(colon);
  container.add(port);
  container.add(room);

  window.add(container);

  return window;
};

module.exports = LoginView;

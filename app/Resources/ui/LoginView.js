/*globals, exports, require, mixin*/
var Styles = require('/ui/Styles').login;

function LoginView() {
  var view = Ti.UI.createView();
  var black = Ti.UI.createView({
     backgroundColor: 'black',
     opacity: 0.4
  });
  black.addEventListener('click', function() {
    view.parent.remove(view);
  });
  view.add(black);
  
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


  host.value = Ti.App.Properties.getString("tishadow:address");
  host.addEventListener("change", function() {
    Ti.App.Properties.setString("tishadow:address", host.value);
  });

  port.value = Ti.App.Properties.getString("tishadow:port");
  port.addEventListener("change", function() {
    Ti.App.Properties.setString("tishadow:port", port.value);
  });

  room.value = Ti.App.Properties.getString("tishadow:room");
  room.addEventListener("change", function() {
    Ti.App.Properties.setString("tishadow:room", room.value);
  });



  button.addEventListener('click', function() {
    if (Ti.App.Properties.getString("tishadow:port","").length === 0) {
      port.value = "3000";
    }

    // If user unnecessarily enters full url in the host field
    // e.g. http://localhost:3000
    Ti.App.Properties.setString("tishadow:port", port.value);
    if (host.value.match("^http://")) {
      host.value = host.value.substring(7);
      host.fireEvent("change");
    } else if (host.value.match("3000$")) {
      host.value = host.value.replace(/:3000$/,"");
      host.fireEvent("change");
      port.value = "3000";
      port.fireEvent("change");
    }

    if (host.value.indexOf("https://") === 0) { // attempt https
      host.value = host.value.substring(8);
      host.fireEvent("change");
      alert("https not (yet) supported");
    } else if (host.value.indexOf(":") > -1) { //managing full url again
      var parts = host.value.split(":");
      host.value = parts[0];
      host.fireEvent("change");
      port.value = parts[1];
      port.fireEvent("change");
      rightTab.fireEvent('click');
      alert("Please use advanced settings to configure port");
    } else if (Ti.App.Properties.getString("tishadow:address","").length === 0) {
      alert("IP Address Required");
    } else {
      view.fireEvent("connect");
    }
  });

  container.add(header);
  container.add(host);
  container.add(button);
  container.add(colon);
  container.add(port);
  container.add(room);

  view.add(container);

  return view;
};

module.exports = LoginView;

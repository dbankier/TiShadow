/*globals, exports, require, mixin*/
var Styles = require('/ui/Styles');

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
     
  var container = Ti.UI.createView(Styles.text.container);

  //Left View
  var header = Ti.UI.createLabel(Styles.text.header);

  var host = Ti.UI.createTextField(Styles.text.host);
  var colon = Ti.UI.createLabel(Styles.text.colon);
  var port = Ti.UI.createTextField(Styles.text.port);
  var button = Ti.UI.createButton(Styles.button);

  host.value = Ti.App.Properties.getString("address");
  host.addEventListener("change", function() {
    Ti.App.Properties.setString("address", host.value);
  });
  
  port.value = Ti.App.Properties.getString("port");
  port.addEventListener("change", function() {
    Ti.App.Properties.setString("port", port.value);
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

  window.add(container);

  return window;
};

module.exports = LoginView;

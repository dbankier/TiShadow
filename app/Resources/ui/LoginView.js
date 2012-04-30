/*globals, exports, require, mixin*/
var Styles = require('/ui/Styles');

function LoginView() {
  var container = Ti.UI.createView(Styles.text.container);

  //Left View
  var header = Ti.UI.createLabel(Styles.text.header);

  var host = Ti.UI.createTextField(Styles.text.host);
  var button = Ti.UI.createButton(Styles.button);

  host.value = Ti.App.Properties.getString("address");
  host.addEventListener("change", function() {
    Ti.App.Properties.setString("address", host.value);
  });
  
  button.addEventListener('click', function() {
    if (Ti.App.Properties.getString("address","").length === 0) {
      alert("IP Address Required");
    } else {
      container.fireEvent("connect");
    }
  });

  container.add(header);
  container.add(host);
  container.add(button);

  return container;
};

module.exports = LoginView;

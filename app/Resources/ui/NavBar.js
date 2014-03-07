var connect_button = Ti.UI.createButton({title:'Connect', color: '#157efb', top: '5dp', left: "10dp"});

module.exports = {
  add: function(o) {
    connect_button.addEventListener('click', o.connect);
    if(Ti.Platform.osname !== "android") {
      connect_button.style = Ti.UI.iPhone.SystemButtonStyle.DONE;
      var flexSpace = Ti.UI.createButton({
        systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
      });

      var title = Ti.UI.createLabel({
        text:"TiShadow",
        font:{
          fontSize:18,
          fontWeight:'bold'
        }
      });

      var bar = Ti.UI.iOS.createToolbar({
        items:[connect_button,flexSpace, title, flexSpace],
        top:0,
        barColor:'#f8f8f8',
        height:40
      });

      o.win.add(bar);
    } else {
      var view = Ti.UI.createView({
        height: "40dp",
        width: Ti.UI.FILL,
        top: 0,
        backgroundColor: '#f8f8f8'
      });
      connect_button.backgroundColor = '#f8f8f8';
      connect_button.borderColor = 'black';
      connect_button.borderWidth = 1;
      connect_button.width = "90dp";
      view.add(connect_button);
      o.win.add(view);
    }
  },
  setConnectEnabled: function(val) {
    connect_button.enabled = val;
  }
  //Tooling not allowing getters/setters on object literals. see issue #32
  //get connectEnabled() { return connect_button.enabled; },
  //set connectEnabled(val) { connect_button.enabled = val;}
}


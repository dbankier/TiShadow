/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var connect_button = Ti.UI.createButton({title:'Connect', color: '#2192E3', left: "10dp", width: Ti.UI.SIZE});

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
        height: "50dp",
        width: Ti.UI.FILL,
        top: 0,
        backgroundColor: '#f8f8f8'
      });
      connect_button.backgroundColor = '#f8f8f8';
      view.add(connect_button);
      o.win.add(view);
    }
  },
  setConnected: function(val) {
    connect_button.connected = val;
    connect_button.title = val ? "Disconnect" : "Connect";
    connect_button.width = Ti.UI.SIZE;
  }
}


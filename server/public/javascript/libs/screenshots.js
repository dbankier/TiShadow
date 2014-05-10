/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var TiShadow = {};
var devices = [];
TiShadow.init = function (session, guest){
  var socket = io.connect();
  socket.on('connect', function(data) {
    socket.emit("join", {name: 'controller'});
  });
  socket.on('screenshot_display', function(e) {
    var name = e.name.replace(/[ ,\.]+/g, "");
    console.log(name);
    if (devices.indexOf(name) === -1) {
      $("#shots").append("<img id='" + name+"'/>");
      devices.push(name);
    }
    $("#" + name).attr("src","data:image/png;base64," + e.image );
  });
  TiShadow.socket = socket;
};


$(document).ready(function() {
  TiShadow.init();
});



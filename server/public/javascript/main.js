var TiShadow = {};
TiShadow.init = function (session, guest){
  var socket = io.connect("http://localhost");
  socket.on('connect', function(data) {
    socket.emit("join", {name: 'controller'});
  });
  socket.on('device_connect', function(e){
    $(".device_list").append('<li id="'+ e.id + '">' + e.name + '</li>');
  });
  socket.on('device_disconnect', function(e){
    $("li#" + e.id).remove();
  });
  TiShadow.socket = socket;
};


$(document).ready(function() {
  TiShadow.init();
  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/twilight");
  var JavaScriptMode = require("ace/mode/javascript").Mode;
  editor.getSession().setMode(new JavaScriptMode());

  $("input#tisubmit").click(function() {
    TiShadow.socket.emit("generate", {code: editor.getSession().getValue()});
  });

  $("#editor").keypress(function (event) {
    if ((event.which == 115 && event.ctrlKey) || (event.which == 115 && event.metaKey)){
      $("input#tisubmit").click();
      event.preventDefault();
      return false;
    }
  });

});




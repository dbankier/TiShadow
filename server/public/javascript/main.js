var TiShadow = {};
TiShadow.init = function (session, guest){
  var socket = io.connect();
  socket.on('connect', function(data) {
    socket.emit("join", {name: 'controller'});
  });
  socket.on('device_connect', function(e){
    $(".device_list").append('<li id="'+ e.id + '">' + e.name + '</li>');
  });
  socket.on('device_disconnect', function(e){
    $("li#" + e.id).remove();
  });
  socket.on('device_log', function(e) {
    var now = new Date();
    var log = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + " [" + e.level + "] [" + e.name + "]    " + (e.message === undefined ? 'undefined' : e.message.toString().replace("\n","<br/>"));
    var style = e.level === "ERROR"  || e.level === "FAIL" ? " error" : e.level === "WARN" ? "" : " success"
    $(".console").append("<div class='alert-message" + style + "'>" + log + "</div>");
    $(".console").scrollTop($(".console")[0].scrollHeight);
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
    TiShadow.socket.emit("snippet", {code: editor.getSession().getValue()});
  });

  $("#editor").keypress(function (event) {
    if ((event.which == 115 && event.ctrlKey) || (event.which == 115 && event.metaKey)){
      $("input#tisubmit").click();
      event.preventDefault();
      return false;
    }
  });

});




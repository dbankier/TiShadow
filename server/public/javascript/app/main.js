var app = angular.module('tishadow', []);

var $apply = function($scope){
  if(!$scope.$$phase){
    $scope.$apply();
  }
};

function downloadInnerHtml(filename, elId, mimeType) {
    var elHtml = document.getElementById(elId).innerHTML;
    var link = document.createElement('a');
    mimeType = mimeType || 'text/plain';

    link.setAttribute('download', filename);
    link.setAttribute('href', 'data:' + mimeType  +  ';charset=utf-8,' + encodeURIComponent(elHtml));
    link.click();
}

// Main controller
app.controller('mainController', ['$scope', '$timeout', function($scope, $timeout){
  $scope._       = _;
  $scope.devices = {};

  var TiShadow = {};
  TiShadow.init = function (session, guest){
    var socket = io.connect();

    socket.on('connect', function(data) {
      socket.emit("join", {name: 'controller'});
    });

    socket.on('device_connect', function(e){
      $scope.devices[e.id] = {
        name: e.name,
        id: e.id
      };
      $apply($scope);
    });

    socket.on('device_disconnect', function(e){
      delete $scope.devices[e.id];
      $apply($scope);
    });

    socket.on('device_log', function(e) {
      var now = new Date();
      var minutes = now.getMinutes();
      var seconds = now.getSeconds();
      var log = now.getHours() + ":" + (minutes < 10 ? "0" : "") +  minutes + ":" + (seconds < 10 ? "0" : "" ) + seconds + " [" + e.level + "] [" + e.name + "]    " + (e.message === undefined ? 'undefined' : e.message.toString().replace("\n","<br/>"));
      var style = e.level === "ERROR"  || e.level === "FAIL" ? " error" : e.level === "WARN" ? "warning" : e.level === "INFO" ? " success" : " info";
      $("#console").append("<div class='control-group " + style + "'><span class='control-label'>" + log + "</span></div>");
      $("#console").scrollTop($("#console")[0].scrollHeight);
    });
    TiShadow.socket = socket;
  };

  $timeout(function(){
    TiShadow.init();

    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/twilight");
    var JavaScriptMode = require("ace/mode/javascript").Mode;
    editor.getSession().setMode(new JavaScriptMode());

    $("button#tisubmit").click(function() {
      TiShadow.socket.emit("snippet", {code: editor.getSession().getValue()});
    });

    $("#editor").keypress(function (event) {
      if ((event.which == 115 && event.ctrlKey) || (event.which == 115 && event.metaKey)){
        $("input#tisubmit").click();
        event.preventDefault();
        return false;
      }
    });

    $('#filter').change(function(){
      filter();
    });

    $('#filter').keyup(function(){
      var val = this.value;
      filter(val);
    });

    var filter = function(value){
      var _console = $('#console .control-label');

      if(!value){
        $('#console .control-label').parent().show();
        return;
      }

      var regexp = new RegExp(value, 'gi');

      _console.each(function(index, item){
        item = $(item);

        if(regexp.test(item.html())){
          item.parent().show();
        } else {
          item.parent().hide();
        }
      });
    };

    $('.form-search .btn-toggle').click(function(){
      var btn      = $(this);
      var _console = $('#console .control-group');
      _console.hide();

      $('.form-search .btn-toggle').removeClass('disabled');
      btn.addClass('disabled');

      if(btn.hasClass('btn-all')){
        _console.show();
      }

      if(btn.hasClass('btn-info')){
        $('#console .control-group.info').show();
      }

      if(btn.hasClass('btn-success')){
        $('#console .control-group.success').show();
      }

      if(btn.hasClass('btn-warning')){
        $('#console .control-group.warning').show();
      }

      if(btn.hasClass('btn-danger')){
        $('#console .control-group.error').show();
      }

      $('#console').scrollTop($('#console')[0].scrollHeight);
    });

    $scope.downloadFile = function(){
      downloadInnerHtml('logfile_' + new Date().getTime(), 'console', 'text/html');
    };

  });

}]);

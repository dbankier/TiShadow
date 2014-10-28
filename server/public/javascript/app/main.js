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
  $scope.inspect = {};
  $scope.logs = [];

  var TiShadow = {};
  TiShadow.init = function (session, guest){
    var socket = io.connect();

    socket.on('connect', function(data) {
      socket.emit("join", {name: 'controller'});
      socket.emit("snippet", {code: "console.inspect(me)"});
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
      if (e.level !== "INSPECT") {
        var now = new Date();
        var minutes = now.getMinutes();
        var seconds = now.getSeconds();
        var log = now.getHours() + ":" + (minutes < 10 ? "0" : "") +  minutes + ":" + (seconds < 10 ? "0" : "" ) + seconds + " [" + e.level + "] [" + e.name + "]    " + (e.message === undefined ? 'undefined' : e.message.toString().replace("\n","<br/>"));
        var style = e.level === "ERROR"  || e.level === "FAIL" ? " error" : e.level === "WARN" ? "warning" : e.level === "INFO" ? " success" : " info";
        $scope.logs.push({
          level: e.level,
          log: log,
          style: style
        });
        $apply($scope);
      } else {
        $scope.inspect.values = JSON.parse(e.message);
        $apply($scope);
      }
    });
    TiShadow.socket = socket;
  };
  $scope.submit = function() {
    TiShadow.socket.emit("snippet", {code: editor.getSession().getValue()});
  };
  $scope.downloadFile = function(){
    downloadInnerHtml('logfile_' + new Date().getTime(), 'console', 'text/html');
  };
  $scope.update = function(key,value, key2) {
    TiShadow.socket.emit("snippet", {code: "me['"+key+"']" + (key2 ? "['" + key2 + "']" : "") + "= " + value + ";"});
    TiShadow.socket.emit("snippet", {code: "console.inspect(me)"});
  };
  $scope.keypress = function(evt, key,value, key2) {
    if (evt.which===13){
      TiShadow.socket.emit("snippet", {code: "me['"+key+"']" + (key2 ? "['" + key2 + "']" : "") + "= '" + value + "';"});
      TiShadow.socket.emit("snippet", {code: "console.inspect(me)"});
    }
  };

  $timeout(function(){
    TiShadow.init();

    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/twilight");
    var JavaScriptMode = require("ace/mode/javascript").Mode;
    editor.getSession().setMode(new JavaScriptMode());


    $("#editor").keypress(function (event) {
      console.log(event.which);
      console.log(event.ctrlKey);
      console.log(event.metaKey);
      if ((event.which == 115 && event.ctrlKey) || (event.which == 115 && event.metaKey)){
        $scope.submit();
        event.preventDefault();
        return false;
      }
    });


  });

}]);

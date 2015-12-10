/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var sourcemap = require("/lib/sourcemap");
var logLevels = ['info', 'error', 'debug', 'trace', 'repl', 'warn', 'pass', 'fail', 'test', 'cover', 'inspect', 'spy'];

logLevels.forEach(function(level) {
  exports[level] = function() {
    Array.prototype.unshift.call(arguments, level);
    _write.apply(null, arguments);
  };
});

function parseAndroidLog(arguments){
  var args = arguments.split("\n");
  var obj = {};
  args.forEach(function(msg){
    if(msg !== ""){
      var result = msg.split(": ");
      var name = result[0] === "File" ? "sourceName" : result[0].toLowerCase();
      var value = name === "line" ? parseInt(result[1]) : result[1];
      obj[name] = value;
    }
  });
  return obj;
};

exports.log = function(level) {
  // If the value of level is not recognized,
  // an info-level message prefixed with the value is logged.
  // http://docs.appcelerator.com/titanium/latest/#!/api/Titanium.API-method-log
  if (logLevels.indexOf(level) === -1) {
    Array.prototype.unshift.call(arguments, 'info');
  }
  _write.apply(null, arguments);
};

function _write() {
  var upperCaseLevel;
  if(arguments.length > 1){
    upperCaseLevel = Array.prototype.shift.call(arguments).toUpperCase();
  }else if(arguments.length == 1 && typeof arguments[0] === "string"){
    upperCaseLevel = arguments[0].toUpperCase();
  }
  Array.prototype.forEach.call(arguments, function(msg, i, messages) {
    try{
      if(typeof msg === "string"){
        if(/File\:/g.test(msg) && /Line\:/g.test(msg)){
          var resource = parseAndroidLog(msg);
        }else{
          var resource = JSON.parse(messages[i]);
        }
      }else{
        var resource = _.clone(messages[i]);
      }
      if(typeof resource === 'object' && (resource.sourceName || resource.sourceURL)){
        var sourceURL = resource.sourceName || resource.sourceURL;
        var mapPath = Ti.Filesystem.applicationDataDirectory;
        mapPath += Ti.App.name.replace(" ", "_")+"/";
        mapPath += Ti.Platform.osname === "ipad" ? "iphone" : Ti.Platform.osname;
        mapPath += "/"+sourceURL.replace(/.*\.app\//g, "")+".map";
        var mapFile = Ti.Filesystem.getFile(mapPath);
        if(mapFile.exists()){
          var mapSource = JSON.parse(mapFile.read().text);
          var smc = new sourcemap.SourceMapConsumer(mapSource);
          var position = smc.originalPositionFor({
            line: resource.line, 
            column: 0, 
            bias: sourcemap.SourceMapConsumer.LEAST_UPPER_BOUND});            
          if(position.line){
            resource.line = position.line;
            messages[i] = resource;
          }
        }
      }
    }catch(e){}
    
    if (typeof messages[i] === 'object') {
      messages[i] = JSON.stringify(messages[i], function(key, val) {
        if (["children", "_module","_children"].indexOf(key) !== -1 && upperCaseLevel === "INSPECT") {
          return undefined;
        }
        if (typeof val !== 'object') {
          return val;
        }
        try {
          JSON.stringify(val);
          return val;
        } catch (err) {
          return undefined;
        }
      }, 4);
    }
  });

  require("/api/TiShadow").emitLog({
    level: upperCaseLevel,
    message: Array.prototype.join.call(arguments, ' ')
  });

}


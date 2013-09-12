this.__log = require('/api/Log');
this.__p = require('/api/PlatformRequire');
this.__ui = require('/api/UI');
this.L = require('/api/Localisation').fetchString;
this.assert = require('/api/Assert');
this.closeApp =require('/api/TiShadow').closeApp;
this.launchApp = require('/api/TiShadow').launchApp;
this.clearCache = require('/api/TiShadow').clearCache;
this.runSpec = function() {
  var path_name = require('/api/TiShadow').currentApp.replace(/ /g,"_");
  require("/api/Spec").run(path_name, false);
};
this.getSpy = function(name) {
  return spys[name];
};
this.Ti.Shadow = true;

var spys = {};
var context = this;

exports.eval = function(message) {
  try {
    __log.repl(eval.call(context, message.code));
  } catch (e) {
    __log.error(require('/api/Utils').extractExceptionData(e));
  }
};

exports.addSpy = function(name,spy) {
  spys[name]=spy;
};



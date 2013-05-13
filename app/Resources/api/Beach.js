this.__log = require('/api/Log');
this.__p = require('/api/PlatformRequire');
this.L = require('/api/Localisation').fetchString;
this.assert = require('/api/Assert');
this.closeApp =require('/api/TiShadow').closeApp;
this.launchApp = require('/api/TiShadow').launchApp;
this.clearCache = require('/api/TiShadow').clearCache;
this.runSpec = function() {
  var path_name = require('/api/TiShadow').currentApp.replace(/ /g,"_");
  require("/api/Spec").run(path_name, false);
}
var context = this;
exports.eval = function(message) {
  try {
    var ret = eval.call(context, message.code
      .replace(/Ti(tanium)?.Filesystem.(resourcesDirectory|getResourcesDirectory\(\))/g, "Ti.Filesystem.applicationDataDirectory + '"+ ( require('/api/TiShadow').currentApp ?  require('/api/TiShadow').currentApp.replace(/ /g,"_")+"/'" : "/"))
      .replace(/require\(/g, "__p.require(")
      .replace(/Ti(tanium)?.include\(/g, "__p.include(this,")
      .replace(/Ti.Locale.getString/g, "L")
      .replace(/([ :=\(])(['"])(\/.*?)(['"])/g, "$1__p.file($2$3$4)")
      .replace(/Ti(tanium)?.API/g, "__log")
      .replace(/console./g, "__log."));
    __log.repl(ret);
  } catch (e) {
    var ret =  require('/api/Utils').extractExceptionData(e)
    __log.error(ret);
  }
}

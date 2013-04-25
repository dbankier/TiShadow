var logger = require("../../server/logger.js"),
    fs = require("fs"),
    wrench = require("wrench"),
    path = require("path"),
    tishadow_app = path.join(__dirname, "../..","app"),
    config = require("./config"),
    _ = require("underscore");

_.templateSettings = {
  interpolate : /\{\{(.+?)\}\}/g
};

 var required_modules = [
        '<module platform="iphone" version="0.1">yy.tidynamicfont</module>',
        '<module platform="iphone" version="0.3">net.iamyellow.tiws</module>',
        '<module platform="android" version="0.1">net.iamyellow.tiws</module>',
        '<module platform="iphone" version="1.0.2">ti.compression</module>',
        '<module platform="android" version="2.0.1">ti.compression</module>'
 ];



exports.copyCoreProject = function(env) {
  var dest = env.destination || ".";
  if (!fs.existsSync(dest) || !fs.lstatSync(dest).isDirectory()) {
    logger.error("Destination folder does not exist.");
    return false;
  }
  if (dest === ".") {
    logger.error("You really don't want to write to the current directory.");
    return false
  }
  wrench.copyDirSyncRecursive(tishadow_app, dest);
  logger.info("TiShadow app ready");
  return true;
}

exports.build = function(env) {
  var dest = env.destination || ".";
  var dest_resources = path.join(dest,"Resources");
  var dest_modules = path.join(dest,"modules");
  var template_file = path.join(tishadow_app,"Resources","appify.js");

  //set to bundle mode
  env._name = "bundle";
  var compiler = require("./compiler");
  //bundle the source
  compiler(env,function() {
    logger.info("Appying...");
    //copy tishadow src
    if (exports.copyCoreProject(env)) {
      // generate app.js
      var template = fs.readFileSync(template_file,'utf8');
      var new_app_js = _.template(template, {host:config.host, port: config.port, room: config.room, app_name: config.app_name});
      fs.writeFileSync(path.join(dest_resources,"app.js"),new_app_js);
      //copy splash screen and icons
      ['iphone', 'android'].forEach(function(platform) {
        if(fs.existsSync(path.join(config.resources_path,platform))) {
          wrench.copyDirSyncRecursive(path.join(config.resources_path,platform),path.join(dest_resources,platform));
        }
        if(fs.existsSync(path.join(config.modules_path,platform))) {
          wrench.copyDirSyncRecursive(path.join(config.modules_path,platform),path.join(dest_modules,platform),{preserve:true});
        }
      });
      // copy tiapp.xml and inject modules
      var source_tiapp = fs.readFileSync(path.join(config.base,"tiapp.xml"),'utf8');
      required_modules.push("</modules>")
      fs.writeFileSync(path.join(dest,"tiapp.xml"), 
                       source_tiapp
                       .replace(/<plugins>(.|\n)*<\/plugins>/,"")
                       .replace("<modules/>","<modules></modules>")
                       .replace("</modules>",required_modules.join("\n")));
      // copy the bundle
      fs.writeFileSync(path.join(dest_resources, config.app_name + ".zip"),fs.readFileSync(config.bundle_file));
    }
  });
}

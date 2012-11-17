#!/usr/bin/env node
var path = require("path"),
    fs = require("fs"),
    util = require("util"),
    api = require("./api"),
    bundle = require("./bundle"),
    config = require("./config"),
    logger = require("../../logger.js"),
    jshint = require("./jshint_runner");

    require("./fs_extension");

// Copies all Resource files and prepares JS files
function prepare(src, dst) {
  var app_name = config.app_name;
  if (src.match("js$")){ 
    var src_text = "var __p = require('/api/PlatformRequire'), __log = require('/api/Log'), assert = require('/api/Assert'), L = require('/api/Localisation').fetchString;\n" 
      + fs.readFileSync(src).toString()
      .replace(/Ti(tanium)?.Filesystem.(resourcesDirectory|getResourcesDirectory\(\))/g, "Ti.Filesystem.applicationDataDirectory + '"+app_name.replace(/ /g,"_")+"/'")
      .replace(/require\(/g, "__p.require(")
      .replace(/Ti(tanium)?.include\(/g, "__p.include(this,")
      .replace(/Ti.Locale.getString/g, "L")
      .replace(/([ :=\(])(['"])(\/.*?)(['"])/g, "$1__p.file($2$3$4)")
      .replace(/Ti(tanium)?.API/g, "__log");
    if (src.match("_spec.js$")) {
      src_text =  "var jasmine = require('/lib/jasmine-1.2.0');var methods = ['spyOn','it','xit','expect','runs','waits','waitsFor','beforeEach','afterEach','describe','xdescribe'];methods.forEach(function(method) {this[method] = jasmine[method];});"
        +src_text;
    }
    fs.writeFileSync(dst,src_text);
  } else { // Non-JS file - just pump it
    var  is = fs.createReadStream(src);
    var  os = fs.createWriteStream(dst);
    util.pump(is, os);
  }
}


module.exports = function(env) {
  if (!fs.existsSync(path.join(config.base,'tiapp.xml'))) {
    logger.error("Script must be executed in the Titanium project's root directory");
    process.exit();
  }

  config.buildPaths(env, function() {
    if (env.jshint) {
      logger.info("Running JSHint");
      jshint.checkPath(config.jshint_path);
    }

    logger.info("Beginning Build Process");
    var file_list,i18n_list;
    if( config.isUpdate) {
       var last_stat = fs.statSync(config.last_updated_file);
       file_list = fs.getList(config.resources_path,last_stat.mtime);
       i18n_list = fs.getList(config.i18n_path,last_stat.mtime);

       if (file_list.files.length === 0 && i18n_list.files.length === 0) {
         logger.error("Nothing to update.");
         process.exit();
       }
     } else {
       if (!fs.existsSync(config.build_path)){
         fs.mkdirSync(config.build_path, 0755);
       }
       //Clean Build Directory
       if (fs.existsSync(config.tishadow_build)) {
         fs.rm_rf(config.tishadow_build);
       }
       // Create the tishadow build paths
       fs.mkdirs([config.tishadow_build, config.tishadow_src, config.tishadow_dist]);
       file_list = fs.getList(config.resources_path);
       i18n_list = fs.getList(config.i18n_path);
     }

     // Build the required directory structure
     fs.mkdirs(file_list.dirs, config.tishadow_src);
     fs.mkdirs(i18n_list.dirs, config.tishadow_src);

     // Process Files
     //
     // Added timeout was to fix for file access errors (not ideal).
     var end;
     file_list.files.forEach(function(file, idx) {
       end = idx;
       setTimeout(function(){
         prepare(path.join(config.resources_path,file), path.join(config.tishadow_src, file));
       }, end * 1);
     });

     // Just pump out localisation files
     i18n_list.files.forEach(function(file, idx) {
       util.pump(fs.createReadStream(path.join(config.i18n_path,file)),fs.createWriteStream(path.join(config.tishadow_src, file)));
     });

     // Bundle up to go
     setTimeout(function() {
       file_list.files = file_list.files.concat(i18n_list.files);
       var total = file_list.files.length;
       bundle.pack(file_list.files,function(written) { 
         logger.info(total+ " file(s) bundled."); 
         fs.touch(config.last_updated_file);
         if (env._name === "bundle") {
           logger.info("Bundle Ready: " + config.bundle_file);
         } else {
           api.newBundle();
           //require("./socket").connect();
         } 
       });
     }, (end + 1)* 1);
  });
}

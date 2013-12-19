#!/usr/bin/env node
var path   = require("path"),
    fs     = require("fs"),
    exec   = require("exec-sync"),
    alloy  = require("./alloy"),
    api    = require("./api"),
    bundle = require("./bundle"),
    config = require("./config"),
    uglify = require("./uglify"),
    logger = require("../../server/logger.js"),
    jshint = require("./jshint_runner"),
    _      = require("underscore");

    require("./fs_extension");

// Copies all Resource files and prepares JS files
function prepare(src, dst, callback) {
  var app_name = config.app_name;
  if (src.match("js$")){ 
    try {
      var src_text = uglify.toString(fs.readFileSync(src).toString(),src);
      if (src.match("_spec.js$")) {
        src_text =  "var __jasmine = require('/lib/jasmine');var methods = ['spyOn','it','xit','expect','runs','waits','waitsFor','beforeEach','afterEach','describe','xdescribe','jasmine'];methods.forEach(function(method) {this[method] = __jasmine[method];});"
          +src_text;
      }
      fs.writeFile(dst,src_text, callback);
    } catch (e) {
      logger.error(e.message + "\nFile   : " + src + "\nLine   : " + e.line + "\nColumn : " + e.col);
      config.isWatching || process.exit(1);
    }
  } else { // Non-JS file - just pump it
    var  is = fs.createReadStream(src);
    var  os = fs.createWriteStream(dst);
    is.on("end", callback).pipe(os);
  }
}

function prepareFiles(index, file_list, isSpec, callback) {
  if (file_list.files.length === index) {
    callback();
  } else {
    var file = file_list.files[index];
    prepare(path.join(isSpec? config.base : config.resources_path,file), path.join(config.tishadow_src, file), function(){
      index++;
      prepareFiles(index, file_list, isSpec, callback);
    });
  }
}

function finalise(file_list,callback) {
  // Bundle up to go
  var total = file_list.files.length;
  bundle.pack(file_list.files,function(written) { 
    logger.info(total+ " file(s) bundled."); 
    if (config.isAlloy) {
      alloy.writeMap();
    }
    fs.touch(config.last_updated_file);
    if (config.isBundle) {
      logger.info("Bundle Ready: " + config.bundle_file);
      if (callback) {
        callback();
      }
    } else {
      api.newBundle(config.isPatch?_.filter(file_list.files, function(f) { return f.match(".js$");}):null );
    }
  });
}

module.exports = function(env, callback) {
  config.buildPaths(env, function() {
    if (env.jshint) {
      logger.info("Running JSHint");
      jshint.checkPath(config.jshint_path);
    }

    logger.info("Beginning Build Process");
    var file_list,i18n_list,spec_list;
    // a js map of hashes must be built whether or not it is an update.
    if (config.isAlloy) { 
      logger.info("Compiling Alloy");
      if (!config.platform) {
        logger.error("You need to use the --platform (android|ios) flag with an alloy project.");
        process.exit();
      }
      try {
        exec("alloy compile -b -l 1 --config platform="+config.platform);
      } catch (e) {
        logger.error("Alloy Compile Error\n" + e.message);
        process.exit();
      }
      alloy.buildMap();
    }
    if( config.isUpdate) {
       var last_stat = fs.statSync(config.last_updated_file);
       file_list = config.isAlloy ? alloy.mapFiles(last_stat) : fs.getList(config.resources_path,last_stat.mtime);
       i18n_list = fs.getList(config.i18n_path,last_stat.mtime);
       spec_list = fs.getList(config.spec_path,last_stat.mtime);

       if (file_list.files.length === 0 && i18n_list.files.length === 0 && spec_list.files.length === 0) {
         logger.error("Nothing to update.");
         return;
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
       spec_list = fs.getList(config.spec_path);
     }

     // Build the required directory structure
     fs.mkdirs(file_list.dirs, config.tishadow_src);
     fs.mkdirs(i18n_list.dirs, config.tishadow_src);
     if(spec_list.files.length > 0) {
       if (!fs.existsSync(config.tishadow_spec)) {
         fs.mkdirSync(config.tishadow_spec, 0755);
       }
       fs.mkdirs(spec_list.dirs, config.tishadow_spec);
       spec_list.files = spec_list.files.map(function(file) { return "spec/" + file;});
       spec_list.dirs = ["spec"].concat(spec_list.dirs.map(function(dir) {return "spec/" + dir;}));
     }

     // using the slower sync read/write for localisation files 
     i18n_list.files.forEach(function(file, idx) {
       fs.writeFileSync(path.join(config.tishadow_src, file),fs.readFileSync(path.join(config.i18n_path,file)));
     });

     // Process Files
     prepareFiles(0, file_list, false, function() {
       prepareFiles(0, spec_list, true, function() {
          file_list.files = file_list.files.concat(i18n_list.files).concat(spec_list.files);
          finalise(file_list,callback);
       });
     });
  });
}


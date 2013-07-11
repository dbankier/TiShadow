#!/usr/bin/env node
var path = require("path"),
    fs = require("fs"),
    api = require("./api"),
    bundle = require("./bundle"),
    config = require("./config"),
    logger = require("../../server/logger.js"),
    jshint = require("./jshint_runner"),
    _ =require("underscore");

    require("./fs_extension");

// Copies all Resource files and prepares JS files
function prepare(src, dst, callback) {
  var app_name = config.app_name;
  if (src.match("js$")){ 
    var src_text = "var __ui = require('/api/UI'), __p = require('/api/PlatformRequire'), __log = require('/api/Log'), "
      + "assert = require('/api/Assert'), L = require('/api/Localisation').fetchString, "
      + "addSpy = require('api/Beach').addSpy;\n"
      + fs.readFileSync(src).toString()
      .replace(/Ti(tanium)?.Filesystem.(resourcesDirectory|getResourcesDirectory\(\))/g, "Ti.Filesystem.applicationDataDirectory + '"+app_name.replace(/ /g,"_")+"/'")
      .replace(/(^|[^\.])require\(/g, "$1__p.require(")
      .replace(/Ti(tanium)?.include\(/g, "__p.include(this,")
      .replace(/Ti(tanium)?.UI.createWindow\(/g, "__ui.createWindow(")
      .replace(/Ti(tanium)?.UI.createTabGroup\(/g, "__ui.createTabGroup(")
      .replace(/Ti.Locale.getString/g, "L")
      .replace(/([ :=\(])(['"])(\/[^'"].*?)(['"])/g, "$1__p.file($2$3$4)") // ignores "/"
      // Replace strings like ".titleid = 'save'" -> "title = L('save')"
      .replace(/\.(title|text)id\s{0,}\=\s{0,}['"](\w+)['"]/g, '.$1 = L(\'$2\')')
      // Replace strings like "titleid: 'save'" -> "title: L('save')"
      .replace(/\b(title|text)id:\s{0,}['"](\w+)['"]/g, '$1: L(\'$2\')')
      .replace(/console\./g, "__log.")
      .replace(/\/\/addSpy\(/g,"addSpy(")
      .replace(/Ti(tanium)?.API/g, "__log");
    if (src.match("_spec.js$")) {
      src_text =  "var __jasmine = require('/lib/jasmine');var methods = ['spyOn','it','xit','expect','runs','waits','waitsFor','beforeEach','afterEach','describe','xdescribe','jasmine'];methods.forEach(function(method) {this[method] = __jasmine[method];});"
        +src_text;
    }
    fs.writeFile(dst,src_text, callback);
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
  // Send the directories and files (see bundle.zip)
  bundle.pack(file_list.dirs.concat(file_list.files),function(written) { 
    logger.info(total+ " file(s) bundled."); 
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

function mapAlloyFiles(last_stat) {
  var alloy_list = fs.getList(config.alloy_path,last_stat.mtime);

  // Theme
  var theme = fs.existsSync(path.join(config.alloy_path, 'themes')) ? require(path.join(config.resources_path, 'alloy', 'CFG.js')).theme : null;
  
  // We need the dirs
  var file_list = fs.getList(config.resources_path);
  var file_list_files = file_list.files; // Keep for root changes
  file_list.files = [];

  var addAllControllers = false;
  var undouble = false;

  for (var i in alloy_list.files) {
    var file = alloy_list.files[i];
    var file_path = file.split(path.sep);
    var ln = file_path.length;
    var la = ln - 1;
  
    // Alloy root files affect all resources
    if (ln === 1) {
      logger.debug('Alloy root file triggered full push: ' + file);
      return file_list_files;
    }
    
    if (file_path[0] === 'assets' || file_path[0] === 'lib') {
      file_path.shift();
      
    } else if (file_path[0] === 'models') {
      file_path[la] = file_path[la][0].toUpperCase() + file_path[la].substr(1);
      file_path.unshift('alloy');
      
    } else if (file_path[0] === 'migrations') {        
      file_path[0] = 'models';
      file_path[la] = file_path[la].substr(15, 1).toUpperCase() + file_path[la].substr(16);
      file_path.unshift('alloy');
      
      undouble = true;
            
    } else if (file_path[0] === 'controllers') {
      file_path.unshift('alloy');
      
    } else if (file_path[0] === 'views') {
      file_path[0] = 'controllers';
      file_path[la] = file_path[la].replace('.xml', '.js');
      file_path.unshift('alloy');
      
      undouble = true;
        
    } else if (file_path[0] === 'styles') {
    
      // app.tss effects all controllers and widget controllers
      if (ln === 2 && file_path[la] === 'app.tss') {
        addAllControllers = true;
        continue;
      }
                
      file_path[0] = 'controllers';
      file_path[la] = file_path[la].replace('.tss', '.js');
      file_path.unshift('alloy');
      
      undouble = true;
      
    } else if (file_path[0] === 'themes') {
    
      // Not current theme
      if (file_path[1] !== theme) {
        logger.debug('Skipped change in unselected Alloy theme: ' + file);
        continue;
      }
      
      file_path = file_path.slice(2);
      
      if (file_path[0] === 'assets') {
        file_path.shift();

      } else if (file_path[0] === 'styles') {
        
        if (file_path.length === 2 && file_path[la] === 'app.tss') {
          addAllControllers = true;
          continue;
        }
        
        file_path[0] = 'controllers';
        file_path[file_path.length-1] = file_path[file_path.length-1].replace('.tss', '.js');
        file_path.unshift('alloy');
      
        undouble = true;
      }
      
    } else if (file_path[0] === 'widgets') {

      if (file_path[2] === 'lib' || file_path[2] === 'assets') {
        var widget = file_path[1];
        var file_name = file_path[la];
        file_path = file_path.slice(3, -1);        
        file_path.push(widget, file_name);
        
      } else if (file_path[2] === 'models') {
        file_path[la] = file_path[la][0].toUpperCase() + file_path[la].substr(1);
        file_path.unshift('alloy');
            
      } else if (file_path[0] === 'migrations') {        
        file_path[2] = 'models';
        file_path[la] = file_path[la].substr(15, 1).toUpperCase() + file_path[la].substr(16);
        file_path.unshift('alloy');
      
        undouble = true;
            
      } else if (file_path[2] === 'controllers') {
        file_path.unshift('alloy');
      
      } else if (file_path[2] === 'views') {
        file_path[2] = 'controllers';
        file_path[la] = file_path[la].replace('.xml', '.js');
        file_path.unshift('alloy');
        
        undouble = true;
        
      } else if (file_path[2] === 'styles') {
        file_path[2] = 'controllers';
        file_path[la] = file_path[la].replace('.tss', '.js');
        file_path.unshift('alloy');
        
        undouble = true;
          
      } else {
        logger.debug('Ignored: ' + file);
        continue;
      }
    
    } else {
      logger.debug('Ignored: ' + file);
      continue;
    }     
    
    var file_path_join = file_path.join(path.sep);
    file_list.files.push(file_path_join);
  }
  
  if (addAllControllers) {
    logger.debug('Alloy global style change triggered full controllers & widgets push.');
    
    var controller_files = fs.getList(path.join(config.resources_path, 'alloy', 'controllers')).files;
    var widget_files = fs.getList(path.join(config.resources_path, 'alloy', 'widgets')).files;
  
    controller_files.forEach(function (val, key, list) {
      list[key] = path.join('alloy', 'controllers', val);
    });
  
    widget_files.forEach(function (val, key, list) {
      list[key] = path.join('alloy', 'widgets', val);
    });
  
    file_list.files = file_list.files.concat(controller_files).concat(widget_files);
    
    undouble = true;
  }
  
  if (undouble) {
    logger.debug('Removing possible doubles.');
    
    var undoubled = [];
    
    file_list.files.forEach(function (val, key, list) {
      if (list.indexOf(undoubled, val) === -1) {
        undoubled.push(val);
      }
    });
    
    file_list.files = undoubled;
  }
    
  return file_list;
}

module.exports = function(env, callback) {
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
    var file_list,i18n_list,spec_list;
    if( config.isUpdate) {
       var last_stat = fs.statSync(config.last_updated_file);
       file_list = config.isAlloy ? mapAlloyFiles(last_stat) : fs.getList(config.resources_path,last_stat.mtime);
       i18n_list = fs.getList(config.i18n_path,last_stat.mtime);
       spec_list = fs.getList(config.spec_path,last_stat.mtime);

       if (file_list.files.length === 0 && i18n_list.files.length === 0 && spec_list.files.length === 0) {
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
       spec_list = fs.getList(config.spec_path);
     }

     // Build the required directory structure
     fs.mkdirs(file_list.dirs, config.tishadow_src);
     fs.mkdirs(i18n_list.dirs, config.tishadow_src);
     if(spec_list.files.length > 0) {
       fs.mkdirSync(config.tishadow_spec, 0755);
       fs.mkdirs(spec_list.dirs, config.tishadow_spec);
       spec_list.files = spec_list.files.map(function(file) { return "spec/" + file;});
       spec_list.dirs = ["spec"].concat(spec_list.dirs.map(function(dir) {return "spec/" + dir;}));
     }

     // Just pump out localisation files
     i18n_list.files.forEach(function(file, idx) {
       fs.createReadStream(path.join(config.i18n_path,file)).pipe(fs.createWriteStream(path.join(config.tishadow_src, file)));
     });

     // Process Files
     prepareFiles(0, file_list, false, function() {
       prepareFiles(0, spec_list, true, function() {
          file_list.files = file_list.files.concat(i18n_list.files).concat(spec_list.files);
          file_list.dirs = file_list.dirs.concat(i18n_list.dirs).concat(spec_list.dirs);
          finalise(file_list,callback);
       });
     });
  });
}


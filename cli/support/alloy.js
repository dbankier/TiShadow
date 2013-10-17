var fs     = require("fs"),
    path   = require("path"),
    config = require("./config"),
    logger = require("../../server/logger.js");

exports.mapFiles = function(last_stat) {
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
      file_list.files = file_list_files;
      return file_list;
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

    } else if (file_path[0] === 'controllers' && file_path[la].match(/\.js$/)) {
      file_path.unshift('alloy');

    } else if (file_path[0] === 'views' && file_path[la].match(/\.xml$/)) {
      file_path[0] = 'controllers';
      file_path[la] = file_path[la].replace('.xml', '.js');
      file_path.unshift('alloy');

      undouble = true;

    } else if (file_path[0] === 'styles' && file_path[la].match(/\.tss$/)) {

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
      la = file_path.length - 1;

      if (file_path[0] === 'assets') {
        file_path.shift();

      } else if (file_path[0] === 'styles' && file_path[la].match(/\.tss$/)) {

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

      } else if (file_path[2] === 'controllers' && file_path[la].match(/\.js$/)) {
        file_path.unshift('alloy');

      } else if (file_path[2] === 'views' && file_path[la].match(/\.xml$/)) {
        file_path[2] = 'controllers';
        file_path[la] = file_path[la].replace('.xml', '.js');
        file_path.unshift('alloy');

        undouble = true;

      } else if (file_path[2] === 'styles' && file_path[la].match(/\.tss$/)) {
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
};



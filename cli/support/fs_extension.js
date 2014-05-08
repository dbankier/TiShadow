/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var path = require("path"),
    config = require("./config"),
    fs = require("fs");


// Get Filelist with optional "update" filter
function getList(start, last_update, _path) {
  var files = [], dirs=[];
  if (!fs.existsSync(start)) {
    return {files: files, dirs: dirs};
  }
  var stat = fs.statSync(start);
  if (stat.isDirectory()) {
    var filenames = fs.readdirSync(start);
    var coll = filenames.reduce(function (acc, name) {
      var abspath = path.join(start, name);
      var file_stat = fs.statSync(abspath);
      if (name.match(/^\./) && !config.includeDotFiles) {
        // IGNORING HIDDEN FILES
      } else if (file_stat.isDirectory()) {
        acc.dirs.push(name);
      } else {
        if (last_update === undefined || last_update < file_stat.mtime) {
          acc.names.push(path.join(_path || "." , name));
        }
      }
      return acc;
    }, {"names": [], "dirs": []});
    files = coll.names;
    coll.dirs.forEach(function (d) {
      var abspath = path.join(start, d);
      var relpath = path.join(_path|| ".", d);
      dirs.push(relpath);
      var recurs = getList(abspath, last_update, relpath);
      files = files.concat(recurs.files);
      dirs = dirs.concat(recurs.dirs);
    });
  }
  return {files: files, dirs: dirs};
};

fs.getList = getList;

// Recursively Remove Directories
fs.rm_rf = function(dir) {
  var list = fs.readdirSync(dir);
  for(var i = 0; i < list.length; i++) {
    var filename = path.join(dir, list[i]);
    var stat = fs.statSync(filename);
    if(filename == "." || filename == "..") {
    } else if(stat.isDirectory()) {
      fs.rm_rf(filename);
    } else {
      fs.unlinkSync(filename);
    }
  }
  fs.rmdirSync(dir);
};

// Builds directory structure
fs.mkdirs = function(dirs, rel_root) {
  dirs.forEach(function(dir) {
    var full_path = rel_root? path.join(rel_root,dir) : dir;
    if (!fs.existsSync(full_path) ){
      fs.mkdirSync(full_path);
    }
  });
}

// Like a normal bash touch
fs.touch = function(file) {
  if (fs.existsSync(file)) {
    var now = new Date();
    fs.utimesSync(file,now,now);
  } else {
    fs.writeFileSync(file,"");
  }
}




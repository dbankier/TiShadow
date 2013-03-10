var config = require("./config"),
    fs = require("fs"),
    path = require("path"),
    zipstream = require("zipstream"),
    Stream = require('stream');;

exports.pack = function(files, callback, zip) {
  var out;
  if (zip === undefined) {
    out = fs.createWriteStream(config.bundle_file);
    zip = zipstream.createZip({level:1});
  }
  if (files.length === 0) {
    zip.finalize(callback);
  } else {
    var tail = files.splice(1);
    var stream, file = files[0];

    // Need to send empty stream for directories to force creating directory 
    // structure in the zip file. This is needed for the Android zip module.
    stats = fs.lstatSync(path.join(config.tishadow_src,file));
    if (stats.isDirectory()) {
      file = file + "/";
      stream = new Stream();
    } else {
      stream = fs.createReadStream(path.join(config.tishadow_src,file));
    }

    zip.addFile(stream, {name: file}, function() {
      exports.pack(tail,callback,zip);
    });

    if (stats.isDirectory()) {
      stream.emit('end');
    }
  }
  if (out) {
    zip.pipe(out);
  }
}


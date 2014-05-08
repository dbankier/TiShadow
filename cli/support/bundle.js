/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var config = require("./config"),
    fs = require("fs"),
    path = require("path"),
    archiver = require('archiver'),
    lazystream = require('lazystream');

// Note that only files and not directories are sent to the function
exports.pack = function(files, callback) {
  var out = fs.createWriteStream(config.bundle_file);
  out.on("close", callback);
  // Use zlib compression 1 (fastest) to overcome a bug currently in Archiver on Macs
  zip = archiver('zip', {zlib: {level: 1}});
  zip.on('error', function(err) {
    throw err;
  });
  zip.pipe(out);

  for(var i = 0, ln = files.length; i < ln; i++) {
    var file = files[i],
        filename = config.tishadow_src + '/' + file,
        stream;

    // Lazy load streams, to counteract 'too many files' error on Node
    // Lazystream only creates the actual ReadStream when a read command is received
    stream = new lazystream.Readable(function (options) {
      return fs.createReadStream(this.filename);
    });
    stream.filename = filename;

    zip.append(stream, {name : files[i]});
  }

  zip.finalize();
};


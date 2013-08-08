var config = require("./config"),
    fs = require("fs"),
    path = require("path"),
    archiver = require('archiver'),
    Stream = require('stream'),
    lazystream = require('lazystream');

// Note that only files and not directories are sent to the function
exports.pack = function(files, callback) {
  var out = fs.createWriteStream(config.bundle_file);
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

    // Archiver takes care of the async nature of reading streams
    // Starting to read the next stream when the previous stream has closed
    // Thus it is save to append them all here
    zip.append(stream, {name : files[i]});
  }

  zip.finalize(function(err, written) {
    callback(err, written);
  });
};


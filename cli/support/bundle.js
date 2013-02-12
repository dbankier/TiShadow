var config = require("./config"),
    fs = require("fs"),
    path = require("path"),
    zipstream = require("zipstream");

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
    zip.addFile(fs.createReadStream(path.join(config.tishadow_src,files[0])), {name: files[0]}, function() {
      exports.pack(tail,callback,zip);
    });
  }
  if (out) {
    zip.pipe(out);
  }
}


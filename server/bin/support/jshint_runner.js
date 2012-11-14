var jshint = require("jshint").JSHINT,
    logger = require("../../logger"),
    fs = require("fs"),
    path =require("path");


exports.checkContent = function(filename, filecontent) {
  if (!jshint(filecontent)) {
    jshint.data().errors.forEach(function(error) {
      logger.error(filename + " line: " + error.line + ", column:" + error.character + ", " + error.reason);
    });
  }
};

exports.checkPath = function(target_path) {
  fs.getList(target_path).files.forEach(function(file) {
    if (file.match("js$") || file.match("json$")) {
      exports.checkContent(file, fs.readFileSync(path.join(target_path, file)).toString());
    }
  });
};

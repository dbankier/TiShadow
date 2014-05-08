/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var jshint = require("jshint").JSHINT,
    logger = require("../../server/logger"),
    fs = require("fs"),
    path =require("path");


exports.checkContent = function(filename, filecontent) {
  if (!jshint(filecontent)) {
    jshint.data().errors.forEach(function(error) {
      logger.error(filename + (error ? " line: " + error.line + ", column:" + error.character + ", " + error.reason : "") );
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

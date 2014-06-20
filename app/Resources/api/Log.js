/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var logLevels = ['info', 'error', 'debug', 'trace', 'repl', 'warn', 'pass', 'fail', 'test', 'cover'];

logLevels.forEach(function(level) {
  exports[level] = function() {
    Array.prototype.unshift.call(arguments, level);
    _write.apply(null, arguments);
  };
});

exports.log = function(level) {
  // If the value of level is not recognized,
  // an info-level message prefixed with the value is logged.
  // http://docs.appcelerator.com/titanium/latest/#!/api/Titanium.API-method-log
  if (logLevels.indexOf(level) === -1) {
    Array.prototype.unshift.call(arguments, 'info');
  }
  _write.apply(null, arguments);
};

function _write() {
  var upperCaseLevel = Array.prototype.shift.call(arguments).toUpperCase();

  Array.prototype.forEach.call(arguments, function(msg, i, messages) {
    if (typeof msg === 'object') {
      messages[i] = JSON.stringify(msg, function(key, val) {
        if (typeof val !== 'object') {
          return val;
        }
        try {
          JSON.stringify(val);
          return val;
        } catch (err) {
          return undefined;
        }
      }, 4);
    }
  });

  require("/api/TiShadow").emitLog({
    level: upperCaseLevel,
    message: Array.prototype.join.call(arguments, ' ')
  });
}


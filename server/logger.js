var config = require("./bin/support/config");
require('colors');

color = {
  DEBUG: 'blue',
  WARN: 'yellow',
  REPL: 'grey',
  TRACE: 'grey',
  ERROR: 'red',
  FAIL: 'red',
  PASS: 'green'
};

exports.log = function(level, name, msg) {
  var msg =  "[" + level + "] "  
  + (name ? "[" + name + "] ": "")
  + msg;
  if (color[level]) {
    msg = msg[color[level]];
  };
  if (config.isREPL) {
    process.stdout.write("\r" + msg + "\n> ");
  }else {
    console.log(msg);
  }
}

var levels = ['info','debug','error'];
levels.forEach(function(level) {
  exports[level] = function(msg) {
    exports.log(level.toUpperCase(),null,msg);
  }
});

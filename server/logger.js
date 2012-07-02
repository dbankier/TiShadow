require('colors');

color = {
  DEBUG: 'blue',
  WARN: 'yellow',
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
  console.log(msg);
}

var levels = ['info','debug','error'];
levels.forEach(function(level) {
  exports[level] = function(msg) {
    exports.log(level.toUpperCase(),null,msg);
  }
});

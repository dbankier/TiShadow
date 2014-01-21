var spawn = require('child_process').spawn;
module.exports = function(cmd,args) {
  if (process.platform === 'win32') {
    args = ['/c',cmd].concat(args);
    cmd = process.env.comspec;
  }
  return spawn(cmd,args);
}


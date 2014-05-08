/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var spawn = require('child_process').spawn;
module.exports = function(cmd,args) {
  if (process.platform === 'win32') {
    args = ['/c',cmd].concat(args);
    cmd = process.env.comspec;
  }
  return spawn(cmd,args);
}


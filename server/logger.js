/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var path = require('path');
require('colors');

color = {
  DEBUG: 'blue',
  WARN: 'yellow',
  REPL: 'grey',
  TRACE: 'grey',
  ERROR: 'red',
  FAIL: 'red',
  PASS: 'green',
  COVER : 'yellow'
};

exports.log = function(level, name, msg) {
  var config = require("../cli/support/config");
  if(config.errorNotification && (level === 'ERROR' || level ==='FAIL')){
    var notifier = require('node-notifier');
    notifier.notify({
      title: level,
      message: msg,
      icon: path.join(__dirname, '..','app','Resources','iphone','appicon@2x.png'), 
      sound: true,
      wait: true,
      timeout: 5
    },function (err, response) {
    });
  }
  
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
};

var levels = ['info','debug','error','warn', 'cover'];
levels.forEach(function(level) {
  exports[level] = function(msg) {
    exports.log(level.toUpperCase(),null,msg);
  };
});

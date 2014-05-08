/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var _ = require("/lib/underscore");
var events = {};
module.exports = {
  addEventListener: function(api, name, fn) {
    Ti[api].addEventListener(name, fn);
    if (events[api]) {
      if (events[api][name]) {
        events[api][name].push(fn);
      } else {
        events[api][name] = [fn];
      }
    } else {
      events[api] = {};
      events[api][name] = [fn];
    }
  },
  removeEventListener: function(api, name, fn) {
    Ti[api].removeEventListener(name, fn);
    if (events[api] && events[api][name]) {
      events[api][name] = _.without(events[api][name], fn);
    }
  },
  fireEvent: function(api, name, o) {
    Ti[api].fireEvent(name, o);
  },
  clearAll: function() {
    _.keys(events).forEach(function(api) {
      _.keys(events[api]).forEach(function(name) {
        events[api][name].forEach(function(fn) {
          Ti[api].removeEventListener(name, fn);
        });
      });
    });
    events = {};
  }
};

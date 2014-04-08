var _ = require("/lib/underscore");
var events = {};
module.exports = {
  addEventListener: function(name, fn) {
    Ti.App.addEventListener(name, fn);
    if (events[name]) {
      events[name].push(fn);
    } else {
      events[name] = [fn];
    }
  },
  removeEventListener: function(name, fn) {
    Ti.App.removeEventListener(name, fn);
    if (events[name]) {
      events[name] = _.without(events[name], fn);
    }
  },
  fireEvent: function(name, o) {
    Ti.App.fireEvent(name, o);
  },
  clearAll: function() {
    for (var name in events) {
      if (events.hasOwnProperty(name)) {
        events[name].forEach(function(fn) {
          Ti.App.removeEventListener(name, fn);
        });
      }
    }
    events = {};
  }
};

var _ = require("/lib/underscore");
var events = {};
module.exports = {
  addEventListener: function(name, fn) {
    if (events[name]) {
      events[name].push(fn);
    } else {
      events[name] = [fn];
    }
  },
  removeEventListener: function(name, fn) {
    if (events[name]) {
      events[name] = _.without(events[name], fn);
    }
  },
  fireEvent: function(name, o) {
    if (events[name]) {
      events[name].forEach(function(fn) {
        fn(o);
      });
    }
  },
  clearAll: function() {
    events = {};
  }
};

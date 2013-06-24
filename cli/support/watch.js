var
  watchr   = require('watchr'),
  compiler = require('./compiler');

function Watcher() {};
Watcher.idling = true; // static
Watcher.prototype.watcherInstance = null;

Watcher.prototype.handleError = function(err) {
  if (watcherInstance) this.watcherInstance.close();
  console.err("An error occured: " + err);
}
Watcher.prototype.collectWatcher = function(err, watcher) {
  this.watcherInstance = watcher;
}
Watcher.prototype.watch = function(env) {
    that = this;
    console.log("Monitoring changes ...")
    watchr.watch({
      path: '.',
      next: that.collectWatcher,
      listeners: {
        error: that.handleError,
        change: function(changeType,filePath,fileCurrentStat,filePreviousStat) {
          if (Watcher.idling && !~ filePath.indexOf('tishadow')) {
            console.log("Change received on " + filePath);
            Watcher.idling = false;
            compiler(env, function() {
              Watcher.idling = true;
            });
          }
          // console.log(arguments);
        }
      }
    });
  }

module.exports = new Watcher;
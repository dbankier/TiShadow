
['info','error','debug','trace','repl','warn','pass','fail','test'].forEach(function(level){
  exports[level] = function(message) {
  	_write(level, message);
  };
});

exports.log = function(level, message) {
	if (typeof message === 'undefined') {
		message = level;
		level = 'info';
	}
	_write(level, message);
};

function _write(level, message) {
  	if (typeof message === 'object') {
  		message = JSON.stringify(message, function (key, val) {
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
    require("/api/TiShadow").emitLog({
      level: level.toUpperCase(),
      message: message
    });
}
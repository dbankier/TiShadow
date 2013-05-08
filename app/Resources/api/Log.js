
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
  		message = JSON.stringify(message, null, 4);
  	}
    require("/api/TiShadow").emitLog({
      level: level.toUpperCase(),
      message: message
    });
}
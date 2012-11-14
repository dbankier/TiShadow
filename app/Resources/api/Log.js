
['info','error','debug','trace','repl','warn','pass','fail','test'].forEach(function(level){
  exports[level] = function(message) {
    require("/api/TiShadow").emitLog({
      level: level.toUpperCase(),
      message: message
    });
  };
});


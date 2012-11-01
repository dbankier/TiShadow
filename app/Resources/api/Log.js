
['info','error','debug','trace','warn','pass','fail','test'].forEach(function(level){
  exports[level] = function(message) {
    require("/api/TiShadow").emitLog({
      level: level.toUpperCase(),
      message: message
    });
  };
});


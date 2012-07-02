['info','error','debug','trace','warn','pass','fail','test'].forEach(function(level){
  exports[level] = function(message) {
    Ti.App.fireEvent("tishadow:socket_log", {
      level: level.toUpperCase(),
      message: message
    });
  };
});


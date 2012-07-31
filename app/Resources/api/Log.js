['info','error','debug','trace','warn','pass','fail','test'].forEach(function(level){
	if (level == 'error') {
		exports[level] = function(e) {

			var temp = e.stack.split("\n");
	
			var myerror = {};
	
			for (var i = 0; i < 2; i++) {
				temp[i] = temp[i].split(":");
			}
			myerror.message = temp[0][1].substr(1);
			myerror.file = temp[1][0].substr(7);
			myerror.line = temp[1][1];
	
			var message = "Line: " + myerror.line + "\n" + "File: " + myerror.file + "\n" + "Message: " + myerror.message;
	
			Ti.App.fireEvent("tishadow:socket_log", {
				level : level.toUpperCase(),
				message : message
			});
		};
	}
	else {
		exports[level] = function(message) {

			Ti.App.fireEvent("tishadow:socket_log", {
				level : level.toUpperCase(),
				message : message
			});
		}; 
	}
  
	

});


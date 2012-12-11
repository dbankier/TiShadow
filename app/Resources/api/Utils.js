
//get platform specific exception data
var extractExceptionData;

if (Ti.UI.Android) {
	extractExceptionData = function(e) {
    if (e.stack === undefined) {
      return JSON.stringify(e);
    }

		var temp = e.stack.split("\n");
		var myerror = {};
		var exceptionTypeAndMessage = temp[0].split(":");
		for (var i = 1; i < 2; i++) {
			temp[i] = temp[i].split(":");
		}
		myerror.type = exceptionTypeAndMessage[0];
		myerror.message = exceptionTypeAndMessage[1].substr(1);
		
    var file = e.file || "";
		var parts = file.replace(/\/+/g, "/").split('/');

		var appIndexOf = parts.indexOf('appdata-private:');
		if (appIndexOf > -1) {
			myerror.file = '/' + parts.slice(appIndexOf + 2).join('/') + ".js";
		}
		else {
			myerror.file = temp[1][0].split("(").slice(1).join(": ");
		}
		
		myerror.line = temp[1][1];

    myerror.at = temp[1][0].split("(")[0].replace("at ","");

		return "\nType: " + myerror.type +
           "\nMessage: " + myerror.message +
           "\nFile: " + myerror.file +
           "\nLine: " + myerror.line +
           "\nAt:   " + myerror.at.trim();
	};
} else if (Ti.UI.iOS) {
	extractExceptionData = function(e) {
	  if (e.file === undefined) {
      return e.toString();
    }
		var parts = e.file.replace(/\/\//g,'/').split('/');
		var file;
		var resIndexOf = parts.indexOf('Documents');
		
		if (resIndexOf > -1) {
			file = '/' + parts.slice(resIndexOf + 2).join('/') + ".js";
		}
		else {
			file = e.file;
		}
		return "\nType: " + e.name + 
      "\nMessage: " + e.message +
      "\nFile: " + file + 
      "\nLine: " + e.line;
	};
} else {
	extractExceptionData = function(e) {
		//TODO: See how to get better info on MW and BB platforms
		return "\nMessage: " + e.message;
	}
}

exports.extractExceptionData = extractExceptionData;

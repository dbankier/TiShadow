
//get platform specific exception data
var extractExceptionData;

if (Ti.UI.Android) {
	extractExceptionData = function(e) {
		var temp = e.stack.split("\n");
		var myerror = {};
		var exceptionTypeAndMessage = temp[0].split(":");
		for (var i = 1; i < 2; i++) {
			temp[i] = temp[i].split(":");
		}
		myerror.type = exceptionTypeAndMessage[0];
		myerror.message = exceptionTypeAndMessage[1].substr(1);
		
		var parts = temp[1][0].split('/');

		var appIndexOf = parts.indexOf('app_appdata');
		
		if (appIndexOf > -1) {
			myerror.file = '/' + parts.slice(appIndexOf + 2).join('/');
		}
		else {
			myerror.file = temp[1][0];
		}
		
		myerror.line = temp[1][1];

		return "\nType: " + myerror.type + "\nLine: " + myerror.line + "\nFile: " + myerror.file + "\n" + "Message: " + myerror.message;
	}
} else if (Ti.UI.iOS) {
	extractExceptionData = function(e) {
		
		var parts = e.file.split('/');
		var file;
		var resIndexOf = parts.indexOf('Resources');
		
		if (resIndexOf > -1) {
			file = '/' + parts.slice(resIndexOf + 1).join('/');
		}
		else {
			file = e.file;
		}
		return "\nType: " + e.name + "\nLine: " + e.line + "\nFile: " + file + "\nMessage: " + e.message;
	}
} else {
	extractExceptionData = function(e) {
		//TODO: See how to get better info on MW and BB platforms
		return "\nMessage: " + e.message;
	}
}

exports.extractExceptionData = extractExceptionData;
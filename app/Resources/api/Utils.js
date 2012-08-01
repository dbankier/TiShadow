
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
		myerror.file = temp[1][0].substr(7);
		myerror.line = temp[1][1];

		return "\nType: " + myerror.type + "\nLine: " + myerror.line + "\n" + "File: " + myerror.file + "\n" + "Message: " + myerror.message;
	}
} else if (Ti.UI.iOS) {
	extractExceptionData = function(e) {
		return "\nType: " + e.name + "\nLine: " + e.line + "\nMessage: " + e.message;
	}
} else {
	extractExceptionData = function(e) {
		//TODO: See how to get better info on MW and BB platforms
		return "\nMessage: " + e.message;
	}
}

exports.extractExceptionData = extractExceptionData;
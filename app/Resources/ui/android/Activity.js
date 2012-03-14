/*globals exports*/
/*
 * CAREFUL: I'm trying to start using CommonJS modules. This is one.
 */

var activity_indicator;
exports.Activity = function(message) {
	activity_indicator = Titanium.UI.createActivityIndicator({
		bottom : 10,
		height : 50,
		width : 10,
		style : Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN,
		message : message
	});
};

exports.Activity.prototype.show = function() {
	activity_indicator.show();
};
exports.Activity.prototype.hide = function() {
	activity_indicator.hide();
};
exports.Activity.prototype.setMessage = function(text) {
	activity_indicator.message = text;
};

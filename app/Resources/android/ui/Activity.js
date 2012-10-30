/*globals exports*/
/*
 * CAREFUL: I'm trying to start using CommonJS modules. This is one.
 */

var activity_indicator;
function Activity(message) {
	activity_indicator = Titanium.UI.createActivityIndicator({
		bottom : 10,
		height : 50,
		width : 10,
		message : message
	});
};

Activity.prototype.show = function() {
	activity_indicator.show();
};
Activity.prototype.hide = function() {
	activity_indicator.hide();
};
Activity.prototype.setMessage = function(text) {
	activity_indicator.message = text;
};

module.exports = Activity;

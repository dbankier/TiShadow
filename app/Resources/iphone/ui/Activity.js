/*globals exports*/
/*
 * CAREFUL: I'm trying to start using CommonJS modules. This is one.
 */

var activity_win, activity_view, activity_label;
var osname = Ti.Platform.osname;
var screenHeight = Ti.Platform.displayCaps.platformHeight;
var screenWidth = Ti.Platform.displayCaps.platformWidth;

function Activity(message) {
	activity_win = Titanium.UI.createWindow({
		backgroundColor : '#000',
		top : 0,
		bottom : 0,
		left : 0,
		right : 0,
		opacity : 0.70
	});
	activity_view = Titanium.UI.createView({
		width : 280,
		height : 90,
		backgroundColor : '#000',
		borderWidth : 2,
		borderRadius : 10,
		borderColor : '#999'
	});

	var activity_indicator = Titanium.UI.createActivityIndicator({
		color : '#fff',
		style : Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
		height : 20,
		width : 20,
		left : 25
	});
	activity_label = Ti.UI.createLabel({
		left : 70,
		color : '#fff',
		font : {
			fontWeight : 'bold',
			fontSize : '16'
		},
		text : message
	});
	activity_view.add(activity_label);
	activity_view.add(activity_indicator);
	activity_indicator.show();
	activity_win.add(activity_view);
};

Activity.prototype.show = function(win) {
	activity_view.show();
	if(win == null) {
		activity_win.height = screenHeight;
		activity_view.opacity = 1;
		activity_win.open();
	} else {
		this.coverView = Ti.UI.createView();
		activity_view.opacity = 0.90;
		activity_view.bottom = win.height * 0.48;
		win.add(this.coverView);
		win.add(activity_view);
	}
};
Activity.prototype.hide = function(win) {
	activity_view.hide();
	if(win == null) {
		activity_win.height = 0;
		activity_win.close();
	} else {
		win.remove(this.coverView);
		this.coverView = null;
		win.remove(activity_view);
	}
};
Activity.prototype.setMessage = function(text) {
	activity_label.text = text;
};

module.exports = Activity;

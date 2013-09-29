/*global exports,require*/
var _ = require("/lib/underscore");

var textField = {
  top : "50dp",
  height : "40dp",
  color: 'black',
  borderRadius: 5,
  backgroundColor : 'white',
  textAlign : 'center',
  font : {
    fontSize : "18dp"
  },
  autocorrect: false,
  autocapitlization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE
};

var tab = {
  textAlign: 'center',
  font: {fontWeight: 'bold', fontSize: '14dp'},
  bottom: 0,
  color: 'black',
  width: '50%',
  height: '30dp'
};


exports.login = {
	container : {
		height : "190dp",
		width : "300dp",
		borderRadius : "20",
		backgroundColor : "#d6e0f0"
	},
	header : {
		top : "10dp",
		height : "30dp",
		font : {
			fontSize : "16dp",
			fontWeight : 'bold'
		},
		color: 'black',
		text : "Connect to TiShadow Server",
		textAlign : 'center'
	},
	host : _.defaults({
		left: "10dp",
    width : "280dp",
    height: "40dp",
		hintText : "IP Address"
	}, textField),
  port : _.defaults({
    right: "10dp",
    width : "65dp",
    hintText : "Port",
    visible: false
  }, textField),
  colon : _.defaults({
    left: "215dp",
    width : "10dp",
    text : ":",
    backgroundColor: 'transparent',
    visible: false
  }, textField),
  room: _.defaults({
		top : "95dp",
		left: "10dp",
    width : "280dp",
		hintText : "Room",
    visible: false
	}, textField),
  leftTab: _.defaults({
    text: 'Standard',
    left: 0
  }, tab),
  rightTab: _.defaults({
    text: 'Advanced',
    backgroundColor: "#4377d2",
    right: 0
  },tab),
  button : {
    height : '40dp',
    width : '280dp',
    color : 'white',
    backgroundColor : "#4377d2",

    font : {
      fontSize : '16dp',
      fontWeight : 'bold'
    },
    borderRadius : '10',
    bottom : '50dp',
    title : "Connect"
  }
};
exports.isPost7 = (Ti.Platform.osname === "iphone" || Ti.Platform.osname === "ipad") &&
	Ti.Platform.version.split(".")[0] >= 7;

exports.start = {
	window: {
    backgroundColor : 'white',
    exitOnClose : true,
    keepScreenOn: true,
    title: "TiShadow"
  }
};
if (exports.isPost7) {
	exports.start.window.top = 20;
  Ti.UI.setBackgroundColor('#adbedd');
}
if(Ti.Platform.osname !== "android") {
	exports.login.button.backgroundImage = 'none';
  exports.login.host.backgroundImage = 'none';
}

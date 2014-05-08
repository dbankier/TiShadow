/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

/*global exports,require*/
var _ = require("/lib/underscore");

var textField = {
  top : "50dp",
  height : "40dp",
  color: 'black',
  backgroundColor : 'white',
  borderWidth: '1dp',
  borderColor: '#f0f0f0',
  textAlign : 'center',
  font : {
    fontSize : "18dp"
  },
  autocorrect: false,
  autocapitlization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE
};

var tab = {
  textAlign: 'center',
  bottom: 0,
  color: 'black',
  width: '50%',
  height: '40dp'
};


exports.login = {
	container : {
		height : "190dp",
		width : "300dp",
		backgroundColor : "white"
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
    borderColor: 'transparent',
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
    font: {fontWeight: 'bold', fontSize: '14dp'},
    left: 0
  }, tab),
  rightTab: _.defaults({
    text: 'Advanced',
    font: {fontSize: '14dp'},
    backgroundColor: "#f8f8f8",
    right: 0
  },tab),
  button : {
    height : '40dp',
    width : '280dp',
    color : '#2192E3',
    backgroundColor : "#f8f8f8",

    font : {
      fontSize : '16dp',
      fontWeight : 'bold'
    },
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
    navBarHidden: true,
    keepScreenOn: true,
    title: "TiShadow"
  }
};
if (exports.isPost7) {
	exports.start.window.top = 20;
  Ti.UI.setBackgroundColor('#f8f8f8');
}
if(Ti.Platform.osname !== "android") {
	exports.login.button.backgroundImage = 'none';
  exports.login.host.backgroundImage = 'none';
}

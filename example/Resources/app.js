/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var win = Ti.UI.createWindow({
	backgroundColor: '#fff',
	fullscreen: false,
	exitOnClose: true
});
var label = Ti.UI.createLabel({
	text: L("hello.world") + "!",
	color: 'red',
	font: {
		fontSize: 32,
		fontWeight: 'bold'
	}
});
win.add(label);

win.open();

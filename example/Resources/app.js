var win = Ti.UI.createWindow({
	backgroundColor: '#fff',
	fullscreen: false,
	exitOnClose: true
});
var label = Ti.UI.createLabel({
	text: 'Hello, World!',
	color: '#000',
	font: {
		fontSize: 32,
		fontWeight: 'bold'
	}
});
win.add(label);

win.open();
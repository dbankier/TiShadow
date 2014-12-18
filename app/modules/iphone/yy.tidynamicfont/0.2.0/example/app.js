
var TiDynamicFont = require('yy.tidynamicfont');
Ti.API.info("module is => " + TiDynamicFont);
var file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "comic_zine_ot.otf");
TiDynamicFont.registerFont(file);

// open a single window
var win = Ti.UI.createWindow({
	backgroundColor:'white'
});
var label = Ti.UI.createLabel({
  text: "Hello World",
  font:{fontSize:54,fontFamily:"Comic Zine OT"}
});
win.add(label);
win.open();


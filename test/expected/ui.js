var win = Ti.UI.createWindow({
    backgroundImage: __p.file("app.png"),
    rightButton: __p.file("catchMe.png")
});

view.generateImage = function() {};

params.image = null;

$.myview.setSelectedImage(__p.file("app.png"));

win.backgroundImage = __p.file("app.png");

win.backgroundImage = __p.file("/images" + variable + "/app.png");
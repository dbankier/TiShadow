var log = require("/api/Log");

var width = Ti.Platform.displayCaps.platformWidth / 4;
var icon_width = width - 20;
icon_width = icon_width  / (Ti.Platform.osname === "android" ? Ti.Platform.displayCaps.logicalDensityFactor : 1) > 72 ? 72 : icon_width;

function createIcon(o, idx) {
  var view = Ti.UI.createView({
    width: width,
    height: width + 30,
    left: width * (idx % 4),
    top: (width + 30) * (Math.floor(idx / 4)) + 20,
    app: o.app
  });

  view.add(Ti.UI.createView({
    touchEnabled: false,
    backgroundImage: o.image,
    borderRadius: 10,
    top: "10dp",
    width: icon_width + "dp",
    height: icon_width + "dp"
  }));

  view.add(Ti.UI.createLabel({
    top: icon_width + 10 + "dp",
    font: {
      fontSize: '10dp',
      fontWeight: 'bold'
    },
    height: 20 + "dp",
    textAlign: 'center',
    color: 'black',
    text: o.title,
    touchEnabled: false
  }));

  return view;
}

function AppList() {
  var view = Ti.UI.createScrollView({
    top: "40dp", 
    bottom: "20dp",
    left: 0,
    right: 0,
    contentHeight: 'auto'
  });


  function refreshList() {
    //Remove the children
    if(view.children != null && view.children.length > 0) {
      view.children.forEach(function(child) {
        view.remove(child);
      });
    }
    // Troll Cache
    var data = [];
    var count = 0;
    var files = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory).getDirectoryListing();
    files.forEach(function(file_name) {
      //test application directory
      if (file_name.indexOf(".") === -1) {
        var app_js = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,file_name,'app.js');
        if (app_js.exists()) { // APPLICATION DIRECTORY
          var icon_path = Ti.Filesystem.applicationDataDirectory + file_name + '/iphone/appicon.png';
          var icon = Ti.Filesystem.getFile(icon_path);
          if (!icon.exists()) {
            icon_path =  Ti.Filesystem.applicationDataDirectory + file_name + '/android/appicon.png';
          } 
          view.add(createIcon({title: file_name.replace(/_/g, " "), image: icon_path, color: 'black', app: file_name}, count++));
          //data.push( {title: file_name.replace(/_/g, " "), image: icon_path, color: 'black', app: file_name});
        }
      }
    });
    //view.data = data.length > 0 ? data : [{title: "No apps cached"}];
  }
  refreshList();
  view.addEventListener('click', function(e) {
    if (e.source.app !== undefined) {
      view.fireEvent('launch', {app: e.source.app});
    }
  });
  view.refreshList = refreshList;
  return view;
}

module.exports = AppList;

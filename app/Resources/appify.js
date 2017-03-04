/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

/*
 * This is a template used when TiShadow "appifying" a titanium project.
 * See the README.
 */
var _ = require("/lib/underscore");

Titanium.App.idleTimerDisabled = true;

var TiShadow = require("/api/TiShadow");
TiShadow.Appify = "{{app_name}}";
var Compression = require('ti.compression');
require("/lib/ti-mocha");

// If new install clear cache
if (Ti.App.Properties.getString("tishadow::container_version",0) !== "{{date}}") {
  TiShadow.clearCache(true);
  Ti.App.Properties.setString("tishadow::container_version","{{date}}");
}


// Need to unpack the bundle on a first load;
var path_name = "{{app_name}}".replace(/ /g,"_");
var target = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, path_name);
if (!target.exists()) {
  target.createDirectory();
  Compression.unzip(Ti.Filesystem.applicationDataDirectory + "/" + path_name, Ti.Filesystem.resourcesDirectory + "/" + path_name + '.zip',true);
}

var host;

if(Ti.App.deployType !== 'production' && Ti.App.Properties.getString('tishadow_host',null)){
  host = Ti.App.Properties.getString('tishadow_host');
} else if(Ti.Platform.model === "Simulator") {
  host = "127.0.0.1";
}else if(Ti.Platform.manufacturer === "unknown") {
  host = "10.0.2.2";
}else if(Ti.Platform.manufacturer === "Genymotion") {
  host = "10.0.3.2";
}else {
  host = "{{host}}";
}

(function(){
  if(Ti.App.deployType !== 'production'){
    var isShakeWinOpened = false;
    var win = Ti.UI.createWindow({
      backgroundColor : 'white',
      title : 'tishadow setting',
      layout: 'vertical'
    });
    win.addEventListener('open', function (e) {
      isShakeWinOpened = true;
    });
    win.addEventListener('close', function (e) {
      isShakeWinOpened = false;
    });
    var field = Ti.UI.createTextField({
      height : 44,
      borderColor : 'gray',
      left : 40,
      right : 40,
      hintText: 'host for tishadow',
      textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
      suppressReturn : true,
      color : 'black',
      top : 10
    });
    var btn = Ti.UI.createButton({
      title : 'Save & Close',
      left : 40,
      right : 40,
      height: 44,
      top : 10
    });
    var saveAndClose = function () {
      Ti.App.Properties.setString('tishadow_host',field.value);
      var history = Ti.App.Properties.getList('tishaodw_host_history',[]);
      history.unshift(field.value);
      history = _.uniq(history);
      Ti.App.Properties.setList('tishaodw_host_history',history);
      win.close();
    };
    btn.addEventListener('click', saveAndClose);
    field.addEventListener('return', saveAndClose);

    win.add(Ti.UI.createLabel({
      font:{
        fontSize : 15,
        fontWeight : 'bold'
      },
      text: 'TiShadow Server IP',
      top : 30
    }))
    win.add(field);
    win.add(btn);

    var listView = Ti.UI.createListView({
      defaultItemTemplate : Titanium.UI.LIST_ITEM_TEMPLATE_SUBTITLE
    });
    var section = Ti.UI.createListSection();
    listView.sections = [section];
    var items = _.map(Ti.App.Properties.getList('tishaodw_host_history',[]),function (ip) {
      return {
        properties:{
          itemId : ip,
          title : ip
        }
      }
    });
    var currentIp = Ti.Platform.address;
    items.unshift({
      properties: {
        itemId : currentIp,
        title : currentIp,
        subtitle : 'Current IP'
      }
    })
    section.items = items;
    listView.addEventListener('itemclick', function (e) {
      field.value = e.itemId;
    });
    win.add(listView);
    
    Ti.Gesture.addEventListener('shake', function (e) {
      if(isShakeWinOpened == false){
        field.value = Ti.App.Properties.getString('tishadow_host','') || host;
        win.open();
      }
    });
  }
})();

//Call Home
TiShadow.connect({
  proto: "{{proto}}",
  host : host,
  port : "{{port}}",
  room : "{{room}}",
  name : Ti.Platform.osname + ", " + Ti.Platform.version + ", " + Ti.Platform.address
});

//Use LogCatcher
var Logger = require("yy.logcatcher");
Logger.addEventListener("error", function(e) {
  var Log = require("/api/Log");
  delete e.source;
  delete e.type;
  delete e.bubbles;
  delete e.cancelBubble;
  Log.error(JSON.stringify(e, null, "  "));
});

//Launch the app
TiShadow.launchApp(path_name);

/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var log = require('/api/Log');
var TiShadow = require('/api/TiShadow');
exports.locale = Titanium.Locale.currentLanguage;
var lookup = null;
function loadFile() {
  lookup = {};
  var file = Ti.Filesystem.getFile(
    Ti.Filesystem.applicationDataDirectory +
      TiShadow.currentApp +
      '/' +
      exports.locale +
      '/strings.xml'
  );
  if (!file.exists()) {
    file = Ti.Filesystem.getFile(
      Ti.Filesystem.applicationDataDirectory +
        TiShadow.currentApp +
        '/en/strings.xml'
    );
    if (!file.exists()) {
      log.warn(
        Ti.Filesystem.applicationDataDirectory +
          TiShadow.currentApp +
          '/' +
          exports.locale +
          '/strings.xml'
      );
      log.warn(
        "Language file for both '" +
          exports.locale +
          "' and 'en' fallback do not exist"
      );
      return;
    }
  }
  var xml_string = file.read().text;
  var doc = Ti.XML.parseString(xml_string);
  var strings = doc.getElementsByTagName('string');
  for (var i = 0; i < strings.length; i++) {
    var node = strings.item(i);
    var value = node.textContent;
    if (node.hasAttributes()) {
      for (var att_index = 0; att_index < node.attributes.length; att_index++) {
        var att = node.attributes.item(att_index);
        if (att.nodeName === 'name') {
          lookup[att.nodeValue] = value;
        }
      }
    }
  }
}
exports.clear = function () {
  lookup = null;
};
exports.fetchString = function (string, hint) {
  if (lookup === null) {
    loadFile();
  }
  return lookup[string] !== undefined
    ? lookup[string].replace(/\\n/g, '\n')
    : hint !== undefined
    ? hint
    : string;
};

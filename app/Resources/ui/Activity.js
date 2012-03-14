/*globals exports*/
/*
 * CAREFUL: I'm trying to start using CommonJS modules. This is one.
 */
var Activity = require('/ui/'+ (Ti.Platform.osname == "android" ? 'android' : 'ios') + '/Activity').Activity;
exports.Activity = Activity; 

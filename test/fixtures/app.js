/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

Ti.App.addEventListener("click", function() {
  alert("hi");
});
Ti.App.fireEvent("click");
Ti.Gesture.fireEvent("click");
Ti.Geolocation.fireEvent("click");
Ti.App.removeEventListener("asddf", myFunction)

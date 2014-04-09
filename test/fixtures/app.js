Ti.App.addEventListener("click", function() {
  alert("hi");
});
Ti.App.fireEvent("click");
Ti.Gesture.fireEvent("click");
Ti.Geolocation.fireEvent("click");
Ti.App.removeEventListener("asddf", myFunction)

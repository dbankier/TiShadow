__app.addEventListener("App", "click", function() {
    alert("hi");
});

__app.fireEvent("App", "click");

__app.fireEvent("Gesture", "click");

__app.fireEvent("Geolocation", "click");

__app.removeEventListener("App", "asddf", myFunction);
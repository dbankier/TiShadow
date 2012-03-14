/*
 * Event Listeners
 */
$(document).ready(function() {
	var socket;
	Ti.App.addEventListener('socket:connect', function(e) {
		$.ajax({
			url : "http://" + e.address + ":3000/socket.io/socket.io.js",
			dataType : "script",
			timeout: 5000,
			crossDomain: true,
			success : function() {
				socket = io.connect('http://' + e.address + ':3000', {
					'connect timeout' : 5000
				});

				socket.on("connect", function() {
					socket.emit("join", {
						name : e.name
					});
					Ti.App.fireEvent("connected");
				});

				socket.on("connect_failed", function() {
					Ti.App.fireEvent("connectfailed");
				});

				socket.on('message', function(data) {
					Ti.App.fireEvent("message", data);
				});

				socket.on('disconnect', function() {
					io.disconnect();
					Ti.App.fireEvent("disconnected");
				});
			},
			error : function() {
				Ti.App.fireEvent("connectfailed");
			}
		});
	});

	Ti.App.addEventListener('socket:disconnect', function() {
		io.disconnect();
	});
});

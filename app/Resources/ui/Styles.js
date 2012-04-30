/*global exports,require*/

exports.button = {
	height : '40dp',
	width : '280dp',
	color : 'white',
	backgroundColor : "#4377d2",

	font : {
		fontSize : '16dp',
		fontWeight : 'bold'
	},
	borderRadius : '10',
	bottom : '20dp',
	title : "Connect"
};


exports.text = {
	container : {
		height : "200dp",
		width : "300dp",
		borderRadius : "20",
		backgroundColor : "#d6e0f0"
	},
	header : {
		top : "20dp",
		height : "30dp",
		font : {
			fontSize : "20dp",
			fontWeight : 'bold'
		},
		color: 'black',
		text : "Connect to Local Computer",
		textAlign : 'center'
	},
	host : {
		top : "70dp",
		height : "50dp",
		width : "280dp",
    borderRadius: 5,
		backgroundColor : 'white',
		textAlign : 'center',
		font : {
			fontSize : "20dp"
		},
		hintText : "IP Address"
	}
};

if(Ti.Platform.osname !== "android") {
	exports.button.backgroundImage = 'none';
  exports.text.host.backgroundImage = 'none';
}

/*global exports,require*/

exports.button = {
	height : 40,
	width : 280,
	color : 'black',
	backgroundColor : "#cfe7eb",

	font : {
		fontSize : '16',
		fontWeight : 'bold'
	},
	borderRadius : 10,
	bottom : 20,
	title : "Connect"
};

if(Ti.Platform.osname !== "android") {
	exports.button.backgroundImage = 'none';
}

exports.text = {
	container : {
		height : 200,
		width : 300,
		borderRadius : 20,
		backgroundColor : "#f3f3f3"
	},
	header : {
		top : 20,
		height : 30,
		font : {
			fontSize : 20,
			fontWeight : 'bold'
		},
		color: 'black',
		text : "Connect to Local Computer",
		textAlign : 'center'
	},
	host : {
		top : 60,
		height : 50,
		width : 280,
		borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		backgroundColor : 'white',
		textAlign : 'center',
		font : {
			fontSize : 20
		},
		hintText : "IP Address"
	}
};

/*jslint maxerr:1000 */

//Create a session object for us to keep track of a few things
var session  = {tempFile:null};

//Add our tools module
var tools = require('bencoding.android.tools');
var platformTools = tools.createPlatform();

//Add a reference to our test file
var pdfFile = Ti.Filesystem.resourcesDirectory + 'w4.pdf';

var win = Ti.UI.createWindow({
	exitOnClose: true, title:"Open PDF Example", backgroundColor:'#fff' 
});

var infoLabel = Ti.UI.createLabel({
	text:'Press the button to open a PDF file', top:10, left:10, 
	right:10, height:40, textAlign:'center', color:'#000'
});
win.add(infoLabel);

var goButton = Ti.UI.createButton({
	title: 'open pdf', height: '60dp', width: '150dp', top: '140dp'
});
win.add(goButton);

goButton.addEventListener('click', function(e) {
	
	//Check we have external storage access
	if(!Ti.Filesystem.isExternalStoragePresent()){
		alert("Access to external storage required");
		return;
	}
	
	var pdfSource = Ti.Filesystem.getFile(pdfFile);
	var timeStampName = new Date().getTime();
	session.tempFile = Ti.Filesystem.getFile(Ti.Filesystem.tempDirectory,timeStampName +'.pdf');
	if(session.tempFile.exists()){
		session.tempFile.deleteFile();
	}
	session.tempFile.write(pdfSource.read());
	pdfSource = null;

	var intent = Ti.Android.createIntent({
		action: Ti.Android.ACTION_VIEW,
		type: "application/pdf",
		data: session.tempFile.nativePath
	});

	if(platformTools.intentAvailable(intent)){
		try {
			Ti.Android.currentActivity.startActivity(intent);
		} catch(e) {
			Ti.API.debug(e);
			alert('Something went wrong');
		}
	}else{
		//No PDF reader to we need to alert the user to go get one.
		alert("Please go to the Google Play Store and download a PDF reader");			
	}

});

win.addEventListener("close",function(e){
	//On close of the weekend, we need to clean-up the temp file
	if(session.tempFile!=null){
		if(session.tempFile.exists()){
			session.tempFile.deleteFile();
		}		
		session.tempFile = null;
	}
});

win.open();
/*jslint maxerr:1000 */
var my = {
	mod : require('bencoding.android.tools')
};

(function () {
	    
    var win = Ti.UI.createWindow({
        backgroundColor: '#fff', title: 'BOOT_COMPLETED Example', 
        barColor:'#000',layout:'vertical',fullscreen:false, exitOnClose:true
    });
      
	win.add(Ti.UI.createLabel({
		top:10, height:25, left:5, right:5,color:'#000',
		textAlign:'left',text:'BOOT_COMPLETED Restart Example', 
		font:{fontSize:14}
	}));

	//Read the start-up time property, this is a double
	var startTime = Ti.Properties.getDouble("my_property",-1);
	//Check if no property value is set
	if(startTime > 0){
		//If we have a value, convert to a date
		startTime = new Date(startTime);
	}else{
		//if no property value, use current time
		startTime = new Date();
	}
	win.add(Ti.UI.createLabel({
		top:10, height:25, left:5, right:5,color:'#000',
		textAlign:'left',text:'App Started on: ' + String.formatDate(startTime,"long"), 
		font:{fontSize:14}
	}));

    win.open({modal:true});
        
})();    
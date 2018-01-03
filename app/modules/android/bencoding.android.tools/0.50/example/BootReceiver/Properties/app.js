
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
		textAlign:'left',text:'BOOT_COMPLETED Property Example', 
		font:{fontSize:14}
	}));

	var button1 = Ti.UI.createButton({
		title:'Foreground Restart',
		top:25, height:45, left:5, right:5	
	});
	win.add(button1);
	button1.addEventListener('click',function(e){
		Ti.App.Properties.setBool('my_enabled',true);		
		Ti.App.Properties.setString("my_bootType", "restart");		
		Ti.App.Properties.setBool("my_sendtoback",false);		
	});

	var button2 = Ti.UI.createButton({
		title:'Restart Notification',
		top:25, height:45, left:5, right:5	
	});	
	win.add(button2);
	button2.addEventListener('click',function(e){
		Ti.App.Properties.setBool('my_enabled',true);		
		Ti.App.Properties.setString("my_bootType", "notify");		
		Ti.App.Properties.setInt("my_notify_icon", 17301618);
		Ti.App.Properties.setString("my_notify_title", "Title from property");
		Ti.App.Properties.setString("my_notify_message","Message from property");	
	});	
    win.open({modal:true});
        
})();    
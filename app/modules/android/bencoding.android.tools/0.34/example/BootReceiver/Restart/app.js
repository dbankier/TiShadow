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

	win.add(Ti.UI.createLabel({
		top:10, height:25, left:5, right:5,color:'#000',
		textAlign:'left',text:'App Started on: ' + String.formatDate(new Date(),"medium") + ' at: ' + String.formatTime(new Date()), 
		font:{fontSize:14}
	}));

    win.open({modal:true});
        
})();    
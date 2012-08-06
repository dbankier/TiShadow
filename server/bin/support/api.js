var http = require("http"),
    config = require("./config");

function postToServer(path, data) {
  var jdata = JSON.stringify(data||{});
  var post_options = {
    host: 'localhost',
    port: '3000',
    path: path,
    method: 'POST',
    headers: {
      "Content-Type" : "application/json",
      "Content-Length":jdata.length
    } 
  };
  var req = http.request(post_options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('Response: ' + chunk);
    });
  }); 
  req.write(jdata);
  req.end(); 
}


exports.clearCache = function() {
  postToServer("/clear_cache");
};

exports.newBundle = function(data) {
  postToServer("/", {bundle:config.bundle_file, spec: config.isSpec, locale: config.locale});
};

var sys = require('sys');
var spawn = require('child_process').spawn;
var os = require('os');
var path = require('path');
var fs = require('fs');
var commands = require('../commands/shadow');

exports.cliVersion = '>=3.2.0';
exports.version = '1.0';
exports.title = 'TiShadow Express';
exports.desc  = 'For very basic and quick tishadow usage';
exports.extendedDesc = 'Requires tishadow: `[sudo] npm install -g tishadow`';

exports.init = init;
var logger;
function init(_logger, config, cli) {
  if (process.argv.indexOf('--shadow') !== -1 || process.argv.indexOf('--tishadow') !== -1) {
    cli.addHook('build.pre.compile', preCompileHook);
    logger = _logger;
  }
}
var modules = {
  iphone: [{
    id: 'yy.tidynamicfont',
    version: '0.1'
  },{
    id: 'net.iamyellow.tiws',
    version: '0.3'
  },{
    id: 'ti.compression',
    version:'1.0.2'
  }],
  android: [ {
    id: 'net.iamyellow.tiws',
    version: '0.1'
  },{
    id: 'ti.compression',
    version:'2.0.3'
  }]
}
function readManifest(file) {
  var manifest = {};
  fs.readFileSync(file).toString().split('\n').forEach(function (line) {
    var p = line.indexOf(':');
    if (line.charAt(0) != '#' && p != -1) {
      manifest[line.substring(0, p)] = line.substring(p + 1).trim();
    }
  });
  return manifest;
}
function preCompileHook(build, finished) {
  var tiappxml = require(path.join(build.titaniumSdkPath,'node_modules','titanium-sdk','lib','tiappxml'))
  var new_project_dir = path.join(build.projectDir, 'build', 'appify');

  // get ip address 

  var ifaces=os.networkInterfaces();
  var ip_address;
  for (var dev in ifaces) {
    ifaces[dev].forEach(function(details){
      if (details.family=='IPv4' && !details.internal) {
        console.log(details.address);
        ip_address = details.address;
      }
    });
  }
  
  commands.startAppify(logger, new_project_dir, build.cli.argv.platform, ip_address, function() {
    // new build target
    build.projectDir = new_project_dir;
    build.includeAllTiModules = true
    build.tiapp = build.cli.tiapp = new tiappxml(path.join(new_project_dir, 'tiapp.xml'));

    var mplatform = build.cli.argv.platform.replace('ios','iphone').replace('ipad','iphone');
    modules[mplatform].forEach(function(module){
      var module_path = path.join(new_project_dir, 'modules', mplatform, module.id, module.version);
      var manifest = readManifest(path.join(module_path, 'manifest'));
      var module_props = {
        id: module.id,
        platform: [mplatform],
        deployType: ['development'],
        modulePath: module_path,
        version: module.version,
        manifest: manifest,
        native: true,
      };
      if (mplatform === 'android') {
        module_props.jarName = manifest.name.toLowerCase() + '.jar',
        module_props.jarFile = path.join(module_props.modulePath, module_props.jarName);
      } else {
        module_props.libName = 'lib' + module_props.id.toLowerCase() + '.a',
        module_props.libFile = path.join(module_props.modulePath, module_props.libName);
      }
      build.nativeLibModules.push(module_props);
    });
    build.moduleSearchPaths.push(path.join(new_project_dir,"modules"));
    finished();
    commands.startServer(logger);
    commands.startWatch(logger, build.cli.argv.platform, ip_address);
  });
}

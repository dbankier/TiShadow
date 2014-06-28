/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var UglifyJS = require("uglify-js"),
    _ = require("underscore");
    path = require("path");

function functionCall(name, args) {
  return  new UglifyJS.AST_Call({
    expression: new UglifyJS.AST_SymbolRef({name:name}),
    args: args
  });
}

function functionCallByNode(node, args) {
  return new UglifyJS.AST_Call({
    expression: node,
    args: args
  });
}

function binaryAdd(left, right) {
  return new UglifyJS.AST_Binary({
    left: left,
    operator: "+",
    right: right 
  });
}
function symbol(s) {
	return new UglifyJS.AST_Symbol({name:s});
}

function addAppName(node) {
  return binaryAdd(node, symbol('require("/api/TiShadow").currentApp + "/"'));
}

function argsToPath(args) {
    var path = args[0];
    if (args.length > 1) {
        for (var i = 1; i < args.length - 1; ++i) {
            path = binaryAdd(path, binaryAdd(args[i], symbol('"/"')));
        }
        path = binaryAdd(path, _.last(args));
    }
    return path;
}
function couldBeAsset(name) {
  return typeof name === 'string' && 
		(name.toLowerCase().match("image$")  ||
		name.toLowerCase().match("icon$")  ||
    ["file", "sound", "icon", "url", "leftButton", "rightButton", "images"].indexOf(name) !== -1);
}

function doNotTouch(node) {
  return node instanceof UglifyJS.AST_Atom || //Booleans, Nulls, Undefined, etc 
         node instanceof UglifyJS.AST_Lambda; //Functions, etc
}

function toFullPath(p) {
 if (typeof p === 'string' &&
      p.match(/^\.{1,2}\//) &&
      current_file)   {
    var full = path.join(path.dirname(current_file), p);
    return full.substring(full.indexOf("Resources/") + 10);
  }
 return p;
}

var convert = new UglifyJS.TreeTransformer(null, function(node){
  //function call replacement
  if (node instanceof UglifyJS.AST_Call) {
    // redirect require function
    if (node.expression.name === "require") {
      node.expression.name = "__p.require";
      node.args[0].value = toFullPath(node.args[0].value);
      return node;
    }
    if (node.expression.start.value === "console") {
      if (typeof node.expression.property === 'string') {
        // console.log(...) => __log.log('info', ...)
        if (node.expression.property === 'log') {
          node.args.unshift(new UglifyJS.AST_String({value: 'info'}));
        }
        return functionCall("__log."+node.expression.end.value, node.args);
      } else {
        return functionCallByNode(new UglifyJS.AST_Sub({
          expression: new UglifyJS.AST_SymbolRef({name:"__log"}),
          property: node.expression.property
        }) ,node.args);
      }
    }
    if (node.expression.start.value.match && node.expression.start.value.match("^Ti(tanium)?$")){
      // redirect include
      if (node.expression.end.value === "include" && 
          node.expression.expression.property === undefined ) {
        return functionCall("eval", [functionCall("__p.fileContent", node.args)]);
      }
      //reroute resources directory -- FILESYSTEM
      if (node.expression.end.value === "getResourcesDirectory" &&
          node.expression.expression.property === "Filesystem") {
        node.expression.property = "getApplicationDataDirectory";
      return addAppName(node);
      }
      if (node.expression.end.value === "getFile" &&
          node.expression.expression.property === "Filesystem") {
				node.args = [functionCall("__p.file", [argsToPath(node.args)])];
				return node;
      }

      //control localisation -- LOCALE
      if (node.expression.end.value === "getString" &&
          node.expression.expression.property === "Locale") {
        return functionCall("L", node.args);
      }

      //control localisation -- UI
      if (node.expression.end.value.match("^(createWindow|createTabGroup|createAlertDialog|createOptionDialog)$") &&
          node.expression.expression.property === "UI") {
        return functionCall("__ui."+node.expression.end.value, node.args);
      }
      if (node.expression.end.value === "createNavigationWindow" &&
          node.expression.expression.property === "iOS") {
        return functionCall("__ui.createNavigationWindow", node.args);
      }
      /*if (node.expression.end.value.match("^(createSplitWindow|createPopover)$") &&
          node.expression.expression.property === "iPad") {
        return functionCall("__ui."+node.expression.end.value, node.args);
      }*/
      //control global listener -- App
      if (node.expression.end.value.match("^(addEventListener|removeEventListener|fireEvent)$") &&
          ["App","Gesture","Geolocation"].indexOf(node.expression.expression.property) > -1) {
        return functionCall("__app."+node.expression.end.value, 
                            [new UglifyJS.AST_String({
                              value: node.expression.expression.property
                            })].concat(node.args));
      }
      //control localisation -- API
      if (node.expression.expression.property === "API") {
        if (typeof node.expression.property === 'string') {
          return functionCall("__log."+node.expression.end.value, node.args);
        } else {
          return functionCallByNode(new UglifyJS.AST_Sub({
            expression: new UglifyJS.AST_SymbolRef({name:"__log"}),
            property: node.expression.property
          }) ,node.args);
        }
      }
      
      //control database source - Database
      if (node.expression.end.value === "install" &&
          node.expression.expression.property === "Database") {
        node.args[0] = functionCall("__p.file", [node.args[0]]);
        return node;
      }
    }
    //assets
    if (node.expression.end.value.match("^set") &&
        !doNotTouch(node.args) &&
        node.args[0] !== undefined &&
        couldBeAsset(node.expression.end.value.replace("set","").toLowerCase())) {
      node.args[0].value = toFullPath(node.args[0].value);
      node.args = [functionCall("__p.file",node.args)];
      return node;
    }
  } else if (node instanceof UglifyJS.AST_Assign && !doNotTouch(node.right)){
    if (node.left.property && node.left.property.match && node.left.property.match("^(title|text)id$")) {
      node.left.property = node.left.property.replace("id","");
      node.right = functionCall("L", [node.right]);
      return node;
    } else if (couldBeAsset(node.left.property)) {
      node.right.value = toFullPath(node.right.value);
      node.right = functionCall("__p.file",[node.right]);
      return node;
    }
  } else if (node instanceof UglifyJS.AST_ObjectKeyVal && !doNotTouch(node.value)) {
    if (typeof node.key === 'string' && node.key.match("^(title|text)id$")) {
      node.key = node.key.replace("id","");
      node.value = functionCall("L", [node.value]);
      return node;
    } else if (couldBeAsset(node.key)) {
      node.value.value = toFullPath(node.value.value);
      node.value = functionCall("__p.file",[node.value]);
      return node;
    }
  } else if (node instanceof UglifyJS.AST_PropAccess) {
    if (node.property === "resourcesDirectory" &&
         node.start.value.match("^Ti(tanium)?$") &&
         node.expression.property === "Filesystem") {
      node.property = "applicationDataDirectory";
      return addAppName(node);
    }
  }
});
var current_file;
exports.toAST = function(input,file) {
  current_file = file;
  var ast = UglifyJS.parse(input);
  return ast.transform(convert);
};

exports.toString = function(input, file) {
  return exports.toAST(input, file).print_to_string({beautify: true});
};



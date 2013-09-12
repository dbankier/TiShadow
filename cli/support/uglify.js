var UglifyJS = require("uglify-js");

function functionCall(name, args) {
  return  new UglifyJS.AST_Call({
    expression: new UglifyJS.AST_SymbolRef({name:name}),
    args: args
  });
}

function couldBeAsset(name) {
  return typeof name === 'string' && name.toLowerCase().match("image$")  ||
    ["file", "sound", "icon", "url"].indexOf(name) !== -1;
}

function doNotTouch(node) {
  return node instanceof UglifyJS.AST_Atom || //Booleans, Nulls, Undefined, etc 
         node instanceof UglifyJS.AST_Lambda; //Functions, etc
}

var convert = new UglifyJS.TreeTransformer(null, function(node){
  //function call replacement
  if (node instanceof UglifyJS.AST_Call) {
    // redirect require function
    if (node.expression.name === "require") {
      node.expression.name = "__p.require";
      return node;
    }
    if (node.expression.start.value === "console" &&
        node.expression.end.value === "log" &&
        node.expression.expression.property === undefined) {
      return functionCall('__log.log', node.args)
    }
    if (node.expression.start.value.match("^Ti(tanium)?$")){
      // redirect include
      if (node.expression.end.value === "include" && 
          node.expression.expression.property === undefined ) {
        node.expression.expression.name = "__p";
      node.args.unshift(new UglifyJS.AST_This());
      return node;
      }
      //reroute resources directory -- FILESYSTEM
      if (node.expression.end.value === "getResourcesDirectory" &&
          node.expression.expression.property === "Filesystem") {
        node.expression.property = "getApplicationDataDirectory";
      return node;
      }
      //control localisation -- LOCALE
      if (node.expression.end.value === "getString" &&
          node.expression.expression.property === "Locale") {
        return functionCall("L", node.args);
      }

      //control localisation -- UI
      if (node.expression.end.value.match("^(createWindow|createTabGroup)$") &&
          node.expression.expression.property === "UI") {
        return functionCall("__ui."+node.expression.end.value, node.args);
      }
      //control global listener -- App
      if (node.expression.end.value.match("^(addEventListener|removeEventListener|fireEvent)$") &&
          node.expression.expression.property === "App") {
        return functionCall("__app."+node.expression.end.value, node.args);
      }
      //control localisation -- API
      if (node.expression.expression.property === "API") {
        return functionCall("__log."+node.expression.end.value, node.args);
      }
    }
    //assets
    if (node.expression.end.value.match("^set") &&
        !doNotTouch(node.args) &&
        couldBeAsset(node.expression.end.value.replace("set","").toLowerCase())) {
      node.args = [functionCall("__p.file",node.args)];
      return node;
    }
  } else if (node instanceof UglifyJS.AST_Assign && !doNotTouch(node.right)){
    if (node.left.property && node.left.property.match && node.left.property.match("^(title|text)id$")) {
      node.left.property = node.left.property.replace("id","");
      node.right = functionCall("L", [node.right]);
      return node;
    } else if (couldBeAsset(node.left.property)) {
      node.right = functionCall("__p.file",[node.right]);
      return node;
    }
  } else if (node instanceof UglifyJS.AST_ObjectKeyVal && !doNotTouch(node.value)) {
    if (typeof node.key === 'string' && node.key.match("^(title|text)id$")) {
      node.key = node.key.replace("id","");
      node.value = functionCall("L", [node.value]);
      return node;
    } else if (couldBeAsset(node.key)) {
      node.value = functionCall("__p.file",[node.value]);
      return node;
    }
  } else if (node instanceof UglifyJS.AST_PropAccess) {
    if (node.property === "resourcesDirectory" &&
         node.start.value.match("^Ti(tanium)?$") &&
         node.expression.property === "Filesystem") {
      node.property = "applicationDataDirectory";
      return node;
    }
  }
});

exports.toAST = function(input) {
  var ast = UglifyJS.parse(input);
  return ast.transform(convert);
};

exports.toString = function(input) {
  return exports.toAST(input).print_to_string({beautify: true});
};



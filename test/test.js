/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var assert = require("assert"),
    fs = require("fs"),
    tiugly = require("../cli/support/uglify");

function loadTest(name) {
  /*console.log("|" + tiugly.toString(fs.readFileSync("./test/fixtures/"+name).toString())+ "|");
  console.log("|" + fs.readFileSync("./test/expected/"+name).toString() + "|");*/
  return assert.equal(tiugly.toString(fs.readFileSync("./test/fixtures/"+name).toString()),
                     fs.readFileSync("./test/expected/"+name).toString());
}
describe("TiShadow conversions", function() {
  [{ describe: "#require",
     it: "should convert only true require calls",
     file: "require.js"
  },{ describe: "#Ti.include()",
     it: "should convert only true Ti.include calls",
     file: "include.js"
  },{ describe: "Filesystem Redirection",
     it: "should convert only true Ti.include calls",
     file: "filesystem.js"
  },{ describe: "Localisation Redirection",
     it: "should convert only true Ti.Locale.getString calls",
     file: "localisation.js"
  },{ describe: "UI Control",
     it: "ui rewrites",
     file: "ui.js"
  },{ describe: "Logging Redirects",
     it: "api rewrites",
     file: "api.js"
  },{ describe: "Application Listener Redirects",
     it: "should redirect all listener to __app",
     file: "app.js"
  },{ describe: "Random Bugs",
     it: "shouldn't crash",
     file: "bugs.js"
	}].forEach(function(test) {
    describe(test.describe, function() {
      it(test.it, function() {
        loadTest(test.file);
      });
    });
  });

  describe("Relative require test", function() {
    it("should rewrite to absolute", function() {
      assert.equal(
        tiugly.toString("require('../ui/Window')", "/my/root/path/project/Resources/lib/Library.js"),
        "__p.require(\"ui/Window\");"
        );
      assert.equal(
        tiugly.toString("require('./ui/Window')", "/my/root/path/project/Resources/lib/Library.js"),
        "__p.require(\"lib/ui/Window\");"
        );

    });
  });
  describe("Relative assets test", function() {
    it("should rewrite to absolute", function() {
      assert.equal(
        tiugly.toString("win.backgroundImage = '../ui/Window.png'", "/my/root/path/project/Resources/lib/Library.js"),
        "win.backgroundImage = __p.file(\"ui/Window.png\");"
        );
      assert.equal(
        tiugly.toString("view.setBackgroundImage('./ui/Window.png')", "/my/root/path/project/Resources/lib/Library.js"),
        "view.setBackgroundImage(__p.file(\"lib/ui/Window.png\"));"
        );
      assert.equal(
        tiugly.toString("new View({backgroundImage:'./ui/Window.png'})", "/my/root/path/project/Resources/lib/Library.js"),
        "new View({\n    backgroundImage: __p.file(\"lib/ui/Window.png\")\n});"
        );
    });
  });
  describe("Database source test", function() {
    it("should reroute the database string source file", function() {
      assert.equal(tiugly.toString("Ti.Database.install('mydatabase.sqlite','name')"), 
        "Ti.Database.install(__p.file(\"mydatabase.sqlite\"), \"name\");");
    });
    it("should reroute the database expression source file", function() {
      assert.equal(tiugly.toString("Ti.Database.install(a+b+c,'name')"), 
        "Ti.Database.install(__p.file(a + b + c), \"name\");");
    });
  });


});

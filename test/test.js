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
  }].forEach(function(test) {
    describe(test.describe, function() {
      it(test.it, function() {
        loadTest(test.file);
      });
    });
  });


});

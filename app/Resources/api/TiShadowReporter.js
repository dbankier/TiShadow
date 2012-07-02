var log = require("/api/Log");

var TiShadowReporter = function() {
}

var ansi = {
  green: '\033[32m',
  red: '\033[31m',
  yellow: '\033[33m',
  none: '\033[0m',
  white: '\033[37m',
  bold_on:'\033[1m',
  bold_off:'\033[22m',
}

function summaryLine(passed, failed, type) {
  if (failed === 0) {
    log.pass("√ "+ passed + " " + type + "(s) completed.");
  } else {
    log.fail("x "+ failed + " of " + (passed + failed) + " " + type + "(s) failed."); 
  }
}


TiShadowReporter.prototype = {
  reportRunnerStarting: function () {
    log.test("Runner Started");
    this.total = {
      passed: 0,
      failed: 0
    };
    this.level = 0;
    this.current = {
      description: "",
      parent: null
    };

  },
  reportRunnerResults: function () {
    log.test("");
    summaryLine(this.total.passed, this.total.failed, "spec");
    log.test("Runner Finished");
  },
  reportSpecStarting: function (spec) {
    if (spec.suite.description !== this.current.description) {
      if (spec.suite.description === this.current.parent) {
        this.current.parent = null;
        log.test("");
      } else {
        log.test("");
        log.test(ansi.bold_on + (this.level === 0 ? "" : "  ") +  spec.suite.description + ansi.bold_off);
        if (this.level !== 0 && this.current.parent === null) {
          this.current.parent = this.current.description;
        };
        this.level++;
      }
      this.current.description = spec.suite.description;
    }
  },
  reportSpecResults: function(spec) {
    if (spec.results().passed()) {
      log.test(ansi.green + "    √ " + ansi.none + spec.description);
      this.total.passed += 1;
    } else {
      this.total.failed += 1;
    }
    var results = spec.results().getItems();
    results.forEach(function(result) {
      if (result.type === "log") {
        log.test(result.toString());
      } else if (result.type === 'expect' && (result.passed != null) && !result.passed()) {
        log.fail(ansi.red + "    X " + ansi.none + spec.description);
        log.fail(ansi.red + "      => " + result.message + ansi.none);
      }
    });
  },
  reportSuiteResults: function(suite) {
    var results = suite.results();
    if (!suite.parentSuite) {
      summaryLine(results.passedCount, results.totalCount-results.passedCount, "test");
    }
    this.level--;
  },
  log: function(str) {
    log.info("  " + str);
  }
}

module.exports = TiShadowReporter;

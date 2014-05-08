/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

var noopTimer = {
  start: function(){},
  elapsed: function(){ return 0; }
};

var TiShadowReporter2 = function(options) {
  var log = options.log,
    colorize = (!!options.showColors) ? markColor : ignoreColor,
    onComplete = options.onComplete || function() {},
    timer = options.timer || noopTimer,
    specCount,
    failureCount,
    failedSpecs,
    pendingCount,
    level,
    currentSuiteId,
    ansi = {
      green: '\x1B[32m',
      red: '\x1B[31m',
      yellow: '\x1B[33m',
      none: '\x1B[0m'
    };

  this.jasmineStarted = function() {
    specCount = 0;
    failureCount = 0;
    pendingCount = 0;
    failedSpecs = [];
    level = 0;
    print('Started');
    printNewline();
    timer.start();
  };

  this.jasmineDone = function() {
    printNewline();
    for (var i = 0; i < failedSpecs.length; i++) {
      specFailureDetails(failedSpecs[i]);
    }

    printNewline();
    var specCounts = specCount + ' ' + pluralize('spec', specCount) + ', ' +
      failureCount + ' ' + pluralize('failure', failureCount);

    if (pendingCount) {
      specCounts += ', ' + pendingCount + ' pending ' + pluralize('spec', pendingCount);
    }

    print(specCounts);

    printNewline();
    var seconds = timer.elapsed() / 1000;
    print('Finished in ' + seconds + ' ' + pluralize('second', seconds));

    printNewline();

    onComplete(failureCount === 0);
  };

  this.suiteStarted = function(result) {
    print(result.description);
    level++;
  };

  this.suiteDone = function(result) {
    level--;
  };

  this.specStarted = function(result) {
  };

  this.specDone = function(result) {
    specCount++;

    if (result.status == 'pending') {
      pendingCount++;
      print(colorize('yellow', result.description));
      return;
    }

    if (result.status == 'passed') {
      print(colorize('green', result.description));
      return;
    }

    if (result.status == 'failed') {
      failureCount++;
      failedSpecs.push(result);
      print(colorize('red', result.description));
      // print(colorize('red', JSON.stringify(result)));
    }
  };

  return this;

  function printNewline() {
    // print('');
  }

  function markColor(color, str) {
    return ansi[color] + str + ansi.none;
  }

  function ignoreColor(color, str) {
    return str;
  }

  function print(str) {
    log(indentByLevel() + str);
  }

  function pluralize(str, count) {
    return count === 1 ? str : str + 's';
  }

  function repeat(thing, times) {
    var arr = [];
    for (var i = 0; i < times; i++) {
      arr.push(thing);
    }
    return arr;
  }

  function indentByLevel(lvl) {
    lvl = lvl || level
    return Array(lvl + 1).join('  ');
  }

  function indent(str) {
    var lines = (str || '').split('\n');
    var newArr = [];
    for (var i = 0; i < lines.length; i++) {
      newArr.push(indentByLevel(1) + lines[i]);
    }
    return newArr.join('\n');
  }

  function specFailureDetails(result) {
    printNewline();
    print(result.fullName);
    ++level;

    for (var i = 0; i < result.failedExpectations.length; i++) {
      var failedExpectation = result.failedExpectations[i];
      if (!!failedExpectation && !!failedExpectation.stack) {
        printNewline();
        print(failedExpectation.stack);
      }
    }

    --level;
    printNewline();
  }
}

module.exports = TiShadowReporter2
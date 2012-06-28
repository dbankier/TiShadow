var log = require("/api/Log");
var _ = require("/lib/underscore");

function assert(test, msg) {
  log[test ? 'pass' : 'fail'](msg || "Test Result");
}

exports.equal = function(val1, val2, msg) {
  assert(val1 == val2, msg);
}

exports.notEqual = function(val1, val2, msg) {
  assert(val1 != val2, msg);
}

exports.strictEqual = function(val1, val2, msg) {
  assert(val1 === val2, msg);
}

exports.notStrictEqual = function(val1, val2, msg) {
  assert(val1 !== val2, msg);
}

exports.notDeepEqual = function (val1,val2,msg) {
  assert(!_.isEqual(val1,val2),msg);
}

exports.deepEqual = function (val1,val2,msg) {
  assert(_.isEqual(val1,val2),msg);
}

exports.isTrue = function(val, msg) {
  assert(val, msg);
}

exports.isFalse = function(val, msg) {
  assert(!val, msg);
}


// UNDERSCORE TESTS

var fns = ['isEmpty',
'isElement',
'isArray',
'isObject',
'isArguments',
'isFunction',
'isString',
'isNumber',
'isFinite',
'isBoolean',
'isDate',
'isRegExp',
'isNaN',
'isNull',
'isUndefined'];
fns.forEach(function(test) {
  exports[test] = function(val,msg) {
    assert(_[test](val), msg);
  }
  exports[test.replace("is","isNot")] = function(val,msg) {
    assert(!_[test](val),msg);
  }
});


//'has',
exports.has  = function(obj,prop,msg) {
  assert(_.has(obj,prop), msg);
}
exports.notHas  = function(obj,prop,msg) {
  assert(!_.has(obj,prop), msg);
}
exports.hasProperty  = function(obj,prop,msg) {
  assert(_.has(obj,prop), msg);
}
exports.lengthOf = function(val1, val2, msg) {
  assert(val1.length === val2, msg);
}

exports.match = function(val1, val2, msg) {
  assert(val1.match(val2) !== null,msg);
}
exports.notMatch = function(val1, val2, msg) {
  assert(val1.match(val2) === null,msg);
}















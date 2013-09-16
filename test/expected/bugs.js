var fnTest = /xyz/.test(function() {
    var xyz;
}) ? /\b_super\b/ : /.*/;
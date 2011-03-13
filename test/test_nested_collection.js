var util = require('util');

var c = require('nested_collection');
var collection = new c();

exports["test addSub, get"] = function (test) {
    var sub;

    test.ok(!collection.has('foo'));

    test.done();
}

exports["test addSub, get"] = function (test) {
    var sub;

    var testFunc = function() {
        return false;
    };

    collection.addSub('foo', 'bar1', testFunc);
    test.ok(collection.has('foo'));

    sub = collection.get('foo');
    test.equals(1, Object.keys(sub).length);
    test.same(testFunc, sub.bar1);

    test.done();
}

exports["test hasSub"] = function (test) {
    test.ok(!collection.hasSub('foo', 'bar2'));
    test.ok(collection.hasSub('foo', 'bar1'));

    test.done();
}

exports["test removeSub"] = function (test) {
    var sub;

    collection.removeSub('foo', 'bar1');
    sub = collection.get('foo');
    test.equals(0, Object.keys(sub).length);

    test.done();
}

exports["test inject"] = function (test) {
    var c2 = new c({'foo': {'bar' : function() {
    }}});

    test.ok(c2.hasSub('foo', 'bar'));
    test.done();
}

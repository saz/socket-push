var util = require('util');

var marshal = require('rpc/marshal');

exports["fromHttpValue"] = function (test) {
    test.equal(3, marshal.fromHttpValue('3', 'number'));
    test.equal('3', marshal.fromHttpValue('3', 'string'));

    test.throws(function() {
        marshal.fromHttpValue('asd', 'number')
    }, 'Invalid Number Exception');

    test.throws(function() {
        marshal.fromHttpValue(0, 'string')
    }, 'Invalid String Exception');

    test.equal('asd', marshal.fromHttpValue('asd', 'string'), 'String plain');
    test.equal('as%20d', marshal.fromHttpValue('as%20d', 'string'), "String with %20");

    test.deepEqual([1, 3], marshal.fromHttpValue('[1,    3]', 'object'), 'Array');
    test.deepEqual({foo: "bar"}, marshal.fromHttpValue('{"foo": "bar"}', 'object'), 'Object');
    test.throws(function() {
        marshal.fromHttpValue(marshal.fromHttpValue('{foo: "bar",}', 'object'))
    }, 'JSON Exception');

    test.done();
}

exports["fromHttpParams"] = function (test) {
    test.deepEqual(
        ['asd', 123],
        marshal.fromHttpParams(
            {param2: '123', param1: 'asd'},
            [{name: 'param1', type: 'string'}, {name: 'param2', type: 'number'}]
        )
    );

    test.done();
}

exports["toHttpValue"] = function (test) {
    test.equal(3, marshal.toHttpValue(3, 'number'));
    test.equal('3', marshal.toHttpValue('3', 'string'));

    test.throws(function() {
        marshal.toHttpValue('asd', 'number')
    });
    test.throws(function() {
        marshal.toHttpValue(0, 'string')
    });

    test.equal('asd', marshal.toHttpValue('asd', 'string'));
    test.equal('as%20d', marshal.toHttpValue('as d', 'string'));

    test.equal('%5B1%2C3%5D', marshal.toHttpValue([1, 3], 'object'));
    test.equal('%7B%22foo%22%3A%22bar%22%7D', marshal.toHttpValue({foo: 'bar'}, 'object'));

    test.done();
}

exports["toHttpParams"] = function (test) {
    test.deepEqual(
        {param1: '123', param2: 'asd'},
        marshal.toHttpParams(
            [123, 'asd'],
            [{name: 'param1', type: 'number'}, {name: 'param2', type: 'string'}]
        )
    );

    test.done();
}
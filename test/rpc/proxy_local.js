var util = require('util');
var localProxy = require('rpc/proxy/local');

var fixture = require('test/fixtures/rpc');

exports["call"] = function (test) {

    var testService = new localProxy(fixture.serviceDesc, fixture.proxiedObject);
    var myResult;
    testService.foo('arg1', 'arg2');
    testService.foo('arg1', 'arg2', function(result) {
        myResult = result;
    });

    test.deepEqual(['arg1', 'arg2'], myResult);

    testService.foo('arg1', undefined, function() {
        test.ok(false, "Return callback called, should have called error Callback");
    }, function (error) {
        test.ok(true);
    });
    test.throws(function() {
        testService.bla();
    });

    test.done();
}
var util = require('util');
var httpProxy = require('rpc/proxy/http');

var fixture = require('fixture/rpc');
var proxyObject = new httpProxy(fixture.serviceDesc, '127.0.0.1', 8383);

exports["test route"] = function (test) {
    test.equals('/fooservice/foo/arg1/arg2', proxyObject.buildRoute('foo', ['arg1', 'arg2']));
    test.done();
}

exports["test remote call"] = function (test) {
    try {
        proxyObject.foo('arg1', 'arg2', function(result) {
            test.deepEqual(['arg1', 'arg2'], result);
            test.done();
        });
    }
    catch (e) {
        test.fail(e);
    }
}
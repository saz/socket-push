var util = require('util');
var httpProxy = require('rpc/proxy/http');

var fixture = require('test/fixtures/rpc');
var proxyObject = new httpProxy(fixture.serviceDesc, '127.0.0.1', 8383);

exports["route"] = function (test) {
    test.equals('/fooservice/foo/arg1/arg2', proxyObject.buildRoute('foo', ['arg1', 'arg2']));
    test.done();
}

exports["remote call"] = function (test) {
    proxyObject.foo('arg1', 'arg2', function(result) {
        test.deepEqual(['arg1', 'arg2'], result);
        test.done();
    });
}

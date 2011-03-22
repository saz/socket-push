var util = require('util');
var mgr = require('service/manager/standalone')();

exports["setget"] = function (test) {
    var fixture = {
        foo: 'bar'
    };
    mgr.setConfig(fixture);

    test.deepEqual(fixture, mgr.getConfig());

    test.done();
}

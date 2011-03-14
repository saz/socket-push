var util = require('util');

exports["test correct auth"] = function (test) {
    var auth = require('auth');

    auth.set('userid', 'auth');

    test.equals('userid', auth.authenticate('auth'));

    test.done();
}

exports["test failed auth"] = function (test) {
    var auth = require('auth');

    test.throws(function() {
        auth.authenticate('failauth');
    });

    test.equals('userid', auth.authenticate('auth'));

    test.done();
}

exports["test delete auth"] = function (test) {
    var auth = require('auth');

    auth.remove('falseuserid');
    test.equals('userid', auth.authenticate('auth'));

    auth.remove('userid');
    test.throws(function() {
        auth.authenticate('auth');
    });

    test.done();
}

exports["test reset"] = function (test) {
    var auth = require('auth');

    auth.set('userid', 'auth');
    auth.reset();

    test.throws(function() {
        auth.authenticate('auth');
    });

    test.done();
}

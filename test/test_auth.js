var util = require('util');

exports["correct auth"] = function (test) {
    var auth = require('auth');

    auth.set('userid', 'auth');

    test.equals('userid', auth.check('auth'));

    test.done();
}

exports["failed auth"] = function (test) {
    var auth = require('auth');

    test.throws(function() {
        auth.authenticate('failauth');
    });

    test.equals('userid', auth.check('auth'));

    test.done();
}

exports["delete auth"] = function (test) {
    var auth = require('auth');

    auth.remove('falseuserid');
    test.equals('userid', auth.check('auth'));

    auth.remove('userid');
    test.throws(function() {
        auth.authenticate('auth');
    });

    test.done();
}

exports["reset"] = function (test) {
    var auth = require('auth');

    auth.set('userid', 'auth');
    auth.reset();

    test.throws(function() {
        auth.check('auth');
    });

    test.done();
}

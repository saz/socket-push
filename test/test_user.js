var util = require('util');
var user = require('user');

var executed = [];

var socket = {
    send: function(message) {
//		util.debug('Sent ' + message);
        executed.push(message);
    }
};

exports["test addConnection"] = function (test) {
    user.addConnection('user1', 'sessionId1', socket);

    var c = user.getConnections('user1');

    test.equal(1, Object.keys(c).length);
    test.deepEqual({'sessionId1': socket}, c);

    test.done();
}

exports["test removeConnection"] = function (test) {
    user.removeConnection('user1', 'sessionId1');

    var c = user.getConnections('user1');

    test.equal(0, Object.keys(c).length);

    test.done();
}

exports["test remove"] = function (test) {
    user.addConnection('user1', 'sessionId1', socket);

    var cbUserId;
    var testFunc = function (userId) {
        cbUserId = userId;
    }

    user.onDisconnect(testFunc);
    user.setDisconnectTimeout(1000);

    user.remove('user1');

    test.equal('user1', cbUserId);

    var c = user.getConnections('user1');
    test.equal(0, Object.keys(c).length);

    test.done();
}

exports["test publish"] = function (test) {
    user.addConnection('user1', 'sessionId1', socket);
    user.addConnection('user1', 'sessionId2', socket);
    user.publish('user1', 'message');

    test.deepEqual(['message', 'message'], executed);
    test.done();
}

exports["test publish without message"] = function (test) {
    test.throws(function () {
        user.publish('user1');
    });

    test.done();
}

exports["test publish on not connected user"] = function (test) {
    test.throws(function () {
        user.publish('user2');
    });

    test.done();
}

exports["test disconnect callback"] = function (test) {
    var cbUserId, cbTime, cbTimerId;
    var testFunc = function (userId) {
        cbUserId = userId;
    }

    var timer = {
        clearTimeout: function(timerId) {
            cbTimerId = timerId;
        },
        setTimeout: function (callback, time) {
            callback();
            cbTime = time;
            return 'timerId';
        }
    }
    user.setTimer(timer);
    user.setDisconnectTimeout(1000);
    user.onDisconnect(testFunc);

    user.addConnection('user14', 'session1');

    // Assert clearTimeout is NOT fired
    test.equal(null, cbTimerId);

    // Assert setTimeout is fired
    user.removeConnection('user14', 'session1');
    test.equal('user14', cbUserId);
    test.equal(1000, cbTime);

    user.addConnection('user14', 'session1');

    // Assert clearTimeout is fired
    test.equal('timerId', cbTimerId);

    test.done();
}
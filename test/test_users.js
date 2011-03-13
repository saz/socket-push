var util = require('util');
var users = require('users');

var executed = [];

var socket = {
    send: function(message) {
//		util.debug('Sent ' + message);
        executed.push(message);
    }
};

exports["test addConnection"] = function (test) {
    users.addConnection('user1', 'sessionId1', socket);

    var c = users.getConnections('user1');

    test.equal(1, Object.keys(c).length);
    test.deepEqual({'sessionId1': socket}, c);

    test.done();
}

exports["test removeConnection"] = function (test) {
    users.removeConnection('user1', 'sessionId1');

    var c = users.getConnections('user1');

    test.equal(0, Object.keys(c).length);

    test.done();
}

exports["test remove"] = function (test) {
    users.addConnection('user1', 'sessionId1', socket);

    var cbUserId;
    var testFunc = function (userId) {
        cbUserId = userId;
    }

    users.setDisconnectCallback(testFunc, 1000);

    users.remove('user1');

    test.equal('user1', cbUserId);

    var c = users.getConnections('user1');
    test.equal(0, Object.keys(c).length);

    test.done();
}

exports["test publish"] = function (test) {
    users.addConnection('user1', 'sessionId1', socket);
    users.addConnection('user1', 'sessionId2', socket);
    users.publish('user1', 'message');

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
    users.setTimer(timer);
    users.setDisconnectCallback(testFunc, 1000);

    users.addConnection('user14', 'session1');

    // Assert clearTimeout is NOT fired
    test.equal(null, cbTimerId);

    // Assert setTimeout is fired
    users.removeConnection('user14', 'session1');
    test.equal('user14', cbUserId);
    test.equal(1000, cbTime);

    users.addConnection('user14', 'session1');

    // Assert clearTimeout is fired
    test.equal('timerId', cbTimerId);

    test.done();
}
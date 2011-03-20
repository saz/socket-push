var util = require('util');
var user = require('service/user');

var executed = [];

var socket = {
    send: function(message) {
//		util.debug('Sent ' + message);
        executed.push(message);
    }
};

exports["addConnection"] = function (test) {
    user.addConnection('user1', 'sessionId1', socket);

    var c = user.getConnections('user1');

    test.equal(1, Object.keys(c).length);
    test.deepEqual({'sessionId1': socket}, c);

    test.done();
}

exports["removeConnection"] = function (test) {
    user.removeConnection('user1', 'sessionId1');

    var c = user.getConnections('user1');

    test.equal(0, Object.keys(c).length);

    test.done();
}

exports["remove"] = function (test) {
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

exports["publish"] = function (test) {
    user.addConnection('user1', 'sessionId1', socket);
    user.addConnection('user1', 'sessionId2', socket);
    user.publish('user1', 'message');

    test.deepEqual(['message', 'message'], executed);
    test.done();
}

exports["publish without message"] = function (test) {
    test.throws(function () {
        user.publish('user1');
    });

    test.done();
}

exports["publish on not connected user"] = function (test) {
    test.throws(function () {
        user.publish('user2');
    });

    test.done();
}

exports["disconnect callback"] = function (test) {
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
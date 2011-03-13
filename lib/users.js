var collection = require('nested_collection');
var users = new collection.instance();

var timer = require('timers');
var timers = {};
var disconnectCallback = null;

exports.setTimer = function(t) {
    timer = t;
}

exports.addConnection = function(userId, sessionId, socket) {
    // Clear disconnect callback if callback is queued
    if (!users.has(userId)
            && disconnectCallback !== null
            && timers.hasOwnProperty(userId)
            ) {
        timer.clearTimeout(timers[userId]);
    }
    users.addSub(userId, sessionId, socket);
}

exports.removeConnection = function(userId, sessionId) {
    if (!users.has(userId)) {
        return;
    }
    users.removeSub(userId, sessionId);

    // Initiate disconnect callback if no socket connected
    if (!users.has(userId)
            && disconnectCallback !== null
            ) {
        timers[userId] = timer.setTimeout(function() {
            disconnectCallback.callback(userId);
        }, disconnectCallback.timeout);
    }
}

exports.getConnections = function(userId) {
    return users.get(userId);
}

exports.setDisconnectCallback = function(callback, timeoutMilliSeconds) {
    disconnectCallback = {
        callback: callback,
        timeout: timeoutMilliSeconds
    };
}

exports.publish = function(userId, message) {
    if (!users.has(userId)) {
        throw "User not connected";
    }
    if (message == undefined) {
        throw "Message missing";
    }

    var connections = users.get(userId);
    for (sessionId in connections) {
        connections[sessionId].send(message);
    }
}

exports.remove = function(userId) {
    var connections = users.get(userId);
    for (sessionId in connections) {
        users.removeSub(userId, sessionId);
    }

    if (disconnectCallback !== null) {
        disconnectCallback.callback(userId);
    }
}
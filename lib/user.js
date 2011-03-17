var collection = require('nested_collection');
var users = new collection();

var timer = require('timers');
var timers = {};
var timeout = 0;
var eventHandler = new (require('events').EventEmitter)();

exports.setTimer = function(t) {
    timer = t;
}

exports.setDisconnectTimeout = function(t) {
    timeout = t;
}

exports.addConnection = function(userId, sessionId, socket) {
    // Clear disconnect callback if callback is queued
    if (!users.has(userId)
            && timeout > 0
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
    if (!users.has(userId)) {
        if (timeout == 0) {
            eventHandler.emit('disconnect', userId);
        }
        else {
            timers[userId] = timer.setTimeout(function() {
                eventHandler.emit('disconnect', userId);
            }, timeout);
        }
    }
}

exports.getConnections = function(userId) {
    return users.get(userId);
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

exports.listAll = function() {
    return users.getKeys();
}

exports.remove = function(userId) {
    var connections = users.get(userId);
    for (sessionId in connections) {
        users.removeSub(userId, sessionId);
    }

    eventHandler.emit('disconnect', userId);
}

exports.onDisconnect = function(callback) {
    eventHandler.on('disconnect', callback);
}

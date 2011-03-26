function user() {
    var collection = require('nested_collection');
    var users = collection();

    var timer = require('timers');
    var timers = {};
    var timeout = 0;
    var eventHandler = new (require('events').EventEmitter)();

    this.setTimer = function(t) {
        timer = t;
    }

    this.setDisconnectTimeout = function(t) {
        timeout = t;
    }

    this.addConnection = function(userId, sessionId, socket) {
        // Clear disconnect callback if callback is queued
        if (!users.has(userId)
                && timeout > 0
                && timers.hasOwnProperty(userId)
                ) {
            timer.clearTimeout(timers[userId]);
        }
        users.addSub(userId, sessionId, socket);
    }

    this.removeConnection = function(userId, sessionId) {
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

    this.getConnections = function(userId) {
        return users.get(userId);
    }

    this.publish = function(userId, message) {
        if (!users.has(userId)) {
            throw new Error("User not connected");
        }
        if (message == undefined) {
            throw new Error("Message missing");
        }

        var connections = users.get(userId);
        for (sessionId in connections) {
            connections[sessionId].send(message);
        }
    }

    this.listAll = function() {
        return users.getKeys();
    }

    this.remove = function(userId) {
        var connections = users.get(userId);
        for (sessionId in connections) {
            users.removeSub(userId, sessionId);
        }

        eventHandler.emit('disconnect', userId);
    }

    this.onDisconnect = function(callback) {
        eventHandler.on('disconnect', callback);
    }

    this.removeAllListeners = function() {
        eventHandler.removeAllListeners('disconnect');
    }
}

module.exports = function () {
    return new user();
}
var collection = require('nested_collection');
var channels = new collection();
var subscriptions = new collection();
var eventHandler = new (require('events').EventEmitter)();

exports.isSubscribed = function(subscriberId, channelId) {
    return channels.hasSub(channelId, subscriberId);
}

exports.subscribe = function(subscriberId, channelId) {
    channels.addSub(channelId, subscriberId, subscriberId);
    subscriptions.addSub(subscriberId, channelId, channelId);
}

exports.unsubscribe = function(subscriberId, channelId) {
    channels.removeSub(channelId, subscriberId);
    subscriptions.removeSub(subscriberId, channelId);
}

exports.getSubscriptions = function(subscriberId) {
    return Object.keys(subscriptions.get(subscriberId));
}

exports.getSubscribers = function(channelId) {
    return Object.keys(channels.get(channelId));
}

exports.unsubscribeAll = function(subscriberId) {
    if (!subscriptions.has(subscriberId)) {
        return;
    }

    var channelList = subscriptions.get(subscriberId);
    for (k in channelList) {
        exports.unsubscribe(subscriberId, channelList[k]);
    }

}

exports.onPublish = function(callback) {
    eventHandler.on('publish', callback)
}

exports.publish = function(channelId, message) {
    var s = channels.get(channelId);
    for (k in s) {
        eventHandler.emit('publish', k, message);
    }
}

exports.listAll = function() {
    return channels.getKeys();
}

var collection = require('nested_collection');
var channels = new collection();
var subscriptions = new collection();

exports.isSubscribed = function(subscriberId, channelId) {
    return channels.hasSub(channelId, subscriberId);
}

exports.subscribe = function(subscriberId, channelId, cb) {
    channels.addSub(channelId, subscriberId, cb);
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

exports.publish = function(channelId, message) {
    var s = channels.get(channelId);
    for (k in s) {
        s[k](k, message);
    }
}
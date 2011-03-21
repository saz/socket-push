function channel() {
    var collection = require('nested_collection');
    var channels = collection();
    var subscriptions = collection();
    var eventHandler = new (require('events').EventEmitter)();

    this.isSubscribed = function(subscriberId, channelId) {
        return channels.hasSub(channelId, subscriberId);
    }
    
    this.subscribe = function(subscriberId, channelId) {
        channels.addSub(channelId, subscriberId, subscriberId);
        subscriptions.addSub(subscriberId, channelId, channelId);
    }
    
    this.unsubscribe = function(subscriberId, channelId) {
        channels.removeSub(channelId, subscriberId);
        subscriptions.removeSub(subscriberId, channelId);
    }
    
    this.getSubscriptions = function(subscriberId) {
        return Object.keys(subscriptions.get(subscriberId));
    }
    
    this.getSubscribers = function(channelId) {
        return Object.keys(channels.get(channelId));
    }
    
    this.unsubscribeAll = function(subscriberId) {
        if (!subscriptions.has(subscriberId)) {
            return;
        }
    
        var channelList = subscriptions.get(subscriberId);
        for (k in channelList) {
            this.unsubscribe(subscriberId, channelList[k]);
        }
    
    }
    
    this.onPublish = function(callback) {
        eventHandler.on('publish', callback)
    }

    this.removeAllListeners = function() {
        eventHandler.removeAllListeners('publish');
    }

    this.publish = function(channelId, message) {
        var s = channels.get(channelId);
        for (k in s) {
            eventHandler.emit('publish', k, message);
        }
    }
    
    this.listAll = function() {
        return channels.getKeys();
    }
}

module.exports = function() {
    return new channel();
}
var collection = require('nested_collection');
var channels = new collection.instance();
var subscriptions = new collection.instance();

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
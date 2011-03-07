var util = require('util');
var channels = require('channels');

var executed = [];
var testFunc = function (subscriberId, message) {
	executed.push(subscriberId + ";" + message);
};

exports["test subscribe"] = function (test) {
	channels.subscribe('subscriberId1', 'channelId1', testFunc);
	channels.subscribe('subscriberId1', 'channelId2', testFunc);
	channels.subscribe('subscriberId1', 'channelId3', testFunc);
	channels.subscribe('subscriberId2', 'channelId1', testFunc);

	test.ok(channels.isSubscribed('subscriberId1', 'channelId1'));
	test.ok(channels.isSubscribed('subscriberId1', 'channelId2'));
	test.ok(channels.isSubscribed('subscriberId1', 'channelId3'));
	test.ok(channels.isSubscribed('subscriberId2', 'channelId1'));
	test.ok(!channels.isSubscribed('subscriberId', 'fail'));

	test.done();
}

exports["test publish"] = function (test) {
	channels.publish('channelId1', 'messi');
	test.deepEqual(['subscriberId1;messi', 'subscriberId2;messi'], executed);

	test.done();
}

exports["test unsubscribe"] = function (test) {
	channels.unsubscribe('subscriberId1', 'channelId4');
	channels.unsubscribe('subscriberId1', 'channelId2');

	test.ok(!channels.isSubscribed('subscriberId1', 'channelId2'));

	test.done();
}

exports["test unsubscribe all"] = function (test) {
	channels.unsubscribeAll('subscriberId1');

	test.ok(!channels.isSubscribed('subscriberId1', 'channelId1'));
	test.ok(!channels.isSubscribed('subscriberId1', 'channelId3'));

	test.done();
}


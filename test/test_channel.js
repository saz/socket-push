var util = require('util');
var channel = require('channel');

var executed = [];
var testFunc = function (subscriberId, message) {
    executed.push(subscriberId + ";" + message);
};

exports["test subscribe"] = function (test) {
    channel.subscribe('subscriberId1', 'channelId1', testFunc);
    channel.subscribe('subscriberId1', 'channelId2', testFunc);
    channel.subscribe('subscriberId1', 'channelId3', testFunc);
    channel.subscribe('subscriberId2', 'channelId1', testFunc);

    test.ok(channel.isSubscribed('subscriberId1', 'channelId1'));
    test.ok(channel.isSubscribed('subscriberId1', 'channelId2'));
    test.ok(channel.isSubscribed('subscriberId1', 'channelId3'));
    test.ok(channel.isSubscribed('subscriberId2', 'channelId1'));
    test.ok(!channel.isSubscribed('subscriberId', 'fail'));

    test.done();
}

exports["test getsubscribers"] = function (test) {
    test.deepEqual(['channelId1', 'channelId2', 'channelId3'], channel.getSubscriptions('subscriberId1'));

    test.done();
}

exports["test getsubscriptions"] = function (test) {
    test.deepEqual(['subscriberId1', 'subscriberId2'], channel.getSubscribers('channelId1'));

    test.done();
}

exports["test publish"] = function (test) {
    channel.onPublish(testFunc);
    channel.publish('channelId1', 'messi');
    test.deepEqual(['subscriberId1;messi', 'subscriberId2;messi'], executed);

    test.done();
}

exports["test unsubscribe"] = function (test) {
    channel.unsubscribe('subscriberId1', 'channelId4');
    channel.unsubscribe('subscriberId1', 'channelId2');

    test.ok(!channel.isSubscribed('subscriberId1', 'channelId2'));

    test.done();
}

exports["test unsubscribe all"] = function (test) {
    channel.unsubscribeAll('subscriberId1');

    test.ok(!channel.isSubscribed('subscriberId1', 'channelId1'));
    test.ok(!channel.isSubscribed('subscriberId1', 'channelId3'));

    test.done();
}


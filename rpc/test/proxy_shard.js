var util = require('util');
var shardProxy = require('rpc/proxy/shard');
var localProxy = require('rpc/proxy/local');

var fixture = require('test/fixtures/rpc');

exports["unshardable"] = function (test) {

    var shard1 = new localProxy(fixture.serviceShardInt, fixture.proxiedShardInt);
    var shard2 = new localProxy(fixture.serviceShardInt, fixture.proxiedShardInt2);

    var testService = new shardProxy(fixture.serviceShardInt, 'arg');
    testService.addShard(shard1);

    test.throws(function () {
        testService.foo('arg1', 'arg2', function() {
        }, function (error) {
        });
    });

    test.done();
}

exports["shardByInt"] = function (test) {

    var shard1 = new localProxy(fixture.serviceShardInt, fixture.proxiedShardInt);
    var shard2 = new localProxy(fixture.serviceShardInt, fixture.proxiedShardInt2);

    var testService = new shardProxy(fixture.serviceShardInt, 'arg1');
    testService.addShard(shard1);
    testService.addShard(shard2);
    var myResult;
    testService.foo(1, 2);
    testService.foo(1, 2, function(result) {
        myResult = result;
    }, function(error) {
        throw error;
    });

    test.equals(1, myResult);

    testService.foo(4, 2, function(result) {
        myResult = result;
    });

    test.equals(0, myResult);

    test.done();
}

exports["stringHash"] = function (test) {
    var testService = new shardProxy(fixture.serviceShardInt, 'arg1');

    test.equals(0, testService.hashString('foo') % 2);
    test.equals(1, testService.hashString('1') % 2);

    test.done();
}

exports["shardByString"] = function (test) {

    var shard1 = new localProxy(fixture.serviceShardString, fixture.proxiedShardString);
    var shard2 = new localProxy(fixture.serviceShardString, fixture.proxiedShardString2);

    var testService = new shardProxy(fixture.serviceShardString, 'arg1');
    testService.addShard(shard1);
    testService.addShard(shard2);
    var myResult;
    testService.foo("foo", 2);
    testService.foo("foo", 2, function(result) {
        myResult = result;
    }, function(error) {
        throw error;
    });

    test.equals(1, myResult);

    testService.foo("1", 2, function(result) {
        myResult = result;
    });

    test.equals(2, myResult);

    test.done();
}
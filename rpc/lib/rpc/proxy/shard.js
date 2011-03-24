var Proxy = require('rpc/proxy').Abstract,
    util = require('util');
    logger = require('logger').getLogger('rpc');

function ShardedProxy(service, shardByParam) {
    Proxy.call(this, service);
    this.shardByParam = shardByParam;
    this.shards = [];
    this.shardCount = 0;
}

util.inherits(ShardedProxy, Proxy);

ShardedProxy.prototype.getShards = function() {
    return this.shards;
}

ShardedProxy.prototype.errorHandler = function(exception, emitter) {
    logger.warn("Shard " + emitter.shardId + " is erroneous: " + exception);
}

ShardedProxy.prototype.addShard = function(proxyObject) {
    this.shards.push(proxyObject);
    this.shardCount = this.shards.length;
    proxyObject.shardId = this.shardCount - 1;
    proxyObject.on('error', this.errorHandler);
}

ShardedProxy.prototype.deleteShard = function(index) {
    delete this.shards[index].shardId;
    this.shards[index].removeListener('error', this.errorHandler);

    this.shards.slice(index, 1);
    this.shardCount = this.shards.length;
}

ShardedProxy.prototype.replaceShard = function(index, proxyObject) {
    this.shards[index].removeListener('error', this.errorHandler);
    this.shards.slice(index, 1, proxyObject);
    proxyObject.shardId = this.shardCount - 1;
    proxyObject.on('error', this.errorHandler);
}

ShardedProxy.prototype.hashString = function(value) {
    var hash = 0;
    if (value.length == 0) {
        return code;
    }
    for (i = 0; i < value.length; i++) {
        char = value.charCodeAt(i);
        hash = 31 * hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

ShardedProxy.prototype.proxyCall = function(method, args) {
    var params = this.serviceDefinition.methods[method].params;
    var param, value, shardId, shardObject;

    for (i = 0; i < params.length - 1; i++) {
        param = params[i];
        if (param.name == this.shardByParam) {
            value = args[i];
            switch (param.type) {
                case 'string':
                    shardId = this.hashString(value) % this.shardCount;
                    break;
                case 'number':
                    shardId = value % this.shardCount;
                    break;
                default:
                    throw "RPC Service '" + this.serviceDefinition.name + "':Cannot shard method " + method + " by param type " + param.type;
            }

            shardObject = this.shards[shardId];
            shardObject[method].apply(shardObject, args);
            return;
        }
    }

    throw "RPC Service '" + this.serviceDefinition.name + "': Method " + method + " is not shardable by Param " + this.shardByParam;
}

module.exports = function(service, shardByParam) {
    return new ShardedProxy(service, shardByParam);
}

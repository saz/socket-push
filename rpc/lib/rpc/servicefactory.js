var sys = require(process.binding('natives').util ? 'util' : 'sys');
var localServices = {};
var proxyServices = {};

exports.getLocalService = function(serviceName) {
    return localServices[serviceName];
}

exports.removeLocalService = function(serviceName) {
    delete localServices[serviceName];
}

exports.getProxy = function(serviceName) {
    return proxyServices[serviceName];
}

exports.removeProxy = function(serviceName) {
    var proxy = proxyServices[serviceName];
    if (proxy == undefined) {
        return;
    }
    delete proxy;
    delete proxyServices[serviceName];
}

function createProxy(serviceName, serviceDefinition, serviceConfig) {
    switch (serviceConfig.location) {
        // Sharded remote service
        case 'shard':
            if (serviceConfig.shardBy == undefined) {
                throw "Missing 'shardBy' in sharded service '" + serviceName + "'";
            }
            if (serviceConfig.shards == undefined) {
                throw "Missing 'shards' in sharded service '" + serviceName + "'";
            }

            var shardProxy = new require('rpc/proxy/shard')(serviceDefinition, serviceConfig.shardBy);
            serviceConfig.shards.forEach(function (shardDef) {
                shardProxy.addShard(createProxy(serviceName, serviceDefinition, shardDef));
            });
            return shardProxy;
        // Remote service
        case 'remote':
            return new (require('rpc/proxy/http'))(serviceDefinition, serviceConfig.host, serviceConfig.port);
        // Local service
        case 'local':
            // Set custom implementation by config
            var implementation = serviceName;
            if (serviceConfig.implementation !== undefined) {
                implementation = serviceConfig.implementation;
            }
            localServices[serviceName] = require("service/" + serviceName);
            return new (require('rpc/proxy/local'))(serviceDefinition, localServices[serviceName]);
        default:
            throw "Unknown service location '" + serviceConfig.location + "' in service '" + serviceName + "'";
    }
}

/**
 * Creates a proxy service
 *
 * @param serviceName
 * @param serviceDefinition
 * @param serviceConfig
 */
exports.createProxy = function(serviceName, serviceConfig) {
    var serviceDefinition = require('service/' + serviceName + "_description");
    proxyServices[serviceName] = createProxy(serviceName, serviceDefinition, serviceConfig);
    return proxyServices[serviceName];
}

/**
 * creates proxy services from config, binds them
 * and registers them for .getService + .removeService
 *
 * @param binding
 * @param servicesConfig
 */
exports.buildFromConfig = function(binding, servicesConfig) {
    for (var serviceName in servicesConfig) {
        sys.log("Loading service " + serviceName);
        var serviceDefinition = require('service/' + serviceName + "_description");
        proxyServices[serviceName] = createProxy(serviceName, serviceDefinition, servicesConfig[serviceName]);
        binding.bindService(
            serviceDefinition,
            proxyServices[serviceName]
        );
    }

}


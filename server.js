var path = require('path');
var base = path.dirname(__dirname);
require.paths.push(base);
require.paths.push(base + '/lib');
require.paths.push(base + '/rpc/lib');

var config = require('config/config'),
    sys = require(process.binding('natives').util ? 'util' : 'sys'),
    services = {},
    localObjects = {};

function getProxyService(serviceName, description) {
    var serviceDefinition = require('service/' + serviceName);
    switch (description.location) {
        case 'shard':
            if (description.shardBy == undefined) {
                throw "Missing 'shardBy' in sharded service '" + serviceName + "'";
            }
            if (description.shards == undefined) {
                throw "Missing 'shards' in sharded service '" + serviceName + "'";
            }

            var shardProxy = new require('rpc/proxy/shard')(serviceDefinition, description.shardBy);
            description.shards.forEach(function (shardDef) {
                shardProxy.addShard(getProxyService(serviceName, shardDef));
            });
            return shardProxy;
        case 'remote':
            return new (require('rpc/proxy/http'))(serviceDefinition, description.host, description.port);
        case 'local':
            localObjects[serviceName] = require(serviceName);
            return new (require('rpc/proxy/local'))(serviceDefinition, require(serviceName));
        default:
            throw "Unknown service location '" + description.location + "' in service '" + serviceName + "'";
    }
}

// Create admin port
var adminPort = require('rpc/httpbinding');

for (var serviceName in config.services) {
    sys.log("Loading service " + serviceName);
    services[serviceName] = getProxyService(serviceName, config.services[serviceName]);
    adminPort.bindService(require('service/' + serviceName), services[serviceName]);
}

// Check required service definitions
if (services.user == undefined) {
    throw "Service 'user' not defined";
}

if (services.auth == undefined) {
    throw "Service 'auth' not defined";
}

/**
 * Add event listener for group publish
 * Only necessary for local channels, channel-proxy objects don't publish
 */
if (localObjects.channel != undefined) {
    localObjects.channel.onPublish(services.user.publish);
}

adminPort.start(config.adminPort.port, config.adminPort.hostname);
sys.log("adminPort listening on " + config.adminPort.hostname + ":" + config.adminPort.port);

// Create client port if configured
if (config.clientPort != undefined) {
    if (localObjects.user == undefined) {
        throw "Clientport needs local user-service";
    }

    // Add event listener to unsubscribe disconnected user from all groups
    localObjects.user.onDisconnect(services.channel.unsubscribeAll);
    localObjects.user.setDisconnectTimeout(config.removeUserAfterDisconnectTimeOut);

    var clientServer = require('client');
    var localProxy = require('rpc/proxy/local');
    clientServer.setAuthService(services['auth']);
    clientServer.setAuthTimeout(config.authenticationTimeOut);
    clientServer.setUserService(localObjects.user);
    clientServer.start(config.clientPort.port, config.clientPort.hostname);
    sys.log("ClientServer listening on " + config.clientPort.hostname + ":" + config.clientPort.port);
}
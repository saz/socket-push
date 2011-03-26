var logger = require('logger').getLogger('manager');

function manager() {
    var _config,
        nodes = {},
        nodeProxies = {},
        status = {};

    function validateHost(name, host) {
        if (typeof host.hostname !== 'string') {
            throw new Error("hostname in host '" + name + "'not set or not a string");
        }

        if (typeof host.port !== 'number') {
            throw new Error("port in host '" + name + "'not set or not a number");
        }
    }

    function validateNode(name, node) {
        if (typeof node.adminPort !== 'object') {
            throw new Error("adminPort in node '" + name + "'not set");
        }
        validateHost('adminPort', node.adminPort);
    }

    function validateService(name, service, obligate) {
        if (typeof service !== 'object') {
            if (obligate !== true) {
                return;
            }
            throw new Error("Service '" + name + "' not set");
        }

        
        if (service.nodes.length === undefined) {
            throw new Error("services." + name + ".nodes must be an array");
        }
        service.nodes.forEach(function (node) {
            if (nodes[node] === undefined) {
                throw new Error("Node '" + node + "' not defined");
            };
        });
    }

    function validateConfig(config) {
        if (typeof config.nodes !== 'object') {
            throw new Error("Nodes not set");
        }

        for (nodeName in config.nodes) {
            validateNode(nodeName, config.nodes[nodeName]);
        }
        nodes = config.nodes;

        if (typeof config.services !== 'object') {
            throw new Error("Services not set");
        }

        validateService('auth', config.services.auth, true);
        validateService('user', config.services.user, true);
        validateService('channel', config.services.channel, false);
    }

    function clearChecks() {
        for (node in status) {
            if (status[node].retryTimer !== undefined) {
                clearTimeout(status[node].retryTimer);
            }
        }
        status = {};
    }

    function createCheck(nodeName) {
        status[nodeName] = {
            up: false,
            downSince: 0 | ((new Date()).getTime() / 1000),
            retryTimer: undefined
        };

        function fail(nodeName) {
            var state = status[nodeName];
            if (state.up === true) {
                logger.error("Node '" + nodeName + "' went down");
                state.up = false;
                state.downSince = 0 | ((new Date()).getTime() / 1000);
            }
            state.retryTimer = setTimeout(function () {
                logger.info("Retry " + nodeName);
                check(nodeName);
            }, 5000);
        }

        function up(nodeName) {
            var state = status[nodeName];
            state.up = true;
            state.downSince = 0;
            clearTimeout(state.retryTimer);

            logger.error("Node '" + nodeName + "' came up");
        }

        function check(nodeName) {

            var node = nodes[nodeName].adminPort;
            var options = {
                host: node.hostname,
                port: node.port,
                path: '/heartbeat'
            };
            var client = require('http').get(options,
                function(res) {
                    up(nodeName);
                    client.connection.on('close', function () {
                        fail(nodeName);
                    });

                    var data = '';
                    res.on('data', function(chunk) {
                        data += chunk;
                    });
                    res.on('end', function() {
                        fail(nodeName);
                    });
                }).on('error', function(e) {
                    fail(nodeName);
                });
        }

        check(nodeName);
    }

    this.setConfig = function(config) {
        validateConfig(config);
        clearChecks();
        nodeProxies = {};
        status = {};
        for(nodeName in nodes) {
            var port = nodes[nodeName].adminPort;
            nodeProxies[nodeName] = require('noderpc').createProxy('worker', {
                location: 'remote',
                hostname: port.hostname,
                port: port.port
            });
            createCheck(nodeName);
        }

        _config = config;
    };

    this.getConfig = function(nodeId) {
        if (nodes[nodeId] === undefined) {
            throw new Error("Unknown node '" + nodeId + "'");
        }

        function buildNodeInfo(nodeName) {
            if (nodeId == nodeName) {
                return {
                    location: 'local'
                };
            }
            else {
                return {
                    location: 'remote',
                    hostname: nodes[nodeName].adminPort.hostname,
                    port: nodes[nodeName].adminPort.port
                }
            }
        }

        var nodeCfg = nodes[nodeId];
        nodeCfg.options = _config.options;
        nodeCfg.services = {};
        for(serviceName in _config.services) {
            var service = _config.services[serviceName];
            if (service.nodes.length === 1) {
                nodeCfg.services[serviceName] = buildNodeInfo(service.nodes[0]);
            }
            else {
                nodeCfg.services[serviceName] = {
                    location: 'shard',
                    shardBy: service.shardBy,
                    shards: []
                };
                service.nodes.forEach(function(nodeName) {
                    nodeCfg.services[serviceName].shards.push(buildNodeInfo(nodeName));
                });
            }
        }

        return nodeCfg;
    };

    this.distributeConfig = function () {
        for(nodeName in nodeProxies) {
            nodeProxies[nodeName].reload(function(success) {
                logger.info("Distributed config to '" + nodeName + "'");
            },
            function (err) {
                logger.error("Error while ditributing config to '" + nodeName + "': " + err);
            });
        }
    };

    this.status = function () {
        var s = {};
        for (node in status) {
            s[node] = {
                up: status[node].up,
                downSince: status[node].downSince
            };
        }
        return s;
    };
}

module.exports = function() {
    return new manager();
}
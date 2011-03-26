var logger = require('logger').getLogger('manager'),
    util = require('util'),
    _ = require('nimble');

function manager() {
    var _config,
        nodes = {},
        manager = this;

    function validateConfig(config) {
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
                nodes[node].used = true;
            });
        }

        if (typeof config.nodes !== 'object') {
            throw new Error("Nodes not set");
        }

        _.map(config.nodes, function(node, name) {
            validateNode(name, node);
            nodes[name] = {
                config: node,
                state: {},
                used: false
            };
        });

        if (typeof config.services !== 'object') {
            throw new Error("Services not set");
        }

        validateService('auth', config.services.auth, true);
        validateService('user', config.services.user, true);
        validateService('channel', config.services.channel, false);
    }

    function clearWatchdogs() {
        _.map(nodes, function(node) {
            var state = node.state;
            if (state.retryTimer !== undefined) {
                clearTimeout(state.retryTimer);
            }
            state = {};
        });
    }

    function createWatchdog(node, name) {
        node.state = {
            up: false,
            downSince: 0 | ((new Date()).getTime() / 1000),
            retryTimer: undefined,
            failOver: undefined
        };

        function failover() {
            logger.info("Try failover " + name);
            var spareNode = findSpare();
            if (spareNode === undefined) {
                logger.fatal("No spare nodes available");
                node.state.failOver = setTimeout(function () {
                    failover();
                }, 5000);
                return;
            }

            // Replace failed node by spare node
            logger.error("Replacing node " + name + " by spare node " + spareNode);
            _.map(_config.services, function(service) {
                service.nodes.forEach(function(nodeName, i) {
                    if (nodeName === name) {
                        service[i] = spareNode;
                    }
                });
            });
            node.used = false;
            process.nextTick(function () {
                manager.distributeConfig();
            });
        }

        function findSpare() {
            var _node;
            for (i in nodes) {
                _node = nodes[i];
                if (_node.used === false && _node.state.up === true) {
                    return i;
                }
            }
        }

        function fail() {
            var state = node.state;
            if (state.up === true) {
                logger.error("Node '" + name + "' went down");
                state.up = false;
                state.downSince = 0 | ((new Date()).getTime() / 1000);
                
                state.failOver = setTimeout(function () {
                    failover();
                }, 5000);
            }
            state.retryTimer = setTimeout(function () {
                //logger.info("Retry " + name);
                check();
            }, 1000);
        }

        function up() {
            var state = node.state;
            state.up = true;
            state.downSince = 0;
            clearTimeout(state.retryTimer);
            clearTimeout(state.failOver);

            logger.error("Node '" + name + "' came up on " + node.config.adminPort.hostname + ":" + node.config.adminPort.port);
        }

        function check() {
            var port = node.config.adminPort;
            var options = {
                host: port.hostname,
                port: port.port,
                path: '/heartbeat'
            };
//            logger.debug("Check http://" + options.host + ":" + options.port + options.path)
            var client = require('http').get(options,
                function(res) {
                    up();
                    client.connection.on('close', function () {
                        fail();
                    });

                    var data = '';
                    res.on('data', function(chunk) {
                        data += chunk;
                    });
                    res.on('end', function() {
                        fail();
                    });
                }).on('error', function(e) {
                    fail();
                });
        }

        check();
    }

    function createProxy(node, name) {
        var port = node.config.adminPort;
        node.proxy = require('noderpc').createProxy('worker', {
            location: 'remote',
            hostname: port.hostname,
            port: port.port
        });
        node.proxy.on('error', function(e) {
            logger.error("Error when making call to " + name + ": " + e);
        });
    }

    this.setConfig = function(config) {
        nodes = {};
        validateConfig(config);
        clearWatchdogs();
        _.map(nodes, createProxy);
        _.map(nodes, createWatchdog);

        _config = config;
    };

    this.getConfig = function(nodeId) {
        var _node = nodes[nodeId];
        if (_node === undefined) {
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
                    hostname: _node.config.adminPort.hostname,
                    port: _node.config.adminPort.port
                }
            }
        }

        var nodeCfg = _node.config;
        nodeCfg.options = _config.options;
        nodeCfg.services = {};
        nodeCfg.isSpareNode = !_node.used;
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
        _.map(nodes, function(node, name) {
            if (node.state.up === false) {
                return;
            }
            node.proxy.reload(function(success) {
                logger.info("Distributed config to '" + name + "'");
            }, function(error) {
                logger.info("Error when distributing config to '" + name + "'");
            });
        });
    };

    this.status = function () {
        var s = {};
        for (node in nodes) {
            var state = nodes[node].state;
            s[node] = {
                up: state.up,
                downSince: state.downSince
            };
        }
        return s;
    };
}

module.exports = function() {
    return new manager();
}
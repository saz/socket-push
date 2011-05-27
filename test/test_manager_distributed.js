var util = require('util');
var mgr = require('service/manager/distributed')();
var fixture = require('config/distributed');
var fixtureSsl = require('config/distributed-ssl');

exports["setConfig undefined node"] = function (test) {
    test.throws(function () {
        mgr.setConfig({
            nodes: {
                 'node1': {
                     clientPort: {hostname: '127.0.0.1', port: 8080},
                     adminPort: {hostname: '127.0.0.1', port: 8181}
                 }
            },
            services: {
                user: ['node2']
            }
        });
    });
    test.done();
}

exports["setConfig invalid node"] = function (test) {
    test.throws(function () {
        mgr.setConfig({
            nodes: {
                'node1': {
                    bla: 'foo'
                }
            }
        });
    });
    test.done();
}

exports["setConfig missing service"] = function (test) {
    test.throws(function () {
        mgr.setConfig({
            nodes: {
                'node1': {
                    clientPort: {hostname: '127.0.0.1', port: 8080},
                    adminPort: {hostname: '127.0.0.1', port: 8181}
                }
            }
        });
    }, "Service 'user' not set");
    test.done();
}

exports["getConfig for non existant node"] = function (test) {
    mgr.setConfig(fixture);

    test.throws(function () {
        mgr.getConfig('node4');
    });

    test.done();
}

exports["getConfig"] = function (test) {
    mgr.setConfig(fixture);

    test.deepEqual({
        clientPort: {hostname: '127.0.0.1', port: 8101},
        adminPort: {hostname: '127.0.0.1', port: 8201},
        options: {
            removeUserAfterDisconnectTimeOut: 20000, // Millieconds
            authenticationTimeOut: 10000 // Millieconds
        },
        services: {
            auth: {
                location: 'local'
            },
            user: {
                location: 'shard',
                shardBy: 'userId',
                shards: [
                    {
                        location: 'local'
                    },
                    {
                        location: 'remote',
                        hostname: '127.0.0.1',
                        port: 8202
                    }
                ]
             },
            channel: {
                location: 'remote',
                hostname: '127.0.0.1',
                port: 8202
            }
        },
        isSpareNode: false
    }, mgr.getConfig('node1'));

    test.done();
}

exports["getConfigSsl"] = function (test) {
    mgr.setConfig(fixtureSsl);

    test.deepEqual({
        clientPort: {
            hostname: '127.0.0.1',
            port: 8101,
            sslKey: '/path/to/ssl.key',
            sslCert: '/path/to.crt'
        },
        adminPort: {hostname: '127.0.0.1', port: 8201},
        options: {
            removeUserAfterDisconnectTimeOut: 20000, // Millieconds
            authenticationTimeOut: 10000 // Millieconds
        },
        services: {
            auth: {
                location: 'local'
            },
            user: {
                location: 'shard',
                shardBy: 'userId',
                shards: [
                    {
                        location: 'local'
                    },
                    {
                        location: 'remote',
                        hostname: '127.0.0.1',
                        port: 8202
                    }
                ]
             },
            channel: {
                location: 'remote',
                hostname: '127.0.0.1',
                port: 8202
            }
        },
        isSpareNode: false
    }, mgr.getConfig('node1'));

    test.done();
}

exports["replaceNode"] = function (test) {
    var services = {
        auth: {
            nodes: ['node1']
        },
        user: {
            shardBy: 'userId',
            nodes: ['node1', 'node2']
        },
        channel: {
            shardBy: 'channelId',
            nodes: ['node2']
        }
    };
    mgr.replaceNode(services, "node1", "spare1");
    test.deepEqual(services, {
        auth: {
            nodes: ['spare1']
        },
        user: {
            shardBy: 'userId',
            nodes: ['spare1', 'node2']
        },
        channel: {
            shardBy: 'channelId',
            nodes: ['node2']
        }
    });
    test.done();
}
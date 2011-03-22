var util = require('util');
var mgr = require('service/manager/distributed')();
var fixture = require('config/distributed');

exports["setConfig undefined node"] = function (test) {
    test.throws(function () {
        mgr.setConfig({
            nodes: {
                 'node1': {
                     pidFile: 'socket-node1.pid',
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
                    pidFile: 'socket-node1.pid',
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
        pidFile: 'socket-node1.pid',
        clientPort: {hostname: '127.0.0.1', port: 8080},
        adminPort: {hostname: '127.0.0.1', port: 8181},
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
                        port: 9191
                    }
                ]
             },
            channel: {
                location: 'remote',
                hostname: '127.0.0.1',
                port: 9191
            }
        }
    }, mgr.getConfig('node1'));

    test.done();
}

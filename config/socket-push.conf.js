module.exports = {
    nodes: {
        node1: {
            clientPort: {
                hostname: '127.0.0.1',
                port: 8101,
                useSSL: false,
                sslKey: '/path/to/ssl.key',
                sslCert: '/path/to.crt'
            },
            adminPort: {hostname: '127.0.0.1', port: 8201}
        },
        node2: {
            clientPort: {
                hostname: '127.0.0.1',
                port: 8102,
                useSSL: false,
                sslKey: '/path/to/ssl.key',
                sslCert: '/path/to.crt'
            },
            adminPort: {hostname: '127.0.0.1', port: 8202}
        },
        spare1: {
            clientPort: {
                hostname: '127.0.0.1',
                port: 8103,
                useSSL: false,
                sslKey: '/path/to/ssl.key',
                sslCert: '/path/to.crt'
            },
            adminPort: {hostname: '127.0.0.1', port: 8203}
        }
    },
    options: {
        removeUserAfterDisconnectTimeOut: 20000, // Millisconds
        authenticationTimeOut: 10000 // Millisconds
    },
    services: {
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
    },
    manager: {
        pidfile: '/tmp/socket-push-manager.pid',
        listen: '127.0.0.1',
        port: 8282,
        workerConnectRetry: 10000 // Milliseconds
    },
}

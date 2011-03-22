module.exports = {
    nodes: {
        node1: {
            pidFile: 'socket-node1.pid',
            clientPort: {hostname: '127.0.0.1', port: 8080},
            adminPort: {hostname: '127.0.0.1', port: 8181}
        },
        node2: {
            pidFile: 'socket-node2.pid',
            clientPort: {hostname: '127.0.0.1', port: 9090},
            adminPort: {hostname: '127.0.0.1', port: 9191}
        }
    },
    options: {
        removeUserAfterDisconnectTimeOut: 20000, // Millieconds
        authenticationTimeOut: 10000 // Millieconds
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
    }
}

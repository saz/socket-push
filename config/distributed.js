module.exports = {
    nodes: {
        node1: {
            pidFile: 'socket-push.pid',
            clientPort: {hostname: '127.0.0.1', port: 8080},
            adminPort: {hostname: '127.0.0.1', port: 8181}
        },
        node2: {
            pidFile: 'socket-push.pid',
            clientPort: {hostname: '127.0.0.1', port: 9090},
            adminPort: {hostname: '127.0.0.1', port: 9191}
        }
    },
    removeUserAfterDisconnectTimeOut: 20000, // Millieconds
    authenticationTimeOut: 10000, // Millieconds
    services: {
        auth: ['node1'],
        user: ['node1', 'node2'],
        channel: ['node2']
    }
}

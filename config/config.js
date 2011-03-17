module.exports = {
    clientPort: {hostname: '127.0.0.1', port: 8080},
    adminPort: {hostname: '127.0.0.1', port: 8181},
    removeUserAfterDisconnectTimeOut: 20000, // Millieconds
    authenticationTimeOut: 10000, // Millieconds
    services: {
        auth: {
            location: 'local'
        },
        user: {
            location: 'local'
        },
        channel: {
            location: 'local'
        }
    }
}

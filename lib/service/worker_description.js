module.exports = {
    name: 'worker',
    methods: {
        'getConfig': {
            params: [
            ],
            description: 'Reload worker config'
        },
        'reloadConfig': {
            params: [
            ],
            description: 'Reload worker config'
        },
        'heartbeat': {
            params: [
            ],
            description: 'Heartbeat connection. Remains open.'
        }
    }
};
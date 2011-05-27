module.exports = {
    name: 'manager',
    methods: {
        'setConfig': {
            params: [
                {name: 'config', type: 'object'}
            ],
            description: 'Set distributed worker config'
        },
        'getConfig': {
            params: [
                {name: 'nodeId', type: 'string'}
            ],
            description: 'Get distributed worker config'
        },
        'distributeConfig': {
            params: [
            ],
            description: 'Distribute config to all workers'
        },
        'status': {
            params: [
            ],
            description: 'Show worker status'
        }
    }
};
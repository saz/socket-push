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
                {name: 'nodeId', type: 'number'}
            ],
            description: 'Get distributed worker config'
        }
    }
};
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
            ],
            description: 'Get distributed worker config'
        }
    }
};
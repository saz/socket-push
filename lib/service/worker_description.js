module.exports = {
    name: 'worker',
    methods: {
        'reload': {
            params: [
            ],
            description: 'Reload worker config'
        },
        'setConfig': {
            params: [
                {
                    name: 'config',
                    type: 'object'
                }
            ],
            description: 'Set worker config and reload'
        }
    }
};
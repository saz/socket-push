module.exports = {
    name: 'auth',
    methods: {
        'set': {
            params: [
                {name: 'userId', type: 'number'},
                {name: 'sessionId', type: 'string'}
            ],
            description: 'Set Auth'
        },
        'remove': {
            params: [
                {name: 'userId', type: 'number'}
            ],
            description: 'Delete Auth'
        }
    }
};
module.exports = {
    name: 'user',
    methods: {
        'remove': {
            params: [
                {name: 'userId', type: 'number'}
            ],
            description: 'Remove user'
        },
        'publish': {
            params: [
                {name: 'userId', type: 'number'},
                {name: 'message', type: 'object'}
            ],
            description: 'Publish a message to userid'
        },
        'getFrontendServer': {
            params: [
                {name: 'userId', type: 'number'}
            ],
            description: 'Tells the frontend server for a userid'
        },
        'listAll': {
            params: [
            ],
            description: 'List all users'
        }
    }
};

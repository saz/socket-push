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
        }
}
};

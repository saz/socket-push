module.exports = {
    name: 'channel',
    methods: {
        'subscribe': {
            params: [
                {name: 'userId', type: 'number'},
                {name: 'channelId', type: 'string'}
            ],
            description: 'Subscribe channel'
        },
        'unsubscribe': {
            params: [
                {name: 'userId', type: 'number'},
                {name: 'channelId', type: 'string'}
            ],
            description: 'Unsubscribe channel'
        },
        'unsubscribeAll': {
            params: [
                {name: 'userId', type: 'number'},
            ],
            description: 'Unsubscribe from all channels'
        },
        'getSubscriptions': {
            params: [
                {name: 'userId', type: 'number'}
            ],
            description: 'Get subscriptions of user'
        },
        'getSubscribers': {
            params: [
                {name: 'channelId', type: 'string'}
            ],
            description: 'Get subscribers of a channel'
        },
        'publish': {
            params: [
                {name: 'channelId', type: 'string'},
                {name: 'message', type: 'object'}
            ],
            description: 'Publish a message to channel'
        },
        'listAll': {
            params: [
            ],
            description: 'List all channels'
        }
    }
};
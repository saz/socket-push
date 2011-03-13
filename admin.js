var connect = require('connect'),
        util = require('util'),
        auth = require('auth'),
        users = require('users'),
        channels = require('channels'),
        config = require('config');

var server = connect(
        connect.logger()
        );

var api = {};

function bind(service, methods) {
    api[service] = methods;
    server.use(connect.router(function(app) {
        methods.forEach(function(item) {
            app.get(item.route, function(req, res, next) {
                try {
                    var result = item.method(req.params);
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    if (result !== undefined) {
                        res.write(JSON.stringify(result));
                    }
                    res.end();
                }
                catch (message) {
                    if (typeof message != 'string') {
                        throw message;
                    }
                    res.writeHead(500, {'Content-Type': 'text/html'});
                    res.write(message);
                    res.end();
                }
            });
        });
    }));
}

exports.bindAuthService = function(authService) {
    bind('auth', [
        {
            route: '/auth/set/:userId/:sessionId',
            description: 'Set Auth',
            method: function(params) {
                return authService.setAuth(params.userId, params.sessionId);
            }
        },
        {
            route: '/auth/delete/:userId',
            description: 'Delete Auth',
            method: function(params) {
                return authService.deleteAuth(params.userId);
            }
        }
    ]);
}

exports.bindUserService = function(userService) {
    bind('user', [
        {
            route: '/user/publish/:userId/:message',
            description: 'Publish a message to userid',
            method: function(params) {
                return userService.publish(params.userId, JSON.parse(params.message));
            }
        },
        {
            route: '/user/remove/:userId',
            description: 'Remove user',
            method: function(params) {
                return userService.remove(params.userId);
            }
        }
    ]);
}

exports.bindChannelService = function(channelService) {
    bind('channel', [
        {
            route: '/channel/subscribe/:userId/:channelId',
            description: 'Subscribe channel',
            method: function(params) {
                return channelService.subscribe(params.userId, params.channelId);
            }
        },
        {
            route: '/channel/unsubscribe/:userId/:channelId',
            description: 'Unsubscribe channel',
            method: function(params) {
                return channelService.unsubscribe(params.userId, params.channelId);
            }
        },
        {
            route: '/channel/getsubscriptions/:userId',
            description: 'Get subscriptions of user',
            method: function(params) {
                return channelService.getSubscriptions(params.userId);
            }
        },
        {
            route: '/channel/getsubscribers/:channelId',
            description: 'Get subscriptions of user',
            method: function(params) {
                return channelService.getSubscribers(params.channelId);
            }
        },
        {
            route: '/channel/publish/:channelId/:message',
            description: 'Publish a message to channel',
            method: function(params) {
                return channelService.publish(params.channelId, JSON.parse(params.message));
            }
        }
    ]);
}

exports.start = function(port) {
    bind('api', [
        {
            route: '/api',
            description: 'Self exposing API',
            method: function() {
                return api;
            }
        }
    ]);
    server.listen(port);
}
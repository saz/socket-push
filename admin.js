var connect = require('connect'),
        util = require('util'),
        auth = require('auth'),
        users = require('users'),
        channels = require('channels'),
        config = require('config');

var server = connect(
        connect.logger()
        );

users.setDisconnectCallback(function () {

}, config.disconnectTimeOut);

function respond(res, message) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(message);
    res.end();
}

function respondError(res, message) {
    if (typeof message != 'string') {
        throw message;
    }
    res.writeHead(500, {'Content-Type': 'text/html'});
    res.write(message);
    res.end();
}

server.use(connect.router(function(app) {
    app.get('/auth/set/:userid/:sessionid', function(req, res, next) {
        auth.setAuth(req.params.userid, req.params.sessionid);
        respond(res, req.params.sessionid);
    });
    app.get('/auth/delete/:userid', function(req, res, next) {
        auth.deleteAuth(req.userid);
        respond(res, "");
    });
    app.get('/user/publish/:userid/:message', function(req, res, next) {
        try {
            users.publish(req.params.userid, req.params.message);
            respond(res, "");
        }
        catch (e) {
            respondError(res, e);
        }
    });
    app.get('/user/remove/:useriId', function(req, res, next) {
        try {
            users.remove(req.params.userId);
            respond(res, "");
        }
        catch (e) {
            respondError(res, e);
        }
    });
    app.get('/channel/subscribe/:userId/:channelId', function(req, res, next) {
        try {
            channels.subscribe(req.params.userId, req.params.channelId, function (userId, message) {
                users.publish(userId, message);
            });
            respond(res, "");
        }
        catch (e) {
            respondError(res, e);
        }
    });
    app.get('/channel/unsubscribe/:userid/:channelId', function(req, res, next) {
        try {
            channels.unsubscribe(req.params.userId, req.params.channelId);
            respond(res, "");
        }
        catch (e) {
            respondError(res, e);
        }
    });
    app.get('/channel/getsubscriptions/:userId', function(req, res, next) {
        try {
            var s = channels.getSubscriptions(req.params.userId);
            respond(res, JSON.stringify(s));
        }
        catch (e) {
            respondError(res, e);
        }
    });
    app.get('/channel/getsubscribers/:channelId', function(req, res, next) {
        try {
            var s = channels.getSubscribers(req.params.channelId);
            respond(res, JSON.stringify(s));
        }
        catch (e) {
            respondError(res, e);
        }
    });
    app.get('/channel/publish/:channelId/:message', function(req, res, next) {
        try {
            channels.publish(req.params.channelId, req.params.message);
            respond(res, "");
        }
        catch (e) {
            respondError(res, e);
        }
    });
}));

exports.server = server;

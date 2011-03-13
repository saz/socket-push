require.paths.push(__dirname);
require.paths.push(__dirname + '/lib');

var util = require('util'),
        auth = require('auth'),
        users = require('users'),
        config = require('config');

var adminServer = require('admin').server;
adminServer.listen(config.adminPort);
util.log("AdminServer listening on " + config.adminPort);

auth.setAuth(1, "507909951498732");

var clientServer = require('client').server;
clientServer.listen(config.clientPort);
util.log("ClientServer listening on " + config.clientPort);

var http = require('http')
        , io = require('socket.io')
        , sys = require(process.binding('natives').util ? 'util' : 'sys');

// socket.io, I choose you
// simplest chat application evar
var io = io.listen(clientServer);

io.on('connection', function(client) {
    client.broadcast({ announcement: client.sessionId + ' connected' });

    function authenticate(message) {
        try {
            authData = JSON.parse(message);
            sys.log(JSON.stringify(authData));
        }
        catch (err) {
            sys.log("No well-formed data from client " + client.sessionId + " received. Data: " + message);
            client.send({ error: "Auth failed" });
            return;
        }

        try {
            if (authData.userId === undefined || authData.hash === undefined) {
                throw "AuthData malformed";
            }
            var userId = auth.authenticate(authData.hash);
            if (userId != authData.userId) {
                throw "Invalid hash";
            }

            client.userId = userId;
            users.addConnection(userId, client.sessionId, client);
            sys.log("User " + userId + " connected");
            client.send({ auth: "Authorized as " + userId });
        }
        catch (e) {
            sys.log("Auth failed: " + e);
            client.send({ error: "You're not authorized" });
        }
    }

    client.on('message', function(message) {
        sys.log("Message from " + client.sessionId + ": " + message);
        // Initial connect will set userid
        if (client.userId === undefined) {
            authenticate(message);
        }
        else {
            var msg = { message: [client.sessionId, message] };

            client.broadcast(msg);
        }
    });

    client.on('disconnect', function() {
        client.broadcast({ announcement: client.sessionId + ' disconnected' });
        if (client.userId === undefined) {
            return;
        }

        sys.log("UserID " + client.userId + "(SessionID: " + client.sessionId + " disconnected");
        users.removeConnection(client.userId, client.sessionId);
    });
});

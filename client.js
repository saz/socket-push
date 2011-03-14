var sys = require(process.binding('natives').util ? 'util' : 'sys'),
    connect = require('connect'),
    auth,
    users;

var server = connect(
    connect.logger(),
    connect.static(__dirname + '/public')
    );

// socket.io, I choose you
// simplest chat application evar
var io = require('socket.io').listen(server);

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

exports.setAuthService = function(authService) {
    auth = authService;
}

exports.setUserService = function(userService) {
    users = userService;
}

exports.start = function(port) {
    server.listen(port);
}

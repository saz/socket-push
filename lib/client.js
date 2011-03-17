var sys = require(process.binding('natives').util ? 'util' : 'sys'),
    connect = require('connect'),
    auth,
    authTimeout = 0,
    users;

var server = connect(
    connect.logger(),
    connect.static(__dirname + '/../public')
    );

// socket.io, I choose you
// simplest chat application evar
var io = require('socket.io').listen(server);

io.on('connection', function(client) {
    var util = require('util');
    var authTimer;

    if (authTimeout > 0 ) {
        authTimer = setTimeout(function () {
            authFail("Authentication timed out");
        }, authTimeout);
    }

    function authFail(message) {
        sys.log("Auth failed: " + message);
        client.send({ error: "You're not authorized" });
        client.connection.destroy();
    }

    function authSuccess(userId) {
        client.userId = userId;
        clearTimeout(authTimer);

        users.addConnection(userId, client.sessionId, client);
        sys.log("User " + userId + " connected");
        client.send({ auth: "Authorized as " + userId });
    }

    function authenticate(message) {
        try {
            authData = JSON.parse(message);
        }
        catch (err) {
            sys.log("No well-formed data from client " + client.sessionId + " received. Data: " + message);
            client.send({ error: "Auth failed" });
            return;
        }

        if (authData.userId === undefined || authData.hash === undefined) {
            return authFail("AuthData malformed");
        }
        var userId = auth.check(authData.hash, function (userId) {
            if (userId != authData.userId) {
                return authFail("Invalid hash");
            }

            authSuccess(userId);
        },
        function(error) {
            authFail(error);
        });
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
        if (client.userId === undefined) {
            return;
        }

        users.removeConnection(client.userId, client.sessionId);
    });
});

/**
 * Set time period the user has to authenticate before being disconnected
 */
exports.setAuthTimeout= function(t) {
    authTimeout = t;
}

exports.setAuthService = function(authService) {
    auth = authService;
}

exports.setUserService = function(userService) {
    users = userService;
}

exports.start = function(port, hostname) {
    server.listen(port, hostname);
}

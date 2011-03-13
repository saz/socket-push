var http = require('http')
        , url = require('url')
        , fs = require('fs')
        , io = require('./lib/socket.io')
        , sys = require(process.binding('natives').util ? 'util' : 'sys')
        , server;

server = http.createServer(function(req, res) {
    // your normal server code
    var path = url.parse(req.url).pathname;
    switch (path) {
        case '/':
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('<h1>Welcome. Try the <a href="/public/chat.html">chat</a> example.</h1>');
            res.end();
            break;

        case '/json.js':
        case '/chat.html':
        case '/chat2.html':
            fs.readFile(__dirname + path, function(err, data) {
                if (err) {
                    return send404(res);
                }
                res.writeHead(200, {'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html'})
                res.write(data, 'utf8');
                res.end();
            });
            break;

        default: send404(res);
    }
}),

        send404 = function(res) {
            res.writeHead(404);
            res.write('404');
            res.end();
        };

server.listen(8080);

var users = [];

// socket.io, I choose you
// simplest chat application evar
var io = io.listen(server)
        , buffer = [];

io.on('connection', function(client) {
    client.send({ buffer: buffer });
    client.broadcast({ announcement: client.sessionId + ' connected' });

    client.on('message', function(message) {
        // Initial connect will set userid
        if (client.userId === undefined) {
            try {
                auth = JSON.parse(message);
            }
            catch (err) {
                sys.log("No well-formed data from client " + client.sessionId + " received. Data: " + message);
            }
            var found = false;
            if (users[auth.userId] !== undefined) {
                if (users[auth.userId].hash == auth.hash && users[auth.userId].userId == auth.userId) {
                    client.userId = auth.userId;
                    if (users[client.userId].sessions === undefined) {
                        sys.log("bla");
                        console.log(users[client.userId]);
                        users[client.userId].sessions = [];
                    }
                    users[client.userId].sessions[client.sessionId] = client.sessionId;
                    console.log(users);
                    sys.log("UserID " + client.userId + " is using session " + client.sessionId + "\n");
                    found = true;
                }
            }
            if (found != true) {
                client.send({ error: "You're not authorized" });
            }
        }
        else {
            var msg = { message: [client.sessionId, message] };
            buffer.push(msg);
            if (buffer.length > 15) {
                buffer.shift();
            }
            client.broadcast(msg);
        }
    });

    client.on('disconnect', function() {
        client.broadcast({ announcement: client.sessionId + ' disconnected' });
        sys.log("UserID " + client.userId + "(SessionID: " + client.sessionId + " disconnected");
        if (users[client.userId].sessions[client.sessionId] !== undefined) {
            delete users[client.userId].sessions[client.sessionId];
        }

        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    size++;
                }
            }
            return size;
        };

        if (Object.size(users[client.userId].sessions) == 0) {
            delete users[client.userId];
        }
    });
});

// TCP server part
var net = require('net');

var adminServer = net.createServer(function (adminSocket) {

    adminSocket.addListener('connect', function() {
        sys.log(adminSocket.remoteAddress + " opened new admin connection");
    });

    adminSocket.addListener('close', function() {
        sys.log(adminSocket.remoteAddress + " closed admin connection");
    });

    adminSocket.addListener('data', function (data) {
        try {
            var input = JSON.parse(data.toString());
        }
        catch (err) {
            adminSocket.write('{"error":"No well-formed json"}\n');
        }

        if (input !== undefined) {
            switch (input.command) {
                case "useradd":
                    userId = parseInt(input.userId);
                    users[userId] = { userId: userId, hash: Math.random().toString().substr(2) };
                    adminSocket.write(JSON.stringify(users[userId]) + "\r\n");
                    break;
                case "send":
                    userId = parseInt(input.userId);
                    message = input.message;
                    var msg = { message: ['TCP', message] };
                    for (s in users[userId].sessions) {
                        io.clients[s].send(msg);
                    }
                    break;
                case "sendmulti":
                    message = input.message;
                    var msg = { message: ['TCP', message] };
                    for (u in input.users) {
                        userId = parseInt(input.users[u].userId);
                        for (s in users[userId].sessions) {
                            io.clients[s].send(msg);
                        }
                    }
                    break;
                case "listuser":
                    adminSocket.write(JSON.stringify(users) + "\n");
                    break;
                case "quit":
                    adminSocket.end();
                    break;
                default:
                    adminSocket.write('{"error":"Not Implemented"}\n');
                    break;
            }
        }
    });

});

adminServer.listen(8181, "127.0.0.1", function() {
    address = adminServer.address();
    sys.log("adminServer listening on " + address.address + ":" + address.port);
});

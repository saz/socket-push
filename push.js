var http = require('http')
  , url = require('url')
  , fs = require('fs')
  , io = require('./lib/socket.io')
  , sys = require(process.binding('natives').util ? 'util' : 'sys')
  , server;
    
server = http.createServer(function(req, res){
  // your normal server code
  var path = url.parse(req.url).pathname;
  switch (path){
    case '/':
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write('<h1>Welcome. Try the <a href="/chat.html">chat</a> example.</h1>');
      res.end();
      break;
      
    case '/json.js':
    case '/chat.html':
      fs.readFile(__dirname + '/lib/socket.io/example' + path, function(err, data){
        if (err) return send404(res);
        res.writeHead(200, {'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html'})
        res.write(data, 'utf8');
        res.end();
      });
      break;
      
    default: send404(res);
  }
}),

send404 = function(res){
  res.writeHead(404);
  res.write('404');
  res.end();
};

server.listen(8080);

// socket.io, I choose you
// simplest chat application evar
var io = io.listen(server)
  , buffer = [];
  
io.on('connection', function(client){
  client.send({ buffer: buffer });
  client.broadcast({ announcement: client.sessionId + ' connected' });
  
  client.on('message', function(message){
    var msg = { message: [client.sessionId, message] };
    buffer.push(msg);
    if (buffer.length > 15) buffer.shift();
    client.broadcast(msg);
  });

  client.on('disconnect', function(){
    client.broadcast({ announcement: client.sessionId + ' disconnected' });
  });
});

// TCP server part
var net = require('net');

var adminServer = net.createServer(function (adminSocket) {

    adminSocket.addListener('connect', function() {
	    console.log("%s opened new admin connection", adminSocket.remoteAddress);
	    });

    adminSocket.addListener('close', function() {
	    console.log("%s closed admin connection", adminSocket.remoteAddress);
	    });

    adminSocket.addListener('data', function (data) {
	    var cmd = data.toString().split(" ");
	    var command = [cmd.shift(), cmd.shift(), cmd.join(' ')];
	    console.log(command);

	    switch(command[0].trim().toUpperCase()) {
	    	case "SEND":
			sessionId = parseInt(command[1].trim());
			message = command[2].trim();
			var msg = { message: ['TCP', message] };
			io.clients[sessionId].send(msg);
			break;
		case "LIST":
			console.log(io.clients);
			break;
		case "QUIT":
			adminSocket.end();
			break;
	    }
    });

});

adminServer.listen(8181, "127.0.0.1", function() {
    address = server.address();
    console.log("adminServer listening on %s:%s", address.address, address.port);
});

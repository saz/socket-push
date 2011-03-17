socket-push
===========
is a highly scalable and fault tolerant COMET solution with a shared nothing architecture built on top of socket.io, connect and noderpc.
There is no single point of failure. socket.io is used for client connections.
It offers services for 

* user authentication
* channel pub/sub
* multiple socket connections per user

Each service is fully shardeable via noderpc. This means, there can be several independant nodes for handling user connections, channel management and auth service and even completely independant and fault tolerant management nodes that maybe fully loadbalanced.

Demo
----

For a demo, simply download and start with "node server.js". Start your browser with

* http://127.0.0.1:8080 to start a client socket
* http://127.0.0.1:8181 to see the self exposing management interface

Then

1. Register a user in the management interface with auth set, e.g. userId 1 and sessionId test
2. Use the same userId + sessionId in the client interface to start a session
3. Do a user/publish on userId 1 with a message of your choice


Management API
--------------

The management API can be addressed via

* HTTP directly
* node.js objects
* PHP

In fact, the server uses its own client API internally for sharding and distributing requests.
In rpc/bindings/php is an API generator for PHP which generates PHP classes to access the management API.

Client bindings
---------------

In node.js it looks like this:

    var authServiceDefinition = require('service/auth.js');
    var authService = new (require('rpc/proxy/http'))(authServiceDefinition, '127.0.0.1', 8181);
    authService.set(1, 'test', function(resultOnSuccess) {}, function(exception) {});

In PHP it looks like this:

    $authService = new NodeRPC_Auth_Service('127.0.0.1', 8181);
    $authService->set(1, 'test');

The API, literally speaking naming of services, methods and parameters is consistent across the client APIs in node.js, PHP and via HTTP.

TODO
----

* Config Examples
* ConfigManager
** Master
 Accepts config changes via API and informs slaves
 Checks health states of nodes and drops in standby nodes if available
** Slave
 Can reload config on the fly without restarting via API
 Local services are preserved if reused
* API call to retrieve frontend server for a user
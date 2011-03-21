
function HttpBinding() {
    var connect = require('connect'),
        rpcMarshal = require('rpc/marshal');

    var server = connect(
        connect.logger(),
        connect.static(__dirname + '/../../../public')
    );

    var api = {};

    this.bindService = function(bindObject) {
        definition = bindObject.serviceDefinition;
        api[definition.name] = definition.methods;
        server.use(connect.router(function(app) {
            // Define a route and handler for each method in service
            for (methodName in definition.methods) {
                // Closure for namespace-decoupling
                (function(name, paramDef) {
                    // Build route
                    var route = '/' + definition.name + '/' + name;
                    paramDef.forEach(function (param) {
                        route += '/:' + param.name;
                    });

                    // Bind method to route
                    app.get(route, function(req, res, next) {
                        try {
                            // Marshall request arguements
                            var args = rpcMarshal.fromHttpParams(req.params, paramDef);

                            // Append success callback
                            args.push(function(result) {
                                res.writeHead(200, {'Content-Type': 'text/html'});
                                if (result !== undefined) {
                                    res.write(JSON.stringify(result));
                                }
                                res.end();
                            });
                            // Append error callback
                            args.push(function(error) {
                                if (typeof error != 'string') {
                                    throw error;
                                }
                                res.writeHead(500, {'Content-Type': 'text/html'});
                                res.write(error);
                                res.end();
                            });

                            // Call native object method
                            // bindObject = thisContext
                            // bindObject[name] = native method
                            bindObject[name].apply(bindObject, args);
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
                })(methodName, definition.methods[methodName].params);
            };
        }));
    }

    this.start = function(port, hostname) {
        server.use(connect.router(function(app) {
           app.get('/api', function(req, res, next) {
               res.writeHead(200, {'Content-Type': 'text/html'});
               res.write(JSON.stringify(api));
               res.end();
           });
        }));
        server.listen(port, hostname);
    }

    this.stop = function() {
        server.close();
    }
}

module.exports = function() {
    return new HttpBinding();
}
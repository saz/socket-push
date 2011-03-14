var connect = require('connect'),
    rpcMarshal = require('rpc/marshal');

var server = connect(
        connect.logger()
        );

var api = {};

exports.bindService = function(definition, bindObject) {
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

                        // Call native object method
                        // bindObject = thisContext
                        // bindObject[name] = native method
                        var result = bindObject[name].apply(bindObject, args);
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
            })(methodName, definition.methods[methodName].params);
        };
    }));    
}

exports.start = function(port) {
    server.use(connect.router(function(app) {
       app.get('/api', function(req, res, next) {
           res.writeHead(200, {'Content-Type': 'text/html'});
           res.write(JSON.stringify(api));
           res.end();
       });
    }));
    server.listen(port);
}
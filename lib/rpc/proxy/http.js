var Proxy = require('rpc/proxy');
var rpcMarshal = require('rpc/marshal');
var util = require('util');


function HttpProxy(service, host, port) {
    Proxy.call(this, service);
    this.host = host;
    if (port == undefined) {
        port = 80;
    }
    this.port = port;
    this.httpClient = require('http');
}

HttpProxy.prototype.setHttpClient = function(httpClient) {
    this.httpClient = httpClient;
}

HttpProxy.prototype.buildRoute = function(method, args) {
    var route = "/" + this.serviceDefinition.name + "/" + method;
    var httpParams = rpcMarshal.toHttpParams(args, this.serviceDefinition.methods[method].params);
    for (i in httpParams) {
        route += '/' + httpParams[i];
    }
    return route;
}

HttpProxy.prototype.proxyCall = function(method, args, callback) {
    this.buildRoute(method, args);

    var options = {
      host: this.host,
      port: this.port,
      path: this.buildRoute(method, args)
    };

    // Execute http request
    this.httpClient.get(options, function(res) {
        var data = '';
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on('end', function() {
            callback(data == undefined ? undefined : JSON.parse(data));
        });
    }).on('error', function(e) {
        // @todo
        // throw e;
    });
}

module.exports = HttpProxy;

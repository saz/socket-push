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

util.inherits(HttpProxy, Proxy);

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

HttpProxy.prototype.proxyCall = function(method, args) {
    var argsCollection = this.spliceArgs(method, args);

    this.buildRoute(method, argsCollection.args);

    var options = {
        host: this.host,
        port: this.port,
        path: this.buildRoute(method, argsCollection.args)
    };

    // Execute http request
    var that = this;
    this.httpClient.get(options,
            function(res) {
                var data = '';
                res.on('data', function(chunk) {
                    data += chunk;
                });
                res.on('end', function() {
                    if (res.statusCode !== 200) {
                        argsCollection.errorCallback(data);
                    }
                    else {
                        argsCollection.returnCallback(data == undefined ? undefined : JSON.parse(data));
                    }
                });
            }).on('error', function(e) {
                that.emit('error', e, this);
            });
}

module.exports = HttpProxy;

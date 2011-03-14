var util = require('util');

var Proxy = function(service) {
    this.serviceDefinition = service;
    var self = this;
    Object.keys(service.methods).forEach(function (method) {
        self[method] = function() {
            var args = Array.prototype.slice.call(arguments);
            var callback;
            if (typeof args[args.length - 1] == 'function') {
                callback = args.pop();
                this.proxyCall(method, args, callback)
            }
            else {
                this.proxyCall(method, args);
            }
        }
    });
}

Proxy.prototype.proxyCall = function(method, args, callback) {
    throw "Not implemented";
}

module.exports = Proxy;

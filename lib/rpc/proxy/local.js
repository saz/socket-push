var Proxy = require('rpc/proxy');
var rpcMarshal = require('rpc/marshal');
var util = require('util');

function LocalProxy(service, bindObject) {
    Proxy.call(this, service);
    this.bindObject = bindObject;
}

LocalProxy.prototype.proxyCall = function(method, args, callback) {
    if (typeof callback == 'function') {
        callback(this.bindObject[method].apply(this.bindObject, args));
    }
    else {
        this.bindObject[method].apply(this.bindObject, args);
    }
}

module.exports = LocalProxy;

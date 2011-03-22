var Proxy = require('rpc/proxy').Abstract;
var rpcMarshal = require('rpc/marshal');
var util = require('util');

function LocalProxy(service, bindObject) {
    Proxy.call(this, service);
    this.bindObject = bindObject;
}

util.inherits(LocalProxy, Proxy);

LocalProxy.prototype.proxyCall = function(method, args) {
    var argsCollection = this.spliceArgs(method, args);
    
    try {
        argsCollection.returnCallback(this.bindObject[method].apply(this.bindObject, argsCollection.args));
    }
    catch (e) {
        argsCollection.errorCallback(e);
    }
}

module.exports = function(service, bindObject) {
    return new LocalProxy(service, bindObject);
}

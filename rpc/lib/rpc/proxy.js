var util = require('util');
var events = require("events");

var Proxy = function(service) {
    events.EventEmitter.call(this);
    this.serviceDefinition = service;
    var self = this;
    Object.keys(service.methods).forEach(function (method) {
        self[method] = function() {
            self.proxyCall(method, arguments);
        }
    });
}

util.inherits(Proxy, events.EventEmitter);

/**
 * Split arguments object to original argument list and callback for
 * return and error
 */
Proxy.prototype.spliceArgs = function(method, args) {
	var errorCallback, returnCallback;
	var args = Array.prototype.slice.call(args);
	var numArgs = this.serviceDefinition.methods[method].params.length;

	if (numArgs === (args.length - 2)) {
		errorCallback = args.pop();
		if (typeof errorCallback !== 'function') {
			throw "Expects function as errorCallback";
		}
	}
	else {
		errorCallback = function() {};
	}

	if (numArgs === (args.length - 1)) {
    	returnCallback = args.pop();
		if (typeof returnCallback !== 'function') {
			throw "Expects function as returnCallback";
		}
	}
	else {
		returnCallback = function() {};
	}

	return {
		args: args,
		returnCallback: returnCallback,
		errorCallback: errorCallback
	}
}

Proxy.prototype.proxyCall = function(method, args, callback) {
    throw "Not implemented";
}

module.exports = Proxy;

var util = require('util');

function manager() {
    var _config = require('config/worker');

    this.setConfig = function(config) {
        _config = config;
    };

    this.getConfig = function(nodeId) {
        return _config;
    };
}

module.exports = function() {
    return new manager();
}
var _config = require('config/worker');

exports.setConfig = function(config) {
    _config = config;
}

exports.getConfig = function() {
    return _config;
}

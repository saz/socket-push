
function manager() {
    var _config;

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
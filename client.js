var connect = require('connect');

var server = connect(
    connect.logger(),
    connect.static(__dirname + '/public')
    );

exports.server = server;

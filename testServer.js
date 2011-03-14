require.paths.push(__dirname);
require.paths.push(__dirname + '/lib');

var fixture = require('fixture/rpc');

var server = require('rpc/httpbinding');
server.bindService(fixture.serviceDesc, fixture.proxiedObject);
server.start(8383);


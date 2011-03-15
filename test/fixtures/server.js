require.paths.push(__dirname + '/../..');
require.paths.push(__dirname + '/../../lib');

var fixture = require('test/fixtures/rpc');

var server = require('rpc/httpbinding');
server.bindService(fixture.serviceDesc, fixture.proxiedObject);
server.start(8383);


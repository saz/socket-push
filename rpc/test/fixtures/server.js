require.paths.push(__dirname + '/../..');
require.paths.push(__dirname + '/../../lib');

var fixture = require('test/fixtures/rpc');

var server = require('rpc/binding/http')();
var proxy = new (require('rpc/proxy/local'))(fixture.serviceDesc, fixture.proxiedObject);
server.bindService(proxy);
server.start(8989);


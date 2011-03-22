var base = __dirname;
require.paths.push(base);
require.paths.push(base + '/lib');
require.paths.push(base + '/rpc/lib');

var config = require('config/manager'),
    sys = require(process.binding('natives').util ? 'util' : 'sys'),
    options = require('options'),
    services = {},
    servicefactory = require('rpc/servicefactory'),
    managerPort = require('rpc/binding/http')()
    ;

// set process title - doesn't work in all OS
process.title = 'socket-push-manager';

/**
 * Create admin port
 */

var proxy = servicefactory.createProxy('manager', {
    location: 'local',
    implementation: 'manager/distributed'
});
proxy.setConfig(require('config/distributed'));
managerPort.bindService(proxy);
managerPort.start(config.managerPort.port, config.managerPort.hostname);
sys.log("managerPort listening on " + config.managerPort.hostname + ":" + config.managerPort.port);

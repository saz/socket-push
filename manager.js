#!/usr/bin/node

var base = __dirname;
require.paths.push(base);
require.paths.push(base + '/lib');
require.paths.push(base + '/rpc/lib');

var config = require('config/manager'),
    sys = require(process.binding('natives').util ? 'util' : 'sys'),
    managerPort = require('rpc/binding/http')(),
    daemonize = require('daemonizer');
    ;

/**
 * Handle daemon start/stop
 */
var pidFile = base + '/run/socke-push-manager.pid';
try {
    switch (process.argv[2]) {
        case "start":
            sys.log("Start service for manager");
            daemonize.start(pidFile);
            break;
        case "stop":
            sys.log("Stop service for manager ");
            daemonize.stop(pidFile);
    }
}
catch (e) {
    sys.log("Error daemonizing: " + e);
    process.exit();
}

/**
 * set process title - doesn't work in all OS
 */
process.title = 'socket-push-manager';

/**
 * Create admin port
 */

var proxy = require('rpc/servicefactory').createProxy('manager', {
    location: 'local',
    implementation: 'manager/distributed'
});
proxy.setConfig(require('config/distributed'));
managerPort.bindService(proxy);
managerPort.start(config.managerPort.port, config.managerPort.hostname);
sys.log("managerPort listening on " + config.managerPort.hostname + ":" + config.managerPort.port);

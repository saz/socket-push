#!/usr/bin/node

var base = __dirname;
require.paths.push(base);
require.paths.push(base + '/lib');

var config = require('config/manager'),
    noderpc = require('noderpc'),
    connect,
    server,
    managerPort,
    daemonize = require('daemonizer'),
    logger = require('logger').getLogger('manager');

/**
 * Handle daemon start/stop
 */
var pidFile = base + '/run/socke-push-manager.pid';
try {
    switch (process.argv[2]) {
        case "start":
            logger.info("Start service for manager");
            daemonize.start(pidFile);
            break;
        case "stop":
            logger.info("Stop service for manager ");
            daemonize.stop(pidFile);
    }
}
catch (e) {
    logger.error("Error daemonizing: " + e);
    process.exit();
}

/**
 * set process title - doesn't work in all OS
 */
process.title = 'socket-push-manager';

/**
 * Create admin port
 */

var proxy = noderpc.createProxy('manager', {
    location: 'local',
    implementation: 'manager/distributed'
});

/**
 * Format options
:req[header] ex: :req[Accept]
:res[header] ex: :res[Content-Length]
:http-version
:response-time
:remote-addr
:date
:method
:url
:referrer
:user-agent
:status
 */
connect = require('connect'),
server = connect(
    connect.static(__dirname + '/rpc/public')
);
managerPort = noderpc.createServer(server);
managerPort.setLogger(require('logger').getLogger('manager_http'), 'info');
proxy.setConfig(require('config/distributed'));
managerPort.bindService(proxy);
managerPort.start(config.managerPort.port, config.managerPort.hostname);
logger.info("managerPort listening on " + config.managerPort.hostname + ":" + config.managerPort.port);

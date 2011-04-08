#!/usr/bin/node

var base = __dirname;
require.paths.push(base);
require.paths.push(base + '/lib');

var daemonize = require('daemonizer'),
    logger = require('logger').getLogger('worker');

try {
    /**
     * Main function
     * get cli options and init server
     */
    (function() {
        var options = require('options'),
            noderpc = require('noderpc'),
            configManager,
            worker,
            nodeId,
            initStatus = 0;

        /**
         * Get cli options
         */

        // Usage
        options.getOption('-h', undefined, function(err, value) {
            logger.fatal("Usage: " + process.argv[1] + " [start|stop] [--role=worker] [--manager=HOST] [--node=NODE]");
            process.exit();
        });

        // Worker role, manager by distributed config manager
        options.getOption('--role', undefined, function(err, value) {
            switch (value) {
                case undefined:
                case 'standalone':
                    break;
                case 'worker':
                    var manager;
                    initStatus = 1;
                    options.getOption('--node', undefined, function(err, value) {
                        nodeId = value;
                    });
                    options.getOption('--manager', undefined, function(err, value) {
                        manager = value;
                    });
                    if (manager == undefined) {
                        throw new Error("Role worker needs --manager option");
                    }
                    if (nodeId == undefined) {
                        throw new Error("Role worker needs --node option");
                    }
                    logger.debug("Load remote config from " + value);
                    var parts = manager.split(':');
                    configManager = noderpc.createProxy('manager', {
                        location: 'remote',
                        hostname: parts[0],
                        port: parts[1] || 80
                    });
                    break;
                default:
                    throw new Error("Unknown role " + value);
            }
        });

        /**
         * Start standalone node
         */
        if (initStatus == 0) {
            nodeId = 'standalone';
            logger.debug("Load local config");
            var configManager = noderpc.createProxy('manager', {
                location: 'local',
                implementation: 'manager/standalone'
            });
            configManager.setConfig(require('config/worker'));
        }

        /**
         * Handle daemon start/stop
         */
        var pidFile = base + '/run/socket-push-' + nodeId + '.pid';
        try {
            switch (process.argv[2]) {
                case "start":
                    logger.info("Start service for node " + nodeId);
                    daemonize.start(pidFile);
                    break;
                case "stop":
                    logger.info("Stop service for node " + nodeId);
                    daemonize.stop(pidFile);
                    break;
                default:
                    logger.fatal('unknown command: ' + process.argv[2]);
                    process.exit();
                    break;
            }
        }
        catch (e) {
            logger.error("Error daemonizing: " + e);
            process.exit();
        }

        /**
         * set process title - doesn't work in all OS
         */
        process.title = 'socket-push-' + nodeId;

        worker = require('service/worker')(nodeId, require('noderpc/proxyfactory'), configManager);
        worker.loadConfig();
    })();

}
catch (e) {
    logger.fatal("Error: " + e.message);
}

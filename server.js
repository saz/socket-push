#!/usr/bin/node

var base = __dirname;
require.paths.push(base);
require.paths.push(base + '/lib');
require.paths.push(base + '/rpc/lib');

var sys = require(process.binding('natives').util ? 'util' : 'sys'),
    daemonize = require('daemonizer');

try {
    /**
     * Main function
     * get cli options and init server
     */
    (function() {
        var options = require('options'),
            servicefactory = require('rpc/servicefactory'),
            configManager,
            worker,
            nodeId = 0,
            initStatus = 0;

        /**
         * Get cli options
         */

        // Usage
        options.getOption('-h', undefined, function(err, value) {
            sys.log("Usage: " + process.argv[1] + " [start|stop] [--role=worker] [--manager=HOST] [--node=NODE]");
            process.exit();
        });

        // Worker role, manager by distributed config manager
        options.getOption('--role', undefined, function(err, value) {
            switch (value) {
                case undefined:
                case 'standalone':
                    break;
                case 'worker':
                    initStatus = 1;
                    options.getOption('--node', undefined, function(err, value) {
                        nodeId = value;
                    });
                    options.getOption('--manager', undefined, function(err, value) {
                        manager = value;
                    });
                    if (manager == undefined) {
                        throw "Role worker needs --manager option";
                    }
                    if (nodeId == undefined) {
                        throw "Role worker needs --node option";
                    }
                    sys.log("Load remote config from " + value);
                    var parts = manager.split(':');
                    configManager = servicefactory.createProxy('manager', {
                        location: 'remote',
                        host: parts[0],
                        port: parts[1] || 80
                    });
                    break;
                default:
                    throw "Unknown role " + value;
            }
        });

        /**
         * Start standalone node
         */
        if (initStatus == 0) {
            nodeId = 'standalone';
            sys.log("Load local config");
            var configManager = servicefactory.createProxy('manager', {
                location: 'local',
                implementation: 'manager/standalone'
            });
            configManager.setConfig(require('config/worker'));
        }

        /**
         * Handle daemon start/stop
         */
        var pidFile = base + '/run/socke-push-' + nodeId + '.pid';
        try {
            switch (process.argv[2]) {
                case "start":
                    sys.log("Start service for node " + nodeId);
                    daemonize.start(pidFile);
                    break;
                case "stop":
                    sys.log("Stop service for node " + nodeId);
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
        process.title = 'socket-push-' + nodeId;

        worker = require('service/worker')(nodeId, servicefactory, configManager);
        worker.loadConfig();
    })();

}
catch (e) {
    sys.log("Error: " + e);
}

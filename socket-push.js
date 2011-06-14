#!/usr/bin/node

// TODO: is this really required?
// noderpc depends on it...
require.paths.push(__dirname);
require.paths.push(__dirname + '/lib');

// TODO: Fix logger!
var optParser = require("nomnom");
var log4js = require('log4js')();
var logger =log4js.getLogger();

optParser.command('manager')
    .opts({
        config: {
            string: '-c, --config',
            default: 'config.json',
            help: 'Config file to use',
        },
    })
    .callback(runManager)
    .help("run a manager");

optParser.command('worker')
    .opts({
        manager: {
            string: '-m MANAGER, --manager=MANAGER',
            help: 'ip address or hostname and port of the manager',
            required: true,
        },
        nodeid: {
            string: '-n NODEID, --nodeid=NODEID',
            help: 'Name of this node in manager config',
            required: true,
        },
        logfile: {
            string: '-l FILE, --logfile=FILE',
            help: 'Logfile to use',
        },
        pidfile: {
            string: '-p FILE, --pidfile=FILE',
            help: 'Pidfile to use',
            required: true
        },
    })
    .callback(runWorker)
    .help("run a worker instance");

optParser.parseArgs();


function runWorker(options) {
    process.title = 'socket-push worker ' + options.nodeid;

    var noderpc = require('noderpc'),
        configManager;

    manager = options.manager.split(':');
    configManager = noderpc.createProxy('manager', {
        location: 'remote',
        hostname: manager[0],
        port: manager[1] || 80,
    });
    worker = require('service/worker')(options.nodeid, require('noderpc/proxyfactory'), configManager);
    worker.loadConfig();
}

function runManager(options) {
    process.title = 'socket-push manager';

    var config = require('config/socket-push.conf'),
        noderpc = require('noderpc'),
        connect = require('connect'),
        managerPort,
        logger = require('log4js')().getLogger();

    var proxy = noderpc.createProxy('manager', {
        location: 'local',
        implementation: 'manager/distributed'
    });

    managerPort = noderpc.createServer(connect());
    managerPort.serveStatic();
    managerPort.setLogger(logger, 'info');
    proxy.setConfig(config, function() {}, function (err) {
        throw err;
    });
    managerPort.bindService(proxy);
    managerPort.start(config.manager.port, config.manager.listen);
    logger.info("managerPort listening on " + config.manager.listen + ":" + config.manager.port);
}

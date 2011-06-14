#!/usr/bin/node

require.paths.push(__dirname);
require.paths.push(__dirname + '/lib');

// TODO: Fix logger!
var optParser = require("nomnom");
var log4js = require('log4js')();
var logger =log4js.getLogger();

optParser.command('manager')
    .opts({
        config: {
            string: '-c FILE, --config=FILE',
            help: 'Config file to use',
            required: true,
        },
        daemon: {
            position: 1,
            default: false,
            help: 'Start/Stop daemon mode',
        },
    })
    .callback(runDaemon)
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
            required: true,
        },
        pidfile: {
            string: '-p FILE, --pidfile=FILE',
            help: 'Pidfile to use',
            required: true,
        },
        daemon: {
            position: 1,
            default: false,
            help: 'Start/Stop daemon mode',
        },
    })
    .callback(runDaemon)
    .help("run a worker instance");

optParser.parseArgs();


function runDaemon(options) {
    var daemon = require('daemon'),
        fs = require('fs'),
        sys = require('sys');

    if(typeof(options.config) !== 'undefined') {
        config = require(options.config);
        pidfile = config.manager.pidfile;
        logfile = config.manager.logfile;
    } else {
        config = false;
        pidfile = options.pidfile;
        logfile = options.logfile;
    }

    switch(options.daemon) {
        case "stop":
            PID = parseInt(fs.readFileSync(pidfile));
            sys.puts('Stopping daemon with pid: ' + PID);
            try {
                process.kill(PID);
                process.exit();
            } catch (e) {
                sys.puts('No running process with pid ' + PID + ' found. None killed.');
            }
            break;
        case "start":
            daemon.daemonize(logfile, pidfile, function (err, pid) {
                if (err) return sys.puts('Error starting daemon: ' + err);
                sys.puts('Daemon started successfully with pid: ' + pid);
                eval(options[0])(options, config);
            });
            break;
        default:
            eval(options[0])(options, config);
            break;
    }
}


function worker(options) {
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


function manager(options, config) {
    var noderpc = require('noderpc'),
        connect = require('connect'),
        logger = require('log4js')().getLogger();
    process.title = 'socket-push manager';


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

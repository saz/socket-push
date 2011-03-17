#!/usr/bin/node

require.paths.push(__dirname);
var daemon = require('daemon');
var sys = require('sys');
var fs = require('fs');

var config = require('config/config');

var args = process.argv;
var dPID;

if (config.pidFile == undefined) {
    sys.puts("pidFile not set in config");
}

switch (args[2]) {
    case "stop":
        process.kill(parseInt(fs.readFileSync(config.pidFile)));
        process.exit(0);
        break;

    case "start":
        dPID = daemon.start();
        daemon.lock(config.pidFile);
        /**
         * @todo find out why server doesnt like io to be closed
         daemon.closeIO();
         */
        break;

    default:
        sys.puts('Usage: [start|stop]');
        process.exit(0);
}

require('server');
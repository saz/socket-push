var daemon = require('daemon');
var sys = require('sys');
var fs = require('fs');

exports.start = function (pidFile) {
    if (pidFile == undefined) {
        sys.puts("pidFile not set");
    }

    var pid = daemon.start();
    daemon.lock(pidFile);
    /**
     * @todo find out why server doesnt like io to be closed
     daemon.closeIO();
     */
    return pid;
}

exports.stop = function (pidFile) {
    process.kill(parseInt(fs.readFileSync(pidFile)));
    process.exit(0);
}
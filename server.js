require.paths.push(__dirname);
require.paths.push(__dirname + '/lib');

var util = require('util'),
    auth = require('auth'),
    user = require('user'),
    channel = require('channel'),
    config = require('config'),
    sys = require(process.binding('natives').util ? 'util' : 'sys');


// Add event listener to unsubscribe disconnected user from all groups
user.onDisconnect(channel.unsubscribeAll);
// Add event listener for group publish
channel.onPublish(user.publish);

// Create admin port
var adminPort = require('rpc/httpbinding');
adminPort.bindService(require('service/auth'), auth);
adminPort.bindService(require('service/user'), user);
adminPort.bindService(require('service/channel'), channel);
adminPort.start(config.adminPort);
sys.log("adminPort listening on " + config.adminPort);

auth.set(1, "507909951498732");

// Create client port
var clientServer = require('client');
clientServer.setAuthService(auth);
clientServer.setUserService(user);
clientServer.start(config.clientPort);
sys.log("ClientServer listening on " + config.clientPort);

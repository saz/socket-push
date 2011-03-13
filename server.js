require.paths.push(__dirname);
require.paths.push(__dirname + '/lib');

var util = require('util'),
    auth = require('auth'),
    users = require('users'),
    channels = require('channels'),
    config = require('config'),
    sys = require(process.binding('natives').util ? 'util' : 'sys');


// Add event listener to unsubscribe disconnected user from all groups
users.onDisconnect(channels.unsubscribeAll);
// Add event listener for group publish
channels.onPublish(users.publish);

// Create admin port
var adminServer = require('admin');
adminServer.bindAuthService(auth);
adminServer.bindUserService(users);
adminServer.bindChannelService(channels, users);
adminServer.start(config.adminPort);
sys.log("AdminServer listening on " + config.adminPort);

auth.setAuth(1, "507909951498732");

// Create client port
var clientServer = require('client');
clientServer.setAuthService(auth);
clientServer.setUserService(users);
clientServer.start(config.clientPort);
sys.log("ClientServer listening on " + config.clientPort);

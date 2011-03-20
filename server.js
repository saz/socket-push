var base = __dirname;
require.paths.push(base);
require.paths.push(base + '/lib');
require.paths.push(base + '/rpc/lib');

var sys = require(process.binding('natives').util ? 'util' : 'sys');

try {
    /**
     * Main function
     * get cli options and init server
     */
    (function() {
        var options = require('options'),
            initStatus = 0;

        /**
         * Get cli options
         */
        options.getOption('--role', undefined, function(err, value) {
            switch (value) {
                case undefined:
                case 'standalone':
                    break;
                case 'worker':
                    initStatus = 1;
                    options.getOption('--manager', undefined, function(err, value) {
                        if (value == undefined) {
                            throw "Role worker needs --manager option";
                        }
                        initStatus = 2;
                        sys.log("Load remote config from " + value);
                        var parts = value.split(':');
                        loadConfig({
                            location: 'remote',
                            host: parts[0],
                            port: parts[1] || 80
                        });
                    });
                    if (initStatus == 1) {
                        throw "Role worker needs --manager option";
                    }
                    break;
                default:
                    throw "Unknown role " + value;
            }
        });

        if (initStatus == 0) {
            sys.log("Load local config");
            loadConfig({
                location: 'local'
            });
        }
    })();


    function loadConfig(managerConfig) {
        var servicefactory = require('rpc/servicefactory'),
            configManager = servicefactory.createProxy('manager', managerConfig);
        configManager.on('error', function(error, call) {
            sys.log("Error loading config: " + error);
        });
        configManager.getConfig(function(cfg) {
            applyConfig(cfg);
        });
    }

    function applyConfig(config) {
        var adminPort = require('rpc/binding/http'),
            servicefactory = require('rpc/servicefactory');

        /**
         * Create admin port
         */
        servicefactory.buildFromConfig(adminPort, config.services);

        // Check required service definitions
        if (servicefactory.getProxy('user') == undefined) {
            throw "Service 'user' not defined";
        }

        if (servicefactory.getProxy('user') == undefined) {
            throw "Service 'auth' not defined";
        }

        /**
         * Add event listener for group publish
         * Only necessary for local channels, channel-proxy objects don't publish
         */
        if (servicefactory.getLocalService('channel') != undefined) {
            servicefactory.getLocalService('channel').onPublish(servicefactory.getProxy('user').publish);
        }

        adminPort.start(config.adminPort.port, config.adminPort.hostname);
        sys.log("adminPort listening on " + config.adminPort.hostname + ":" + config.adminPort.port);

        /**
         * Create client port if configured
         */
        if (config.clientPort != undefined) {
            if (servicefactory.getLocalService('user') == undefined) {
                throw "Clientport needs local user-service";
            }

            // Add event listener to unsubscribe disconnected user from all groups
            servicefactory.getLocalService('user').onDisconnect(servicefactory.getProxy('channel').unsubscribeAll);
            servicefactory.getLocalService('user').setDisconnectTimeout(config.removeUserAfterDisconnectTimeOut);

            var clientServer = require('client');
            var localProxy = require('rpc/proxy/local');
            clientServer.setAuthService(servicefactory.getProxy('auth'));
            clientServer.setAuthTimeout(config.authenticationTimeOut);
            clientServer.setUserService(servicefactory.getLocalService('user'));
            clientServer.start(config.clientPort.port, config.clientPort.hostname);
            sys.log("ClientServer listening on " + config.clientPort.hostname + ":" + config.clientPort.port);
        }
    }
}
catch (e) {
//    throw e;
    sys.log("Error: " + e);
}

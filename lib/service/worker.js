var logger = require('logger').getLogger('worker'),
    util = require('util'),
    noderpc = require('noderpc');

function Worker(nodeId, serviceFactory, configService) {
    var adminPort,
        clientPort,
        _config,
        initialized = 0;
    
    this.loadConfig = function () {
        configService.on('error', function(error, call) {
            logger.fatal("Error loading config: " + error);
        });
        var that = this;
        configService.getConfig(nodeId, function(cfg) {
            try {
                that.setConfig(cfg);
            }
            catch (e) {
                var util = require('util');
                logger.fatal(util.inspect(e));
                logger.fatal("Error applying config: " + e);
            }
        }, function (err) {
            logger.fatal("Error loading config: " + err);
        });
    };

    function createAdminPort(worker) {
        var workerProxy,
            connect = require('connect'),
            server;

        server = connect();
        adminPort = noderpc.createServer(server);
        adminPort.setLogger(require('logger').getLogger('worker_http'), 'info');
        // Create a local proxy for ourself
        workerProxy = new (require('noderpc/proxy/local'))(require('service/worker_description'), worker);
        adminPort.bindService(workerProxy);

        adminPort.serveStatic();
    }

    function createClientPort() {
        if (clientPort === undefined) {
            var connect = require('connect'),
                server = connect(
                    connect.logger(),
                    connect.static(__dirname + '/../../public')
                );

            clientPort = require('client')(server);
        }
    }

    function initClientPort(config) {
        if (serviceFactory.getLocalService('user') == undefined) {
            throw new Error("Clientport needs local user-service");
        }

        // Add event listener to unsubscribe disconnected user from all groups
        serviceFactory.getLocalService('user').onDisconnect(serviceFactory.getProxy('channel').unsubscribeAll);
        serviceFactory.getLocalService('user').setDisconnectTimeout(config.options.removeUserAfterDisconnectTimeOut || 60000);

        createClientPort();
        clientPort.setAuthService(serviceFactory.getProxy('auth'));
        clientPort.setAuthTimeout(config.options.authenticationTimeOut || 900000);
        clientPort.setUserService(serviceFactory.getLocalService('user'));
        serviceFactory.getLocalService('user').setFrontendServer(
            "http://" + config.clientPort.hostname + ":" + config.clientPort.port
        );
    }

    function deinitAdminPort() {
        var user, channel;

        channel = serviceFactory.getLocalService('channel');
        if (channel !== undefined) {
            channel.removeAllListeners();
        }

        user = serviceFactory.getLocalService('user');
        if (user !== undefined) {
            user.removeAllListeners();
        }

        for (var serviceName in _config.services) {
            logger.info("Unloading service " + serviceName);
            serviceFactory.removeProxy(serviceName);
            adminPort.unbindService(serviceName);
        }

    }

    function validateConfig(config) {
        if (config.adminPort === undefined) {
            throw new Error("adminPort not defined");
        }
        if (config.adminPort.port === undefined) {
            throw new Error("adminPort.port not defined");
        }
        if (config.clientPort !== undefined && config.clientPort.port === undefined) {
            throw new Error("clientPort.port not defined");
        }
        if (typeof config.options !== 'object') {
            config.options = {};
        }
        if (config.services === undefined) {
            throw new Error("services not defined");
        }
        if (config.services.user === undefined) {
            throw new Error("service 'user' not defined");
        }
        if (config.services.auth === undefined) {
            throw new Error("service 'auth' not defined");
        }
    }

    function configureAdminPort(config) {
        // Bind services
        for (var serviceName in config.services) {
            logger.info("Loading service " + serviceName);
            var proxy = serviceFactory.createProxy(serviceName, config.services[serviceName]);
            adminPort.bindService(proxy);
        }

        // Check required service definitions
        if (serviceFactory.getProxy('user') == undefined) {
            throw new Error("service 'user' not defined");
        }

        if (serviceFactory.getProxy('auth') == undefined) {
            throw new Error("service 'auth' not defined");
        }

        /**
         * Add event listener for group publish
         * Only necessary for local channels, channel-proxy objects don't publish
         */
        if (serviceFactory.getLocalService('channel') != undefined) {
            serviceFactory.getLocalService('channel').onPublish(serviceFactory.getProxy('user').publish);
        }
    }

    function configureClientPort(config) {
        /**
         * Create client port if configured
         */
        var clientStarted = (clientPort !== undefined);
        if (config.clientPort != undefined && !config.isSpareNode) {
            initClientPort(config);
            if (!clientStarted) {
                try {
                    clientPort.start(config.clientPort.port, config.clientPort.hostname);
                    logger.info("clientPort listening on " + config.clientPort.hostname + ":" + config.clientPort.port);
                }
                catch (e) {
                    logger.error("Error binding: " + e);
                }
            }
        }
        /**
         * Delete client port if started but not configured any more
         */
        else if (clientStarted) {
            logger.info("Stopped client port");
            clientPort.stop();
            clientPort = undefined;
        }
    }

    function reloadConfig(config) {
        var oldPorts, newPorts;
        oldPorts = JSON.stringify(_config.adminPort) + JSON.stringify(_config.clientPort);
        newPorts = JSON.stringify(config.adminPort) + JSON.stringify(config.clientPort);

        if (oldPorts != newPorts) {
            throw new Error("Hostnames or ports cannot change by reload. Please restart node.");
        }

        deinitAdminPort();
        configureAdminPort(config);

        configureClientPort(config);
    };

    function startWithConfig(config, worker) {
        createAdminPort(worker);
        configureAdminPort(config);

        try {
            adminPort.start(config.adminPort.port, config.adminPort.hostname);
            logger.info("adminPort listening on " + config.adminPort.hostname + ":" + config.adminPort.port);
        }
        catch (e) {
            logger.error("Error binding: " + e);
        }

        configureClientPort(config);
    };

    this.setConfig = function (config) {
        try {
            validateConfig(config);
        }
        catch (e) {
            throw new Error("Configuration error: " + e);
        }

        if (initialized) {
            reloadConfig(config);
        }
        else {
            startWithConfig(config, this);
        }

        initialized = 1;
        _config = config;
    };

    this.reload = this.loadConfig;

}

module.exports = function(nodeId, serviceFactory, configService) {
    return new Worker(nodeId, serviceFactory, configService);
}
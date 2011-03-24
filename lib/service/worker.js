var logger = require('logger').getLogger('worker');

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
                that.applyConfig(cfg);
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

    this.stop = function () {
        var user, channel;

        logger.info("Stop adminPort");
        adminPort.stop();
        if (clientPort !== undefined) {
            logger.info("Stop clientPort");
            clientPort.stop();
        }

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
        }

    }

    this.reload = this.loadConfig;

    function createAdminPort(servicesConfig, worker) {
        var workerProxy,
            connect = require('connect'),
            server;

        server = connect(
            connect.static(__dirname + '/../../rpc/public')
        );
        adminPort = require('rpc/binding/http')(server);
        adminPort.setLogger(require('logger').getLogger('worker_http'), 'info');
        // Create a local proxy for ourself
        workerProxy = new (require('rpc/proxy/local'))({
                'name': 'worker',
                'methods': {
                    'reload': {
                        'params': [],
                        'description': 'Reload process'
                    }
                }
            },
            worker);
        adminPort.bindService(workerProxy);

        for (var serviceName in servicesConfig) {
            logger.info("Loading service " + serviceName);
            var proxy = serviceFactory.createProxy(serviceName, servicesConfig[serviceName]);
            adminPort.bindService(
                proxy
            );
        }
    }

    function createClientPort(config) {
        if (serviceFactory.getLocalService('user') == undefined) {
            throw "Clientport needs local user-service";
        }

        // Add event listener to unsubscribe disconnected user from all groups
        serviceFactory.getLocalService('user').onDisconnect(serviceFactory.getProxy('channel').unsubscribeAll);
        serviceFactory.getLocalService('user').setDisconnectTimeout(config.options.removeUserAfterDisconnectTimeOut || 60000);

        if (clientPort === undefined) {
            var connect = require('connect'),
                server = connect(
                    connect.logger(),
                    connect.static(__dirname + '/../../public')
                );

            clientPort = require('client')(server);
        }
        clientPort.setAuthService(serviceFactory.getProxy('auth'));
        clientPort.setAuthTimeout(config.options.authenticationTimeOut || 900000);
        clientPort.setUserService(serviceFactory.getLocalService('user'));
        clientPort.start(config.clientPort.port, config.clientPort.hostname);
        logger.info("clientPort listening on " + config.clientPort.hostname + ":" + config.clientPort.port);
    }

    function validateConfig(config) {
        if (config.adminPort === undefined) {
            throw "adminPort not defined";
        }
        if (config.adminPort.port === undefined) {
            throw "adminPort.port not defined";
        }
        if (config.clientPort !== undefined && config.clientPort.port === undefined) {
            throw "clientPort.port not defined";
        }
        if (typeof config.options !== 'object') {
            config.options = {};
        }
        if (config.services === undefined) {
            throw "services not defined";
        }
        if (config.services.user === undefined) {
            throw "service 'user' not defined";
        }
        if (config.services.auth === undefined) {
            throw "service 'auth' not defined";
        }
    }

    this.applyConfig = function (config) {
        try {
            validateConfig(config);
        }
        catch (e) {
            throw "Configuration error: " + e;
        }

        if (initialized) {
            this.stop(config);
        }
        
        createAdminPort(config.services, this);

        // Check required service definitions
        if (serviceFactory.getProxy('user') == undefined) {
            throw "service 'user' not defined";
        }

        if (serviceFactory.getProxy('auth') == undefined) {
            throw "service 'auth' not defined";
        }

        /**
         * Add event listener for group publish
         * Only necessary for local channels, channel-proxy objects don't publish
         */
        if (serviceFactory.getLocalService('channel') != undefined) {
            serviceFactory.getLocalService('channel').onPublish(serviceFactory.getProxy('user').publish);
        }
        adminPort.start(config.adminPort.port, config.adminPort.hostname);
        logger.info("adminPort listening on " + config.adminPort.hostname + ":" + config.adminPort.port);

        /**
         * Create client port if configured
         */
        if (config.clientPort != undefined) {
            createClientPort(config);
        }
        /**
         * Delete client port if started but not configured any more
         */
        else if (clientPort != undefined) {
            clientPort = undefined;
        }

        initialized = 1;
        _config = config;
    };
}

module.exports = function(nodeId, serviceFactory, configService) {
    return new Worker(nodeId, serviceFactory, configService);
}
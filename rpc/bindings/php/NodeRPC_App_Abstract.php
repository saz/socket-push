<?php

abstract class NodeRPC_App_Abstract {

    /**
     * @var array
     */
    private $hosts = array();

    /**
     * @var array
     */
    protected $services;

    /**
     * @var array
     */
    protected $serviceObjects;

    public function __construct() {
        $this->init();
    }

    abstract protected function init();

    /**
     * Add host to pool
     * @param  $host
     * @param  $port
     * @return void
     */
    public function addHost($host, $port) {
        $this->hosts[] = array(
            'host' => $host,
            'port' => $port
        );
    }

    /**
     * Elect arbitrary host to connect service to
     *
     * @return array
     */
    private function electHost() {
        return $this->hosts[mt_rand(0, count($this->hosts) - 1)];
    }

    /**
     * Return instance on service object of app
     *
     * @throws NodeRPC_App_Exception
     * @param  $name
     * @return array
     */
    public function getService($name) {
        $name = ucfirst($name);

        if (!isset($this->services[$name])) {
            throw new NodeRPC_App_Exception("Unknown service " + $name);
        }

        if (!isset($this->serviceObjects[$name])) {
            require_once 'NodeRPC_Service_Abstract.php';
            $objectName = 'NodeRPC_Service_' . ucfirst($name);
            require_once $objectName . ".php";
            $host = $this->electHost();
            $this->serviceObjects[$name] = new $objectName($host['host'], $host['port']);
        }

        return $this->serviceObjects[$name];
    }

}
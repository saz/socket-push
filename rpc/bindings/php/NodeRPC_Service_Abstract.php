<?php

abstract class NodeRPC_Service_Abstract {

	/**
	 * @var string
	 */
	private $host;

	/**
	 * @var int
	 */
	private $port;

	/**
	 * @var stdClass
	 */
	protected $serviceDefinition;

	/**
	 * @var string
	 */
	protected $serviceName;

	public function __construct($host, $port = 80) {
		$this->host = $host;
		$this->port = $port;
		$this->init();
	}

	/**
	 * Initialize service
	 *
	 * @abstract
	 * @return void
	 */
	abstract function init();

	/**
	 * Convert arguments to http format
	 *
	 * @param  $args
	 * @param  $paramDefinition
	 * @return void
	 */
	protected function marshalParams($args, $paramDefinition) {
		foreach ($args as $i => &$arg) {
			switch ($paramDefinition[$i]['type']) {
				case 'string':
					$arg = rawurlencode($arg);
					break;
				case 'number':
					$arg = (int)$arg;
					break;
				case 'object':
					$arg = rawurlencode(json_encode($arg));
					break;
			}
		}
		return $args;
	}

	/**
	 * Make http request with HttpRequest Object
	 *
	 * @throws NodeRPC_Service_Exception
	 * @param  $url
	 * @return mixed
	 */
	private function httpHttpRequest($url) {
		$httpRequest = new HttpRequest($url, HttpRequest::METH_GET);
		$httpRequest->send();
		if ($httpRequest->getResponseCode() == 200) {
			return json_decode($httpRequest->getResponseBody());
		}
		else {
			throw new NodeRPC_Service_Exception($httpRequest->getResponseBody());
		}
	}

	/**
	 * Make http request with file_get_contents
	 *
	 * @throws Exception
	 * @param  $url
	 * @return mixed
	 */
	private function httpFileGetContents($url) {
		$response = file_get_contents($url);
		if (strpos($http_response_header[0], '200 OK') !== false) {
			return json_decode($response, true);
		}
		else {
			throw new Exception($response);
		}
	}

	/**
	 * Send request via http
	 * @param  $method
	 * @param  $args
	 * @return void
	 */
	protected function proxyCall($method, $args) {
		$args = $this->marshalParams($args, $this->serviceDefinition[$method]['params']);
		$route = "http://".$this->host.':'.$this->port.'/'.$this->serviceName."/".$method."/".implode('/', $args);
		if (class_exists('HttpRequest')) {
			return $this->httpHttpRequest($route);
		}
		else {
			return $this->httpFileGetContents($route);
		}
	}

}
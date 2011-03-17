<?php

$opts = getopt('h:p:');

if (empty($opts['h'])) {
	echo "Usage: generateApi.php -h HOST [-p PORT]\n";
	die();
}

$host = $opts['h'];
$port = isset($opts['p']) ? $opts['p'] : 80;

$route = "http://".$host.':'.$port.'/api';
$response = file_get_contents($route);
if (strpos($http_response_header[0], '200 OK') !== false) {
	$services = json_decode($response, true);
}
else {
	throw new Exception($response);
}
foreach ($services as $serviceName => $methods) {
	ob_start();
	include 'serviceTemplate.php';
	$class = ob_get_clean();
	file_put_contents(dirname(__FILE__).'/NodeRPC_Service_'.ucfirst($serviceName).'.php', '<?php'."\n".$class);
}
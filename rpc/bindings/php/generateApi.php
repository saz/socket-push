<?php

$opts = getopt('h:p:a:');

if (empty($opts['h']) || empty($opts['a'])) {
    echo "Usage: generateApi.php -a ApplicationName -h HOST [-p PORT]\n";
    die();
}

$host = $opts['h'];
$port = isset($opts['p']) ? $opts['p'] : 80;

$route = "http://" . $host . ':' . $port . '/api';
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
    file_put_contents(dirname(__FILE__) . '/NodeRPC_Service_' . ucfirst($serviceName) . '.php', '<?php' . "\n" . $class);
}

ob_start();
$appName = $opts['a'];
$serviceNames = array();
foreach ($services as $serviceName => $methods) {
    $serviceNames[ucfirst($serviceName)] = true;
}

include 'appTemplate.php';
$class = ob_get_clean();
file_put_contents(dirname(__FILE__) . '/NodeRPC_App_' . ucfirst($appName) . '.php', '<?php' . "\n" . $class);

<?php

$host = '127.0.0.1';
$port = 8181;

$generator = dirname(__FILE__)."/generateApi.php -a Socket -h $host -p $port";
`php $generator`;

require 'NodeRPC_App_Socket.php';

$app = new NodeRPC_App_Socket();
$app->addHost($host, $port);

$authService = $app->getService('Auth');
$authService->set(2, 'test');

$channelService = $app->getService('channel');
for ($x = 0; $x < 100; $x++) {
    $channelService->subscribe(2, 'testChannel' . $x);
}
echo "Channels subscribed by 2:\n";
echo implode(',', $channelService->getSubscriptions(2));
echo "\n";
echo "\n";
echo "Channels:\n";
echo implode(',', $channelService->listAll());
echo "\n";
echo "\n";

$userService = $app->getService('user');
echo "Users:\n";
try {
    echo implode(',', $userService->listAll());
}
catch (NodeRPC_Service_Exception $e) {
    echo "Seems you have a sharded config";
}
echo "\n";

<?php

require 'NodeRPC_Service_Abstract.php';
require 'NodeRPC_Service_Auth.php';
require 'NodeRPC_Service_Channel.php';
require 'NodeRPC_Service_User.php';

$host = '127.0.0.1';
$port = 8181;

$authService = new NodeRPC_Service_Auth($host, $port);
$authService->set(2, 'test');

$channelService = new NodeRPC_Service_Channel($host, $port);
for ($x = 0; $x < 100; $x++) {
	$channelService->subscribe(2, 'testChannel'.$x);
}
echo "Channels subscribed by 2:\n";
echo implode(',', $channelService->getSubscriptions(2));
echo "\n";
echo "\n";
echo "Channels:\n";
echo implode(',', $channelService->listAll());
echo "\n";
echo "\n";

$userService = new NodeRPC_Service_User($host, $port);
echo "Users:\n";
echo implode(',', $userService->listAll());
echo "\n";

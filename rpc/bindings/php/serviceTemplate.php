<?

$phpDefinition = preg_replace('/  /', "\t", var_export($methods, true));
$phpDefinition = preg_replace('/^/m', "\t\t", $phpDefinition);
$phpDefinition = preg_replace('/ /', "", $phpDefinition);
$phpDefinition = trim($phpDefinition);
?>
class NodeRPC_Service_<?= ucfirst($serviceName) ?> extends NodeRPC_Service_Abstract {

    public function init() {
        $this->serviceName = '<?= $serviceName ?>';
        $this->serviceDefinition = <?= $phpDefinition ?>;
    }
<? foreach ($methods as $method => $definition) {
    $paramlist = array();
    foreach ($definition['params'] as $param) {
        $paramlist[] = '$'.$param['name'];
    }
    ?>


    /**
     * <?= $definition['description'] ?>

 <?
    foreach ($definition['params'] as $param) { ?>
     * @param <?=$param['type'] ?> $<?=$param['name'] ?>

 <?    }
?>
     */
    public function <?= $method ?>(<?= implode(', ', $paramlist); ?>) {
        return $this->proxyCall('<?= $method ?>', func_get_args());
    }
<? } ?>
}
<?

$phpDefinition = preg_replace('/  /', "\t", var_export($serviceNames, true));
$phpDefinition = preg_replace('/^/m', "\t\t", $phpDefinition);
$phpDefinition = preg_replace('/ /', "", $phpDefinition);
$phpDefinition = trim($phpDefinition);
?>
include 'NodeRPC_App_Abstract.php';

class NodeRPC_App_<?= ucfirst($appName) ?> extends NodeRPC_App_Abstract {

    public function init() {
        $this->services = <?= $phpDefinition ?>;
    }

}
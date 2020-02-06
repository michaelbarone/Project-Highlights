<?php
require './pathConstants.php';

$dir = $web;

$json = file_get_contents($dir . "\app.json");
echo $json;

?>
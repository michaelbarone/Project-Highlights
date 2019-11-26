<?php
$dir = "\\\\sacfiles1\\shared\\aa\\cs\\Systems\\web\\Project-Highlights";

$json = file_get_contents($dir . "\app.json");
echo $json;

?>
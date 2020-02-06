<?php

$video = $_GET['video'];

require './pathConstants.php';

$dir = $video . "\\";


$imagePartArray = explode(".", $video);
$imagePart = end($imagePartArray);
//print($imagePart);


$file = $dir . $video;

$type = 'video/' . $imagePart; // or whatsoever
header('Content-Type:' . $type);
header('Content-Length: ' . filesize($file));
$img = file_get_contents($file);
echo $img;

exit();



?>

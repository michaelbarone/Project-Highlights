<?php

$video = $_GET['video'];

$dir = "\\\\sacfiles1\\shared\\aa\\cs\\Resolved\\00 Project Hightlights\\Video\\";

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

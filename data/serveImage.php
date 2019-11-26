<?php
//print_r($_GET['image']);

$image = $_GET['image'];

$dir = "\\\\sacfiles1\\shared\\aa\\cs\\Resolved\\00 Project Hightlights\\Images\\";

$imagePartArray = explode(".", $image);
$imagePart = end($imagePartArray);
//print($imagePart);


$file = $dir . $image;


switch($imagePart) {
	case "tif":
		$imagePart="tiff";
		break;
		
	case "jpeg":
	case "jpg":
		$imagePart="jpeg";
		break;

}

$type = 'image/' . $imagePart;
header('Content-Type:' . $type);
header('Content-Length: ' . filesize($file));
$img = file_get_contents($file);
echo $img;

exit();



?>

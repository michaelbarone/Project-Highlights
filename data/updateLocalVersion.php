<?php
require './pathConstants.php';

$dir = $web;

/*
$json = file_get_contents($dir . "\app.json");
echo $json;
*/


function custom_copy($src, $dst) {  
  
    // open the source directory 
    $dir = opendir($src);  
  
    // Make the destination directory if not exist 
    @mkdir($dst);  
  
    // Loop through the files in source directory 
    while( $file = readdir($dir) ) {  
  
        if (( $file != '.' ) && ( $file != '..' )) {  
            if ( is_dir($src . '/' . $file) )  
            {  
  
                // Recursively calling custom copy function 
                // for sub directory  
                custom_copy($src . '/' . $file, $dst . '/' . $file);  
  
            }  
            else {  
                copy($src . '/' . $file, $dst . '/' . $file);  
            }  
        }  
    }  
  
    closedir($dir);
}
  
$src = $dir; 

$dst = dirname(__FILE__);
$array = explode("\\",$dst);
array_pop($array);
$dst = implode($array,"\\");

  
//$dst = "C:/xampp/htdocs/gfg"; 
  
custom_copy($src, $dst);

echo "Copy Completed";


/*
$url = dirname(__FILE__);
echo $url;
$array = explode("\\",$url);
array_pop($array);
$url = implode($array,"\\");
echo $url;
*/
?>
<?php
$dir = "\\\\sacfiles1\\shared\\aa\\cs\\Systems\\web\\Project-Highlights";

$json = file_get_contents($dir . "\app.json");
echo $json;


/*
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
  
$src = "C:/xampp/htdocs/geeks"; 
  
$dst = "C:/xampp/htdocs/gfg"; 
  
custom_copy($src, $dst); 
*/

?>
<?php
$dir = "\\\\sacfiles1\\shared\\aa\\cs\\Resolved\\00 Project Hightlights\\Images";
$return_array = array();
if(is_dir($dir)){
    if($dh = opendir($dir)){
        while(($file = readdir($dh)) != false){
            if($file == "." or $file == ".."){
            } else {
                $return_array[] = $file;
            }
        }
    }
    echo json_encode($return_array);
}
?>
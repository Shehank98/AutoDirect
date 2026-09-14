<?php 

require_once DOC_ROOT.'vendor/autoload.php';

use Medoo\Medoo;

class Common
{
	/*
	* @return an array of time periods that reminders need to send
	*/
	static function getCategoryArray(){

	return array("web","mobile","facebookapp","game","other");
	}

	static function getPermissions($module,$type){

	     $datas = Sessions::getAdminType();
		 $permission = json_decode($datas[0]['permissions']);

			foreach ($permission as $key => $value) {				
			  // echo $key."<br>";         //module names				                  
			 
			 $GLOBALS['modkey'] = $key;

			  foreach ($value as $k => $v) {

			    foreach ($v as $key => $val) {
			      
			        // print_r($key."=>");           //add,delete
			        // print_r($val[0]."<br>");      //0 , 1

			        // check correct module

			           if ($GLOBALS['modkey'] == $module && $key == $type)  {

			           return $val[0];
			            
			          }          

			      }
			 
			  }

		 }
	}

	static function getStatus(){
		return array('Hide','Show');
	}

	static function makeSeo($text, $limit = 75) {

        $text = preg_replace('~[^\\pL\d]+~u', '-', $text);

        $text = trim($text, '-');

        $text = strtolower($text);

        $text = preg_replace('~[^-\w]+~', '', $text);

        if (strlen($text) > 70) {
            $text = substr($text, 0, 70);
        }

        if (empty($text)) {
            return time();
        }

        return $text;
    }

}
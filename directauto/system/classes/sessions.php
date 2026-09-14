<?php 

require_once DOC_ROOT.'vendor/autoload.php';

use Medoo\Medoo;

class Sessions
{

	static function setAdminLoginDetails($admin_id,$admin_username,$admin_full_name,$admin_type){

		$permi = new Userpermissions();
		$data_permi = $permi->getPermissionsById($admin_type);

		$_SESSION["admin_id"] = $admin_id;
		$_SESSION["admin_username"] = $admin_username;
		$_SESSION["admin_full_name"] = $admin_full_name;
		$_SESSION["admin_type"] = $data_permi;
		$_SESSION["is_admin_logged"] = true;
	}	

	static function isAdminLogged(){
		if(isset($_SESSION['is_admin_logged']) && $_SESSION['is_admin_logged']==true){
			return true;
		}else{
			return false;
		}
	}

	static function getAdminId(){
		return $_SESSION["admin_id"];
	}

	static function getAdminType(){
		return $_SESSION["admin_type"];
	}

	static function getAdminFullName(){
		return $_SESSION["admin_full_name"];
	}
	
	static function adminRedirectOnNotLoggedIn(){

		if(!Sessions::isAdminLogged()){
		  header("Location: ".SITE_URL."admin/login.php");
		  exit();
		}

	}
	static function logoutAdmin(){
		unset($_SESSION["admin_id"]);
		unset($_SESSION["admin_username"]);
		unset($_SESSION["is_admin_logged"]);
		unset($_SESSION["admin_full_name"]);
		unset($_SESSION["admin_type"]);
	}

	static function setCompareVehiclesLocal($compare_list){
		$_SESSION['compare_list_local'] = $compare_list; 		
	}

	static function getCompareVehiclesLocal(){
		return $_SESSION['compare_list_local'];
	}

	static function setCustomerLoginDetails($customer_id,$customer_email,$customer_name){
		$_SESSION["customer_id"] = $customer_id;
		$_SESSION["customer_email"] = $customer_email;
		$_SESSION["customer_name"] = $customer_name;
		$_SESSION["is_customer_logged"] = true;
	}

	static function getCustomerId(){
		return $_SESSION["customer_id"];
	}

	static function getCustomerName(){
		return $_SESSION["customer_name"];
	}

	static function getIsCustomerLoggedIn(){
		return $_SESSION["is_customer_logged"];
	}

	static function customerRedirectOnNotLoggedIn($url_parameter=''){

		if(!Sessions::getIsCustomerLoggedIn()){
		  header("Location: ".SITE_URL."my-account/login.php".$url_parameter);
		  exit();
		}

	}

	static function logoutCustomer(){
		unset($_SESSION["customer_id"]);
		unset($_SESSION["customer_email"]);
		unset($_SESSION["customer_name"]);
		unset($_SESSION["is_customer_logged"]);
	}

}
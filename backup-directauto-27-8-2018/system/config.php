<?php 
	
	@ini_set('zlib.output_compression', 1);
	ob_implicit_flush(true);
	error_reporting(0);
	@ini_set( 'session.cookie_httponly', 1 );
	session_start();

	define("SITE_URL", "http://directautoimport.lk/");
	define("DOC_ROOT", "/home/autoimport/public_html/");

	define("DB_HOST", "localhost");
	define("DB_USER", "autoimport_autoimport");
	define("DB_PASS", "7f400Xv8SSBI");
	define("DB_NAME", "autoimport_main_db");

	spl_autoload_register('myAutoloader');

	function myAutoloader($className)
	{
	    $path = DOC_ROOT.'system/classes/';
	    include $path.strtolower($className).'.php';
	}

	#-- Set time zone --
	date_default_timezone_set('Asia/Colombo');
?>
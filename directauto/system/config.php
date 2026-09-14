<?php

	@ini_set('zlib.output_compression', 1);
	ob_implicit_flush(true);
	error_reporting(0);
	@ini_set( 'session.cookie_httponly', 1 );
	session_start();

	/*
	 * Small helper: read an environment variable with a fallback.
	 * Works with both getenv() and $_ENV / $_SERVER (Railway populates these).
	 */
	if (!function_exists('env_val')) {
		function env_val($key, $default = '') {
			$value = getenv($key);
			if ($value === false || $value === '') {
				if (isset($_ENV[$key]) && $_ENV[$key] !== '')       { $value = $_ENV[$key]; }
				elseif (isset($_SERVER[$key]) && $_SERVER[$key] !== '') { $value = $_SERVER[$key]; }
				else { $value = $default; }
			}
			return $value;
		}
	}

	/*
	 * Public site URL.
	 * On Railway set SITE_URL in the service variables (e.g. https://your-app.up.railway.app/).
	 * If it is not set we fall back to auto-detecting it from the incoming request.
	 */
	$auto_scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
	if (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https') { $auto_scheme = 'https'; } // behind Railway proxy
	$auto_host   = $_SERVER['HTTP_HOST'] ?? 'localhost';
	$auto_url    = $auto_scheme . '://' . $auto_host . '/';
	define("SITE_URL", rtrim(env_val('SITE_URL', $auto_url), '/') . '/');

	/*
	 * Document root of the application.
	 * config.php lives in <app>/system/config.php, so the app root is one level up.
	 * (No more hardcoded /home/directau/public_html/ path.)
	 */
	define("DOC_ROOT", dirname(__DIR__) . '/');

	/*
	 * Database connection.
	 * Railway's MySQL plugin exposes MYSQLHOST / MYSQLUSER / MYSQLPASSWORD / MYSQLDATABASE / MYSQLPORT.
	 * Add those as reference variables on the app service (or set DB_HOST/DB_USER/DB_PASS/DB_NAME directly).
	 * The MYSQL* names are tried first, then the DB_* names, then a localhost default for local dev.
	 */
	define("DB_HOST", env_val('MYSQLHOST', env_val('DB_HOST', 'localhost')));
	define("DB_PORT", env_val('MYSQLPORT', env_val('DB_PORT', '3306')));
	define("DB_USER", env_val('MYSQLUSER', env_val('DB_USER', 'root')));
	define("DB_PASS", env_val('MYSQLPASSWORD', env_val('DB_PASS', '')));
	define("DB_NAME", env_val('MYSQLDATABASE', env_val('DB_NAME', 'car_auction')));

	spl_autoload_register('myAutoloader');

	function myAutoloader($className)
	{
	    $path = DOC_ROOT.'system/classes/';
	    include $path.strtolower($className).'.php';
	}

	#-- Set time zone --
	date_default_timezone_set('Asia/Colombo');

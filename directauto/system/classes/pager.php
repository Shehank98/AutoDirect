<?php
require_once DOC_ROOT.'vendor/autoload.php';

use Medoo\Medoo;

class Pager {

    private $data;
    private $pagination;
    private $database;

    public function __construct() {
	$this->data = array();
	$this->pagination = array();
	$this->database = new medoo([
		    'database_type' => 'mysql',
		    'database_name' => DB_NAME,
		    'server' => DB_HOST,
		    'username' => DB_USER,
		    'password' => DB_PASS,
		    'charset' => 'utf8'
		]); 
    }

    public function pager($query, $page = false, $limit = false) {
		if ($limit && is_numeric($limit)):
		    $limit = $limit;
		else:
		    $limit = 10;
		endif;

		if ($page && is_numeric($page)):
		    $page = $page;
		    $initiation = ($page - 1) * $limit;
		else:
		    $page = 1;
		    $initiation = 0;
		endif;

		$rows = $this->database->query($query)->rowCount();
		$total = ceil($rows / $limit);
		$query = $query . " LIMIT " . $initiation . ", " . $limit;
		$this->data = $this->database->query($query)->fetchAll(PDO::FETCH_ASSOC);

		$pager = array();
		$pager['current'] = $page;
		$pager['total'] = $total;

		if ($page > 1):
		    $pager["first"] = 1;
		    //$pager["previous"] = $page - 1;
		else:
		    $pager["first"] = "";
		    //$pager["previous"] = "";
		endif;

		if ($page < $total):
		    $pager["last"] = $total;
		    //$pager["next"] = $page + 1;
		else:
		    $pager["next"] = "";
		    //$pager["last"] = "";
		endif;

		$this->pagination = $pager;

		return $this->data;
    }

    public function getPager() {
		if ($this->pagination):
		    return $this->pagination;
		else:
		    return false;
		endif;
    }

    public function getPagerStyle($names = array(), $classCss = false, $link = false) {
		$params = $this->getPager();
		$out = '';

		$class = '';
		if ($classCss != false):
		    $class = ' class="' . $classCss . '"';
		endif;

		$out .=  '<ul' . $class . '>';

		$out .=  '<li>';
		if ($params["first"]):
		    $out .=  '<a href="' . $link . $params["first"] . '">' . $names[0] . '</a>';
		else:
		    $out .=  '<a>' . $names[0] . '</a>';
		endif;
		$out .=  '</li>';

		for ($i = 1; $i <= $params['total']; $i++):
		    if ($params['current'] != $i):
			$out .=  '<li><a href="' . $link . $i . '" >' . $i . '</a></li>';
		    else:
			$out .=  '<li class="active"><a>' . $i . '</a></li>';
		    endif;
		endfor;

		$out .=  '<li>';
		if ($params["last"]):
		    $out .=  '<a href="' . $link . $params["last"] . '">' . $names[1] . '</a>';
		else:
		    $out .=  '<a>' . $names[1] . '</a>';
		endif;
		$out .=  '</li>';

		$out .=  '</ul>';
	    return $out;
    }


}
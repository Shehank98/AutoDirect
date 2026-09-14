<?php 

require_once '../config.php';

$action = strip_tags($_POST['action']); 

switch ($action) {
	case 'index':
		index();
		break;

	case 'store':
		store();
		break;

	case 'edit':
		edit();
		break;

	case 'update':
		update();
		break;

	case 'destroy':
		destroy();
		break;

	case 'login':
		login();
		break;

	case 'logout':
		logout();
		break;

}


function index(){

	$userpermissions = new Userpermissions();
	$all = $userpermissions->selectAll();

	$page = strip_tags($_POST['page']);
	$limit = 10;
	$link = SITE_URL.'admin/modules/suserpermissions/?page=';
	$class = 'pagination';

	$Pager = new Pager();
	$query = $userpermissions->selectAllQuery();
	$Buttons = array('&laquo;', '&raquo;');

	$pagination = '';

	$data = $Pager->pager($query, $page, $limit);
	if(count($all)>$limit){
		$Pager->getPager();
		$pagination .= $Pager->getPagerStyle($Buttons, $class, $link);
	}

	$out = '';
	$modal = '';
	foreach ($data as $row) {

		$out .= '<tr id="row'.$row['id'].'">';
		$out .= '<td>'.$row['id'].'</td>';
	
		$out .= '<td>'.$row['name'].'</td>';
	
		  $val = Common::getPermissions("userpermissions","edit");
              if ($val== 1) {  

				$editview = '<a href="'.SITE_URL.'admin/modules/userpermissions/edit.php?id='.$row['id'].'">
		   		<i class="fa fa-pencil-square-o fa-lg" aria-hidden="true"></i> </a>';
		   				    }

		   				 $val = Common::getPermissions("userpermissions","delete");
              if ($val== 1) { 
				$deleteaction = '<a href="javascript:;" class="text-danger"
		  						   onclick="deleteUser('.$row['id'].');"> ';
		  					}

		
		$out .= '<td> '.$editview.'    	

		     &nbsp; &nbsp;'.$deleteaction.'
		     <i class="fa fa-times fa-lg" aria-hidden="true"></i></a></td>';
		
		$out .= '</tr>';


	}

	foreach ($data as $row) {
		$modal .= '<div id="delete_'.$row['id'].'" class="modal fade" role="dialog">
				  <div class="modal-dialog">

				    <div class="modal-content">
				      <div class="modal-header">
				        <button type="button" class="close" data-dismiss="modal">&times;</button>
				        <h4 class="modal-title">Delete User</h4>
				      </div>
				      <div class="modal-body">
				        <p>Are you sure you want to delete this user.</p>
				      </div>
				      <div class="modal-footer">
				      <button type="button" class="btn btn-success" data-dismiss="modal">No</button>
				        <button type="button" class="btn btn-danger" onclick="deleteUser('.$row['id'].')">Yes</button>
				      </div>
				    </div>

				  </div>
				</div>';
	}
	echo json_encode(array('table'=>$out,'modal'=>$modal,'pagination'=>$pagination));
}

function create(){
  echo 'create';
}

function store(){

	

	$date = date("Y-m-d H:i:s");

	$data = $_POST;
	//$data['created_at'] = $date;

	$userpermissions = new Userpermissions();
	$insert  = $userpermissions->store($data);

	if($insert){
		echo 200;
	}else{
		echo 400;
	}
}

function show(){
  echo 'show';
}

function edit(){
  echo 'edit';
}

function update(){


	date_default_timezone_set('Asia/Colombo');
	$date = date("Y-m-d H:i:s");

	$data = $_POST;
	$data['updated_at'] = $date;

	$userpermissions = new Userpermissions();
	$updates = $userpermissions->update($data);

	if($updates){
		echo 200;
	}else{
		echo 400;
	}
}

function destroy(){
	
	$userpermissions = new Userpermissions();
	$delete = $userpermissions->delete(strip_tags($_POST['id']));

	if($delete){
		echo 200;
	}else{
		echo 400;
	}
}

?>


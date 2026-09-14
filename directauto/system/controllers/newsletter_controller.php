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

	$newsletters = new NewsLetters();
	$all = $newsletters->selectAll();

	$page = strip_tags($_POST['page']);
	$limit = 10;
	$link = SITE_URL.'admin/modules/newsletters/?page=';
	$class = 'pagination';

	$Pager = new Pager();
	$query = $newsletters->selectAllQuery();
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
		$out .= '<td>'.$row['email'].'</td>';


		$data = new Userpermissions();
		$viewdata = $data->getusernamebyid($row['type']);	

		$editview = '';
              $val = Common::getPermissions("newsletters","edit");
              /*if ($val== 1) {  

				$editview = '<a href="'.SITE_URL.'admin/modules/newsletters/edit.php?id='.$row['id'].'">
		   		<i class="fa fa-pencil-square-o fa-lg" aria-hidden="true"></i> </a>';
		   				    }*/

		   				 $val = Common::getPermissions("newsletters","delete");
              if ($val== 1) { 
				$deleteaction = '<a href="javascript:;" class="text-danger"
		  						   onclick="deleteNewsletter('.$row['id'].');"> ';
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
	$data['created_at'] = $date;

	$newsletters = new Newsletters();
	$insert  = $newsletters->store($data);

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

	$newsletters = new Newsletters();
	$updates = $newsletters->update($data);

	if($updates){
		echo 200;
	}else{
		echo 400;
	}
}

function destroy(){
	
	$newsletters = new Newsletters();
	$delete = $newsletters->delete(strip_tags($_POST['id']));

	if($delete){
		echo 200;
	}else{
		echo 400;
	}
}

function login(){ 

	$newsletters = new Newsletters();
	$data  = $newsletters->getByUsernameAndPassword(strip_tags($_POST['username']),strip_tags($_POST['password']));

	if(count($data)>0 && !empty($data)){
		Sessions::setAdminLoginDetails($data[0]['id'],$data[0]['username'],$data[0]['first_name'].' '. $data[0]['last_name'],$data[0]['type']);
		echo 200;
	}else{
		echo 400;
	}
}

function logout(){

	Sessions::logoutAdmin();
	echo 200;
}

?>
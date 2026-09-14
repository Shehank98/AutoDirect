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

}


function index(){

	$inquiries = new Inquiry();
	$all = $inquiries->selectAll();

	$page = strip_tags($_POST['page']);
	$limit = 10;
	$link = SITE_URL.'admin/modules/inquiries/?page=';
	$class = 'pagination';

	$Pager = new Pager();
	$query = $inquiries->selectAllQuery();
	$Buttons = array('&laquo;', '&raquo;');

	$pagination = '';

	$data = $Pager->pager($query, $page, $limit);
	if(count($all)>$limit){
		$Pager->getPager();
		$pagination .= $Pager->getPagerStyle($Buttons, $class, $link);
	}

	$vehicle = new Vehicle();

	$out = '';
	$modal = '';
	foreach ($data as $row) {
		$vehicle_data = $vehicle->getById($row['vehicle_id']);

		$out .= '<tr id="row'.$row['id'].'">';
		$out .= '<td>'.$row['id'].'</td>';
		$out .= '<td>'.$vehicle_data[0]['vehicle_manufacturer_name'].' '.$vehicle_data[0]['vehicle_model_name'].'</td>';
		$out .= '<td><a href="'.SITE_URL.'our-stock/'.$vehicle_data[0]['seo_url'].'" target="_blank"> URL </a></td>';
		$out .= '<td>'.$row['name'].'</td>';
		$out .= '<td>'.$row['email'].'</td>';
		$out .= '<td>'.$row['phone'].'</td>';
		$out .= '<td>'.$row['message'].'</td>';


		$data = new Userpermissions();
		$viewdata = $data->getusernamebyid($row['type']);	
		$editview = '';

              $val = Common::getPermissions("inquiries","edit");
             /* if ($val== 1) {  

				$editview = '<a href="'.SITE_URL.'admin/modules/inquiries/edit.php?id='.$row['id'].'">
		   		<i class="fa fa-pencil-square-o fa-lg" aria-hidden="true"></i> </a>';
		   				    }*/

		   				 $val = Common::getPermissions("inquiries","delete");
              if ($val== 1) { 
				$deleteaction = '<a href="javascript:;" class="text-danger"
		  						   onclick="deleteInquiry('.$row['id'].');"> ';
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
				        <h4 class="modal-title">Delete Inquiry</h4>
				      </div>
				      <div class="modal-body">
				        <p>Are you sure you want to delete this inquiry.</p>
				      </div>
				      <div class="modal-footer">
				      <button type="button" class="btn btn-success" data-dismiss="modal">No</button>
				        <button type="button" class="btn btn-danger" onclick="deleteInquiry('.$row['id'].')">Yes</button>
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

	$inquiries = new Inquiry();
	$insert  = $inquiries->store($data);

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

	$inquiries = new Inquiry();
	$updates = $inquiries->update($data);

	if($updates){
		echo 200;
	}else{
		echo 400;
	}
}

function destroy(){
	
	$inquiries = new Inquiry();
	$delete = $inquiries->delete(strip_tags($_POST['id']));

	if($delete){
		echo 200;
	}else{
		echo 400;
	}
}


?>
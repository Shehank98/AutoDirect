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

	case 'setSeo':
		setSeo();
		break;

	/**front end**/
	case 'loadYearLocal':
		loadYearLocal();
		break;
	case 'loadColoursLocal':
		loadColoursLocal();
		break;
}


function index(){

	$vehicle = new Vehicle();
	$all = $vehicle->selectAll();

	$page = strip_tags($_POST['page']);
	$limit = 10;
	$link = SITE_URL.'admin/modules/vehicle/?page=';
	$class = 'pagination';

	$Pager = new Pager();
	$query = $vehicle->selectAllQuery();
	$Buttons = array('&laquo;', '&raquo;');

	$pagination = '';

	$data = $Pager->pager($query, $page, $limit); 
	if(count($all)>$limit){
		$Pager->getPager();
		$pagination .= $Pager->getPagerStyle($Buttons, $class, $link);
	}

	$status = Common::getStatus();
	$featured = Vehicle::getIsFeastured();
	$latest = Vehicle::getIsLatest();

	$out = '';
	$modal = '';
	foreach ($data as $row) {
		$images = explode(',', $row['images']);

		$out .= '<tr id="row'.$row['id'].'">';
		$out .= '<td>'.$row['id'].'</td>';
	
		$out .= '<td><img src="'.SITE_URL.'uploads/vehicles/'.$images[0].'" width="110" height="65"></td>';
		$out .= '<td>'.$row['vehicle_type'].'</td>';
		$out .= '<td>'.$row['manu_name'].'</td>';
		$out .= '<td>'.$row['model_name'].'</td>';
		$out .= '<td>'.$row['vehicle_color'].'</td>';
		$out .= '<td>'.$status[$row['status']].'</td>';
		$out .= '<td>'.$featured[$row['is_featured']].'</td>';
		$out .= '<td>'.$latest[$row['is_latest']].'</td>';
	
		  $val = Common::getPermissions("vehicle","edit");
              if ($val== 1) {  

				$editview = '<a href="'.SITE_URL.'admin/modules/vehicle/edit.php?id='.$row['id'].'">
		   		<i class="fa fa-pencil-square-o fa-lg" aria-hidden="true"></i> </a>';
		   				    }

		   				 $val = Common::getPermissions("vehicle","delete");
              if ($val== 1) { 
				$deleteaction = '<a href="javascript:;" class="text-danger"
		  						   onclick="deleteVehicle('.$row['id'].');"> ';
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
				        <h4 class="modal-title">Delete Vehicle</h4>
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
	$data['feature_ids'] = implode(',', $_POST['feature_ids']);

	unset($data['action']); //print_r($_FILES['images']);

	$images_arr = reArrayFiles($_FILES['images']); 
	$images = array();

	for ($i=0; $i < count($images_arr) ; $i++) { 
		if($images_arr[$i]['tmp_name'] !=''){
			$new_name = renameImage($images_arr[$i]['name']);
			$sourcePath = $images_arr[$i]['tmp_name'];       // Storing source path of the file in a variable
			$targetPath = DOC_ROOT."uploads/vehicles/".$new_name; // Target path where file is to be stored
			move_uploaded_file($sourcePath,$targetPath) ;    // Moving Uploaded file
			$images[] = $new_name;
		}
	}


	$data['images'] = implode(',', $images); 

	$vehicle = new Vehicle();
	$insert  = $vehicle->store($data);

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
	$data['feature_ids'] = implode(',', $_POST['feature_ids']);

	unset($data['action']); //print_r($_FILES['images']);

	$images_arr = reArrayFiles($_FILES['images']); 
	$images = array();

	for ($i=0; $i < count($images_arr) ; $i++) { 
		if($images_arr[$i]['tmp_name'] !=''){
			$new_name = renameImage($images_arr[$i]['name']);
			$sourcePath = $images_arr[$i]['tmp_name'];       // Storing source path of the file in a variable
			$targetPath = DOC_ROOT."uploads/vehicles/".$new_name; // Target path where file is to be stored
			move_uploaded_file($sourcePath,$targetPath) ;    // Moving Uploaded file
			$images[] = $new_name;
		}
	}


	$data['images'] = implode(',', $images); 


	$vehicle = new Vehicle();
	$updates = $vehicle->update($data);

	if($updates){
		echo 200;
	}else{
		echo 400;
	}
}

function destroy(){
	
	$vehicle = new Vehicle();
	$delete = $vehicle->delete(strip_tags($_POST['id']));

	if($delete){
		echo 200;
	}else{
		echo 400;
	}
}

function setSeo(){

	$type = strip_tags($_POST['type']);
	$manufacturer = strip_tags($_POST['manufacturer']);
	$model = strip_tags($_POST['model']);
	$seo_text = $type.' '.$manufacturer.' '.$model;
	$seo = Vehicle::makeSeo($seo_text);

	echo $seo;
}

function reArrayFiles(&$file_post) {

    $file_ary = array();
    $file_count = count($file_post['name']);
    $file_keys = array_keys($file_post);

    for ($i=0; $i<$file_count; $i++) {
        foreach ($file_keys as $key) {
            $file_ary[$i][$key] = $file_post[$key][$i];
        }
    }

    return $file_ary;
}

function renameImage($img_name){
	$name_arr = explode('.', $img_name);
	$ext = end($name_arr);
	unset($name_arr[count($name_arr)-1]);
	$new_name = implode('_', $name_arr).'_'.time().'.'.$ext;
	return $new_name;
}

function loadYearLocal(){
	$manufacturer = strip_tags($_POST['manufacturer_id']);
	$model = strip_tags($_POST['model_id']); 
	$vehicle = new Vehicle();
	if($model == '' || empty($model) || $model =='undefined'){
		$data = $vehicle->getYearsByManufacturer($manufacturer);
	}else{
		if($manufacturer == '' || empty($manufacturer) || $manufacturer =='undefined'){
			$data = $vehicle->getYears();
		}else{
			$data = $vehicle->getYearsByManufacturerAndModel($manufacturer,$model);
		}
	}

	echo json_encode(array('years' => $data));
}

function loadColoursLocal(){ //error_reporting(E_ALL);
	$manufacturer = strip_tags($_POST['manufacturer_id']);
	$model = strip_tags($_POST['model_id']); 
	$from_year = strip_tags($_POST['from_year']); 
	$to_year = strip_tags($_POST['to_year']); 

	$vehicle = new Vehicle();
	if(($model == '' || empty($model) || $model =='undefined')){
		
		$data = $vehicle->getColoursByManufacturer($manufacturer,$from_year,$to_year);
	}else{
		if($manufacturer == '' || empty($manufacturer) || $manufacturer =='undefined'){
			$data = $vehicle->getColours();
		}else{
			$data = $vehicle->getColoursByManufacturerAndModel($manufacturer,$model,$from_year,$to_year);
		}
	}

	echo json_encode(array('colors' => $data));
}

?>


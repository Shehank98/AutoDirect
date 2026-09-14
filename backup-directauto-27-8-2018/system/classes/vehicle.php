<?php 

require_once DOC_ROOT.'vendor/autoload.php';

use Medoo\Medoo;

class Vehicle
{
	private $table_name = "vehicle";
	protected $connection;

	function __construct()
	{
		$database = new medoo([
		    'database_type' => 'mysql',
		    'database_name' => DB_NAME,
		    'server' => DB_HOST,
		    'username' => DB_USER,
		    'password' => DB_PASS,
		    'charset' => 'utf8'
		]); 

		$this->connection = $database;
	}

	function store($data){
		$status = $this->connection->insert($this->table_name, [
            "vehicle_type" => strip_tags($data['vehicle_type']),
	            "vehicle_manufacturer" => strip_tags($data['vehicle_manufacturer']),
	            "vehicle_model" => strip_tags($data['vehicle_model']),
	            "seo_url" => strip_tags($data['seo_url']),
	            "main_color" => strip_tags($data['main_color']),
	            "other_color" => strip_tags($data['other_color']),
	            "description" => strip_tags($data['description']),
	            "year" => strip_tags($data['year']),
	            "chassi_id" => strip_tags($data['chassi_id']),
	            "conditions" => strip_tags($data['conditions']),
	            "seats" => strip_tags($data['seats']),
	            "doors" => strip_tags($data['doors']),
	            "passengers" => strip_tags($data['passengers']),
	            "engine_capacity" => strip_tags($data['engine_capacity']),
	            "mileage" => strip_tags($data['mileage']),
	            "fuel_type" => strip_tags($data['fuel_type']),
	            "transmission" => strip_tags($data['transmission']),
	            "drive_type" => strip_tags($data['drive_type']),
	            "auction_grade" => strip_tags($data['auction_grade']),
	            "grade" => strip_tags($data['grade']),
	            "images" => strip_tags($data['images']),
	            "feature_ids" => strip_tags($data['feature_ids']),
	            "is_featured" => strip_tags($data['is_featured']),
	            "status" => strip_tags($data['status']),
	            "is_latest" => strip_tags($data['is_latest']),
	            "created_at" => strip_tags($data['created_at'])
        ]);

        return $status;
	}

	function update($data){
	
		if(strip_tags($data['images']) != ''){
		    $status = $this->connection->update($this->table_name, [
		        "vehicle_type" => strip_tags($data['vehicle_type']),
	            "vehicle_manufacturer" => strip_tags($data['vehicle_manufacturer']),
	            "vehicle_model" => strip_tags($data['vehicle_model']),
	            "seo_url" => strip_tags($data['seo_url']),
	            "main_color" => strip_tags($data['main_color']),
	            "other_color" => strip_tags($data['other_color']),
	            "description" => strip_tags($data['description']),
	            "year" => strip_tags($data['year']),
	            "chassi_id" => strip_tags($data['chassi_id']),
	            "conditions" => strip_tags($data['conditions']),
	            "seats" => strip_tags($data['seats']),
	            "doors" => strip_tags($data['doors']),
	            "passengers" => strip_tags($data['passengers']),
	            "engine_capacity" => strip_tags($data['engine_capacity']),
	            "mileage" => strip_tags($data['mileage']),
	            "fuel_type" => strip_tags($data['fuel_type']),
	            "transmission" => strip_tags($data['transmission']),
	            "drive_type" => strip_tags($data['drive_type']),
	            "auction_grade" => strip_tags($data['auction_grade']),
	            "grade" => strip_tags($data['grade']),
	            "images" => strip_tags($data['images']),
	            "feature_ids" => strip_tags($data['feature_ids']),
	            "is_featured" => strip_tags($data['is_featured']),
	            "status" => strip_tags($data['status']),
	            "is_latest" => strip_tags($data['is_latest']),
	            "updated_at" => strip_tags($data['updated_at']),

		    ], ["id" => strip_tags($data['id'])]);
		}else{
	    	$status = $this->connection->update($this->table_name, [
		        "vehicle_type" => strip_tags($data['vehicle_type']),
	            "vehicle_manufacturer" => strip_tags($data['vehicle_manufacturer']),
	            "vehicle_model" => strip_tags($data['vehicle_model']),
	            "seo_url" => strip_tags($data['seo_url']),
	            "main_color" => strip_tags($data['main_color']),
	            "other_color" => strip_tags($data['other_color']),
	            "description" => strip_tags($data['description']),
	            "year" => strip_tags($data['year']),
	            "chassi_id" => strip_tags($data['chassi_id']),
	            "conditions" => strip_tags($data['conditions']),
	            "seats" => strip_tags($data['seats']),
	            "doors" => strip_tags($data['doors']),
	            "passengers" => strip_tags($data['passengers']),
	            "engine_capacity" => strip_tags($data['engine_capacity']),
	            "mileage" => strip_tags($data['mileage']),
	            "fuel_type" => strip_tags($data['fuel_type']),
	            "transmission" => strip_tags($data['transmission']),
	            "drive_type" => strip_tags($data['drive_type']),
	            "auction_grade" => strip_tags($data['auction_grade']),
	            "grade" => strip_tags($data['grade']),
	            "feature_ids" => strip_tags($data['feature_ids']),
	            "is_featured" => strip_tags($data['is_featured']),
	            "status" => strip_tags($data['status']),
	            "is_latest" => strip_tags($data['is_latest']),
	            "updated_at" => strip_tags($data['updated_at']),
	        ], ["id" => strip_tags($data['id'])]);
	    }

        return $status;
	}

	function updateStatus($status,$id){
		$status = $this->connection->update($this->table_name, [
            "status" => $status
            
        ], ["id" => $id]);
        return $status;
	}

	function delete($id){

		$status = $this->connection->delete($this->table_name, " WHERE id=$id ");
		return $status;
	}

	function selectAll(){

		$data = $this->connection->query("SELECT vehicle.*,vehicle_type.name as vehicle_type,vehicle_manufacturer.name as manu_name, vehicle_model.name as model_name, vehicle_color.name as vehicle_color FROM vehicle,vehicle_type,vehicle_manufacturer,vehicle_model,vehicle_color WHERE vehicle.vehicle_type=vehicle_type.id AND vehicle.vehicle_manufacturer=vehicle_manufacturer.id AND vehicle.vehicle_model=vehicle_model.id AND vehicle.main_color=vehicle_color.id ORDER BY vehicle.id DESC")->fetchAll();
		return $data;
	}

	function selectAllQuery(){
		return "SELECT vehicle.*,vehicle_type.name as vehicle_type,vehicle_manufacturer.name as manu_name, vehicle_model.name as model_name, vehicle_color.name as vehicle_color FROM vehicle,vehicle_type,vehicle_manufacturer,vehicle_model,vehicle_color WHERE vehicle.vehicle_type=vehicle_type.id AND vehicle.vehicle_manufacturer=vehicle_manufacturer.id AND vehicle.vehicle_model=vehicle_model.id AND vehicle.main_color=vehicle_color.id ORDER BY vehicle.id DESC";
	}

	function getById($id){

		$data = $this->connection->query("SELECT vehicle.*,vehicle_type.name as vehicle_type_name,vehicle_manufacturer.name as vehicle_manufacturer_name, vehicle_model.name as vehicle_model_name, vehicle_color.name as vehicle_color FROM vehicle,vehicle_type,vehicle_manufacturer,vehicle_model,vehicle_color WHERE vehicle.id='".$id."' AND vehicle.vehicle_type=vehicle_type.id AND vehicle.vehicle_manufacturer=vehicle_manufacturer.id AND vehicle.vehicle_model=vehicle_model.id AND vehicle.main_color=vehicle_color.id AND vehicle.status=1")->fetchAll();
    	return $data;
	}

	/**libs functions**/
	static function getTransmissionData(){
		return array('Auto', 'Manual','Triptonic');
	}

	static function getCondition(){
		return array('Unregistered','Registered');
	}

	static function getDriveType(){
		return array('Front','Rear','All','Four Wheel');
	}

	static function getFuelType(){
		return array('Diesel','Petrol','Hybrid','Electric');
	}

	static function getIsFeastured(){
		return array('No','Yes');
	}

	static function getIsLatest(){
		return array('No','Yes');
	}

	static function getVehicleStatus(){
		return array('Sold','Available');
	}

	static function makeSeo($text, $limit = 75) {

        $text = preg_replace('~[^\\pL\d]+~u', '-', $text);

        $text = trim($text, '-');

        $text = strtolower($text);

        $text = preg_replace('~[^-\w]+~', '', $text);

        if (empty($text)) {
            return time();
        }
        $text .= '-'.rand(1,100).rand(1,1000);
        return $text;
    }


    /**front end functions**/
    function getFeaturedCarsForHome(){
    	$data = $this->connection->query("SELECT vehicle.*,vehicle_type.name as vehicle_type_name,vehicle_manufacturer.name as vehicle_manufacturer_name, vehicle_model.name as vehicle_model_name, vehicle_color.name as vehicle_color FROM vehicle,vehicle_type,vehicle_manufacturer,vehicle_model,vehicle_color WHERE vehicle.vehicle_type=vehicle_type.id AND vehicle.vehicle_manufacturer=vehicle_manufacturer.id AND vehicle.vehicle_model=vehicle_model.id AND vehicle.main_color=vehicle_color.id AND vehicle.status=1 AND vehicle.is_featured=1 ORDER BY vehicle.id DESC")->fetchAll();
    	return $data;
    }

    function getBySeoUrl($seo_url){

    	$data = $this->connection->query("SELECT vehicle.*,vehicle_type.name as vehicle_type_name,vehicle_manufacturer.name as vehicle_manufacturer_name, vehicle_model.name as vehicle_model_name, vehicle_color.name as vehicle_color FROM vehicle,vehicle_type,vehicle_manufacturer,vehicle_model,vehicle_color WHERE vehicle.seo_url='".$seo_url."' AND vehicle.vehicle_type=vehicle_type.id AND vehicle.vehicle_manufacturer=vehicle_manufacturer.id AND vehicle.vehicle_model=vehicle_model.id AND vehicle.main_color=vehicle_color.id AND vehicle.status=1")->fetchAll();
    	return $data;

    }

    function getSimilarCars($type,$manufacturer,$model,$current_vehicle){ 
    	$data = $this->connection->query("SELECT vehicle.*,vehicle_type.name as vehicle_type,vehicle_manufacturer.name as vehicle_manufacturer_name, vehicle_model.name as vehicle_model_name, vehicle_color.name as vehicle_color FROM vehicle,vehicle_type,vehicle_manufacturer,vehicle_model,vehicle_color WHERE vehicle.vehicle_type=$type AND vehicle.vehicle_manufacturer=$manufacturer AND vehicle.vehicle_model=$model AND vehicle.id <> $current_vehicle AND vehicle.vehicle_type=vehicle_type.id AND vehicle.vehicle_manufacturer=vehicle_manufacturer.id AND vehicle.vehicle_model=vehicle_model.id AND vehicle.main_color=vehicle_color.id AND vehicle.status=1")->fetchAll();
    	// if(count($vehicles)==1){
    	// 	$data[] = $vehicles;
    	// }
    	return $data;
    }

    function getLatestCars(){
    	$data = $this->connection->query("SELECT vehicle.*,vehicle_type.name as vehicle_type_name,vehicle_manufacturer.name as vehicle_manufacturer_name, vehicle_model.name as vehicle_model_name, vehicle_color.name as vehicle_color FROM vehicle,vehicle_type,vehicle_manufacturer,vehicle_model,vehicle_color WHERE vehicle.vehicle_type=vehicle_type.id AND vehicle.vehicle_manufacturer=vehicle_manufacturer.id AND vehicle.vehicle_model=vehicle_model.id AND vehicle.main_color=vehicle_color.id AND vehicle.status=1 ORDER BY vehicle.id DESC LIMIT 5 ")->fetchAll();
    	//$data = $this->connection->select($this->table_name,'*',' ORDER BY id DESC LIMIT 5 ');
    	return $data;
    }

    function getYearsByManufacturer($manufacturer){
    	//$data = $this->connection->debug()->select($this->table_name, 'DISTINCT year', " WHERE vehicle_manufacturer=$manufacturer ORDER BY year DESC ");
    	$data = $this->connection->query("SELECT DISTINCT year FROM $this->table_name WHERE vehicle_manufacturer=$manufacturer ORDER BY year DESC ")->fetchAll();
		return $data;
    }

    function getYearsByManufacturerAndModel($manufacturer,$model){
    	//$data = $this->connection->select($this->table_name, 'DISTINCT year', " WHERE vehicle_manufacturer=$manufacturer AND vehicle_model=$model ORDER BY year DESC ");
    	$data = $this->connection->query("SELECT DISTINCT year FROM $this->table_name WHERE vehicle_manufacturer=$manufacturer AND vehicle_model=$model ORDER BY year DESC ")->fetchAll();
		return $data;
    }

    function getYears(){
    	$data = $this->connection->query("SELECT DISTINCT year FROM $this->table_name ORDER BY year DESC ")->fetchAll();
		return $data;
    }

    function getColoursByManufacturer($manufacturer,$from_year,$to_year){
    	$from_year_set = empty($from_year);
    	$to_year_set = empty($to_year);
    	if(!$from_year_set){
    		$from_year = '';
    	}
    	if(!$to_year_set){
    		$to_year = '';
    	}

    	if($from_year!=''&&$to_year!=''){
    		$where = "AND v.year BETWEEN $from_year AND $to_year";
    	}else if($from_year!=''&&$to_year==''){
    		$where = "AND v.year= $from_year";
    	}else if($from_year==''&&$to_year!=''){
    		$where = "AND v.year= $to_year";
    	}else{
    		$where = '';
    	}
    	$data = $this->connection->query("SELECT DISTINCT c.name as color, c.id FROM $this->table_name as v, vehicle_color as c WHERE v.vehicle_manufacturer=$manufacturer AND v.main_color = c.id $where ORDER BY color DESC ")->fetchAll();
		return $data;
    }

    function getColoursByManufacturerAndModel($manufacturer,$model,$from_year,$to_year){
    	$from_year_set = empty($from_year);
    	$to_year_set = empty($to_year);
    	if(!$from_year_set){
    		$from_year = '';
    	}
    	if(!$to_year_set){
    		$to_year = '';
    	}

    	if($from_year!=''&&$to_year!=''){
    		$where = "AND v.year BETWEEN $from_year AND $to_year";
    	}else if($from_year!=''&&$to_year==''){
    		$where = "AND v.year= $from_year";
    	}else if($from_year==''&&$to_year!=''){
    		$where = "AND v.year= $to_year";
    	}else{
    		$where = '';
    	}
    	$data = $this->connection->query("SELECT DISTINCT c.name as color, c.id FROM $this->table_name as v, vehicle_color as c WHERE v.vehicle_manufacturer=$manufacturer AND v.vehicle_model=$model AND v.main_color = c.id $where ORDER BY color DESC ")->fetchAll();
		return $data;
    }

    function getColours(){
    	$data = $this->connection->query("SELECT DISTINCT c.name as color, c.id FROM $this->table_name as v, vehicle_color as c WHERE v.main_color = c.id ORDER BY color DESC ")->fetchAll();
		return $data;
    }

    function searchVehicles($manufacturer='',$model='',$from_year='',$to_year='',$color='',$type=''){

    	$where = '';
    	if($type != ''){
    		$where .= " vehicle.vehicle_type=$type AND ";
    	}
    	if($manufacturer != ''){
    		$where .= " vehicle.vehicle_manufacturer=$manufacturer AND ";
    	}
    	if($model != ''){
    		$where .= " vehicle.vehicle_model=$model AND ";
    	}
    	if($from_year != ''&& $to_year !=''){
    		$where .= " vehicle.year BETWEEN $from_year AND $to_year AND ";//" vehicle.year=$year AND ";
    	}else if ($from_year != ''&& $to_year =='') {
    		$where .= " vehicle.year=$from_year AND ";
    	}else if ($from_year == ''&& $to_year !='') {
    		$where .= " vehicle.year=$to_year AND ";
    	}
    	if($color !=''){
    		$where .= " vehicle.main_color=$color AND ";
    	}
    	$data = $this->connection->query("SELECT vehicle.*,vehicle_type.name as vehicle_type,vehicle_manufacturer.name as vehicle_manufacturer_name, vehicle_model.name as vehicle_model_name, vehicle_color.name as vehicle_color FROM vehicle,vehicle_type,vehicle_manufacturer,vehicle_model,vehicle_color WHERE $where vehicle.vehicle_type=vehicle_type.id AND vehicle.vehicle_manufacturer=vehicle_manufacturer.id AND vehicle.vehicle_model=vehicle_model.id AND vehicle.main_color=vehicle_color.id AND vehicle.status=1")->fetchAll();
    	return $data;

    }

    function searchVehiclesQuery($manufacturer='',$model='',$from_year='',$to_year='',$color='',$type=''){

    	try{
	    	$where = '';
	    	if($type != ''){
	    		$where .= ' vehicle.vehicle_type='.$type .' AND ';
	    	}
	    	if($manufacturer != ''){
	    		$where .= ' vehicle.vehicle_manufacturer='.$manufacturer .' AND ';
	    	}
	    	if($model != ''){
	    		$where .= ' vehicle.vehicle_model='.$model .' AND ';
	    	}
	    	if($from_year != ''&& $to_year !=''){
    		$where .= " vehicle.year BETWEEN $from_year AND $to_year AND ";//" vehicle.year=$year AND ";
	    	}else if ($from_year != ''&& $to_year =='') {
	    		$where .= " vehicle.year=$from_year AND ";
	    	}else if ($from_year == ''&& $to_year !='') {
	    		$where .= " vehicle.year=$to_year AND ";
	    	}
	    	if($color !=''){
	    		$where .= " vehicle.main_color=$color AND ";
	    	}
	    	return "SELECT vehicle.*,vehicle_type.name as vehicle_type,vehicle_manufacturer.name as vehicle_manufacturer_name, vehicle_model.name as vehicle_model_name, vehicle_color.name as vehicle_color FROM vehicle,vehicle_type,vehicle_manufacturer,vehicle_model,vehicle_color WHERE $where vehicle.vehicle_type=vehicle_type.id AND vehicle.vehicle_manufacturer=vehicle_manufacturer.id AND vehicle.vehicle_model=vehicle_model.id AND vehicle.main_color=vehicle_color.id AND vehicle.status=1";
	    }catch(Error $err) {
	      echo "catched: ", $err->getMessage(), PHP_EOL;
	    }
    	
    }

}

?>
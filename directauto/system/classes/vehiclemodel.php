<?php 

require_once DOC_ROOT.'vendor/autoload.php';

use Medoo\Medoo;

class VehicleModel
{
	private $table_name = "vehicle_model";
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
            "name" => strip_tags($data['name']),
            "manufacturer_id" => strip_tags($data['manufacturer_id']),
            "status" => strip_tags($data['status'])        
        ]);

        return $status;
	}

	function update($data){
	
	    $status = $this->connection->update($this->table_name, [
	        "name" => strip_tags($data['name']),
            "manufacturer_id" => strip_tags($data['manufacturer_id']),
            "status" => strip_tags($data['status']),     
	        "updated_at" => strip_tags($data['updated_at'])
	    ], ["id" => strip_tags($data['id'])]);

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

		$data = $this->connection->query("SELECT mo.*,ma.name as manufacturer_name,ma.image FROM $this->table_name as mo, vehicle_manufacturer as ma WHERE mo.manufacturer_id=ma.id ORDER BY mo.id DESC")->fetchAll();
		return $data;
	}

	function selectAllQuery(){
		return "SELECT mo.*,ma.name as manufacturer_name,ma.image FROM $this->table_name as mo, vehicle_manufacturer as ma WHERE mo.manufacturer_id=ma.id ORDER BY mo.id DESC";
	}

	function getById($id){

		$data = $this->connection->select($this->table_name, '*', " WHERE id=$id ");
		return $data;
	}

	function getByManufacturer($manufacturer_id){
		$data = $this->connection->select($this->table_name, '*', " WHERE manufacturer_id=$manufacturer_id ");
		return $data;
	}

	function selectAllActive(){

		$data = $this->connection->query("SELECT mo.*,ma.name as manufacturer_name,ma.image FROM $this->table_name as mo, vehicle_manufacturer as ma WHERE mo.manufacturer_id=ma.id AND mo.status=1 ORDER BY mo.id DESC")->fetchAll();
		return $data;
	}
}

?>
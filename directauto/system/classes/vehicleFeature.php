<?php 

require_once DOC_ROOT.'vendor/autoload.php';

use Medoo\Medoo;

class vehicleFeature
{
	private $table_name = "vehicle_feature";
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
            "image" => strip_tags($data['image']),
            "status" => strip_tags($data['status'])        
        ]);

        return $status;
	}

	function update($data){
	
	    if(strip_tags($data['image']) !=''){
		    $status = $this->connection->update($this->table_name, [
		        "name" => strip_tags($data['name']),
	            "image" => strip_tags($data['image']),
	            "status" => strip_tags($data['status']),      
		        "updated_at" => strip_tags($data['updated_at'])
		    ], ["id" => strip_tags($data['id'])]);
		}else{
			$status = $this->connection->update($this->table_name, [
		        "name" => strip_tags($data['name']),
	            "status" => strip_tags($data['status']),      
		        "updated_at" => strip_tags($data['updated_at'])
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

		$data = $this->connection->select($this->table_name, '*', ' ORDER BY id DESC');
		return $data;
	}

	function selectAllQuery(){
		return "SELECT * FROM $this->table_name";
	}

	function getById($id){

		$data = $this->connection->select($this->table_name, '*', " WHERE id=$id ");
		return $data;
	}

	function selectAllActive(){

		$data = $this->connection->select($this->table_name, '*', 'WHERE status=1 ORDER BY name ASC');
		return $data;
	}

}

?>
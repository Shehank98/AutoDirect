<?php 

require_once DOC_ROOT.'vendor/autoload.php';

use Medoo\Medoo;

class LiveInquiry
{
	private $table_name = "live_inquiries";
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
            "customer_id" => strip_tags($data['customer_id']),
            "make" => strip_tags($data['make']),
            "model" => strip_tags($data['model']),
            "year" => strip_tags($data['year']),
            "color" => strip_tags($data['color']),
            "created_at" => strip_tags($data['created_at'])
        ]);

        return $status;
	}

	function update($data){
		

		
    	$status = $this->connection->update($this->table_name, [
            "customer_id" => strip_tags($data['customer_id']),
            "make" => strip_tags($data['make']),
            "model" => strip_tags($data['model']),
            "year" => strip_tags($data['year']),
            "color" => strip_tags($data['color']),
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

		$data = $this->connection->query("SELECT li.*,c.name,c.email,c.phone FROM $this->table_name as li, customers as c WHERE li.customer_id=c.id ORDER BY li.id DESC")->fetchAll();
		return $data;
	}

	function selectAllQuery(){
		return "SELECT li.*,c.name,c.email,c.phone FROM $this->table_name as li, customers as c WHERE li.customer_id=c.id ORDER BY li.id DESC";
	}

	function getById($id){

		$data = $this->connection->select($this->table_name, '*', " WHERE id=$id ");
		return $data;
	}

	function selectAllByCustomerId($customer_id){
		$data = $this->connection->select($this->table_name, '*', " WHERE customer_id=$customer_id ORDER BY id DESC");
		return $data;
	}

	function selectLatestByCustomerId($customer_id){
		$data = $this->connection->select($this->table_name, '*', " WHERE customer_id=$customer_id ORDER BY id DESC limit 0,5");
		return $data;
	}
	

}

?>
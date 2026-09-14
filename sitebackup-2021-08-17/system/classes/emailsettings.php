<?php 

   require_once DOC_ROOT.'vendor/autoload.php';

   require_once '../config.php';
	

	session_start();
	

	$date = date("Y-m-d H:i:s");
	
	require "../../mail/class.phpmailer.php";
	require "../../mail/class.smtp.php";

use Medoo\Medoo;

class Emailsettings
{
	private $table_name = "email_templates";
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
	

	
	function selectAll(){

		$data = $this->connection->select($this->table_name, '*', ' ORDER BY id DESC');
		return $data;
	}

	function selectAllQuery(){
		return "SELECT * FROM $this->table_name ORDER BY id DESC";
	}

	function getById($id){

		$data = $this->connection->select($this->table_name, '*', " WHERE id=$id ");
		return $data;
	}

	

	 function replaceValues($values, $text) {

            foreach ($values as $key => $val) {
                  $text = str_replace("{" . $key . "}", $val, $text);
            }

            return $text;
      }

   function sendEmail($data){


    $myArray = $data['arr'];

	//$myArray = json_decode($arr, true);

	$tempid = $data['temp_id'];
	$title = $data['title'];
	$AddAddress = $data['AddAddress'];
	$AddCC = $data['AddCC'];
	$AddBCC = $data['AddBCC'];

	$email = new Emailsettings();
	$email_data = $email->getById($tempid);
	$email_body = $email_data[0]['body'];
	$emai_subject = $email_data[0]['subject'];
   

	$output = $email->replaceValues($myArray,$email_body);

	 

	
			$title = $title;
			$subject = $emai_subject;	
			$msg = $output;

        	
		
			$mail  = new PHPMailer();
			$mail->IsSMTP();
			$mail->SMTPAuth   = true;       // enable SMTP authentication
			$mail->SMTPSecure = "ssl";     // sets the prefix to the servier
			$mail->Host       = 'secure227.servconfig.com';//'localhost';      // sets GMAIL as the SMTP server 
			$mail->Port       = '465';//'465';     // set the SMTP port
			
			$mail->Username   = 'system@akila.codeplait.net';//'system@test.universalappserver.com';  // GMAIL username 
			$mail->Password   = '6H,%x4n2T}*J'; // GMAIL password 
			
			$mail->From       = 'system@akila.codeplait.net';//'system@test.universalappserver.com'; // 
			$mail->FromName   = $title;
			$mail->Subject    = $subject;
			$mail->WordWrap   = 50; // set word wrap
			
			$mail->MsgHTML($msg);
			
			$mail->AddAddress($AddAddress);

			if (!empty($AddCC)) {
				$mail->AddCC($AddCC);
			}

			if (!empty($AddBCC)) {

				$mail->AddBCC($AddBCC);
			}

		    		
		    
			
			$mail->IsHTML(true); // send as HTML
			//echo $msg;
			if($mail->Send()){
			//	echo "200";
				
			}else{
				//echo 'Message was not sent.';
               // echo 'Mailer error: ' . $mail->ErrorInfo;
			}



      }

	

}

?>
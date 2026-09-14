<?php 

require_once DOC_ROOT.'vendor/autoload.php';

use Medoo\Medoo;

class Emails
{
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

	function getHeader($subject){

		$header = '<style>
				    @import url(http://fonts.googleapis.com/css?family=Merienda);
				   /* All your usual CSS here */
				</style>
				<table width="100%" border="0" cellpadding="0" cellspacing="0" class="BGtable" background="images/bg.gif" style="font-size: 12px; font-weight: 400; margin: 0; border-collapse: collapse; -webkit-text-size-adjust: none; background-color: #e1e1e1; background-repeat: repeat; font-family: Tahoma,Helvetica Neue,Arial,sans-serif; padding: 0; height: 100% !important; background-image: url(images/bg.gif); width: 100% !important;" bgcolor="#e1e1e1">
				<tbody>
					<tr>
						<td>
							<div style="padding:30px;margin:0px">
								<table width="600" cellspacing="0" cellpadding="0" bgcolor="#fff" align="center" name="tid">
								<tbody>
				                	
									<tr>
										<td style="padding:15px 0px 0px 0px">
											<table width="100%" cellspacing="0" cellpadding="0" border="0">
												<tbody>
													<tr>
														<td valign="top" align="center" style="padding:0px 20px 15px 20px;color:#993300"><span name="tid" align="center"></span></td>
													</tr>
													<tr>
														<td valign="top" bgcolor="#F4F2F3" align="center" name="tid" style=" color:#0A2E00;padding:15px 20px"><div align="center"><span name="tid"><strong>'.$subject.'</strong></span></div></td>
													</tr>
				                                    
												</tbody>
											</table>
										</td>
									</tr>';

		return $header;
	}

	function getFooter(){

		$footer = 			'<tr>
								<td>
									<table width="100%" cellspacing="0" bgcolor="#18428c" cellpadding="0" border="0" style="padding:5px 30px;color:#aea48b;font-size:10px">
										<tbody>
											<tr>
												<td width="100%">
													<p align="center" style="color:#fff;">
														Web : <a style="color:#fff" href="http://directautoimport.lk/">directautoimport.lk</a> &nbsp; &nbsp; &nbsp; 
													</p>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
						</table>
					</div>
				</td>
			</tr>
		</tbody>
		</table>';

		return $footer;
	}

	function createCustomerRegistrationBody($data){

		$body = 	'<tr>
						<td style="padding:0px 0px">
							<table width="100%" cellspacing="20" cellpadding="0" border="0"  bgcolor="#ffffff">
								<tbody>
								<tr>
									<td valign="top" align="center" style="padding:0px">';
		
										
									
		$body .=					  '<table width="100%" cellspacing="0" cellpadding="0" border="0" sel style="margin-top:10px;float:left;font-size:12px;color:#333;">
										<tbody>
											<tr><td colspan="3"><h3>Dear '.$data['name'].', </h3></td></tr>
											<tr><td colspan="3"><h5>Thank You for registering with <a href="http://directautoimport.lk/">directautoimport.lk</a> </h5></td></tr>
											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">Your Name</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">'.$data['name'].'</td>
											</tr>
											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">Email Address/Username</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">'.$data['email'].'</td>
											</tr>
											
											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">Password</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">'.$data['password'].'</td>
											</tr>
										</tbody>
								  </table>';
								  
            $body .=             '</td>
								</tr>
                                <tr>
                                    <td>
                                    </td>
                                </tr>
								</tbody>
							</table>
						</td>
					</tr>';

		return $body;


	}
	
	function createVehilceInquiryBody($data){

		$body = 	'<tr>
						<td style="padding:0px 0px">
							<table width="100%" cellspacing="20" cellpadding="0" border="0"  bgcolor="#ffffff">
								<tbody>
								<tr>
									<td valign="top" align="center" style="padding:0px">';
												
									
		$body .=					  '<table width="100%" cellspacing="0" cellpadding="0" border="0" sel style="margin-top:10px;float:left;font-size:12px;color:#333;">
										<tbody>
											<tr><td colspan="3"><h3>'.$data['vehicle_name'].'</h3></td></tr>
											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">Vehicle ID </td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">'.$data['vehicle_id'].'</td>
											</tr>
											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">URL </td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;"><a href="'.$data['url'].'">'.$data['url'].'</a></td>
											</tr>
											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">Customer\'s Name</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">'.$data['name'].'</td>
											</tr>
											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">Customer\'s Email</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">'.$data['email'].'</td>
											</tr>
											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">Customer\'s Phone</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">'.$data['phone'].'</td>
											</tr>
											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">Customer\'s Message</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">'.$data['message'].'</td>
											</tr>
											
											
										</tbody>
								  </table>';
								  
            $body .=             '</td>
								</tr>
                                <tr>
                                    <td>
                                    </td>
                                </tr>
								</tbody>
							</table>
						</td>
					</tr>';

		return $body;


	}

	function createNewsletterSubscriptionBody($data){

		$body = 	'<tr>
						<td style="padding:0px 0px">
							<table width="100%" cellspacing="20" cellpadding="0" border="0"  bgcolor="#ffffff">
								<tbody>
								<tr>
									<td valign="top" align="center" style="padding:0px">';
												
									
		$body .=					  '<table width="100%" cellspacing="0" cellpadding="0" border="0" sel style="margin-top:10px;float:left;font-size:12px;color:#333;">
										<tbody>
											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">Customer\'s Name </td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">'.$data['newsletter_name'].'</td>
											</tr>
											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">Customer\'s Email </td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">'.$data['newsletter_email'].'</td>
											</tr>
											
										</tbody>
								  </table>';
								  
            $body .=             '</td>
								</tr>
                                <tr>
                                    <td>
                                    </td>
                                </tr>
								</tbody>
							</table>
						</td>
					</tr>';

		return $body;


	}

	function createContactFormSubmissionBody($data){

		$body = 	'<tr>
						<td style="padding:0px 0px">
							<table width="100%" cellspacing="20" cellpadding="0" border="0"  bgcolor="#ffffff">
								<tbody>
								<tr>
									<td valign="top" align="center" style="padding:0px">';
												
									
		$body .=					  '<table width="100%" cellspacing="0" cellpadding="0" border="0" sel style="margin-top:10px;float:left;font-size:12px;color:#333;">
										<tbody>
											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">Customer\'s Name </td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">'.$data['name'].'</td>
											</tr>
											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">Customer\'s Email </td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">'.$data['email'].'</td>
											</tr>

											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">Customer\'s Phone </td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">'.$data['phone'].'</td>
											</tr>

											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">Customer\'s Message </td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">'.$data['message'].'</td>
											</tr>
											
										</tbody>
								  </table>';
								  
            $body .=             '</td>
								</tr>
                                <tr>
                                    <td>
                                    </td>
                                </tr>
								</tbody>
							</table>
						</td>
					</tr>';

		return $body;


	}

	function createLiveInquiryBody($data){
		$body = 	'<tr>
						<td style="padding:0px 0px">
							<table width="100%" cellspacing="20" cellpadding="0" border="0"  bgcolor="#ffffff">
								<tbody>
								<tr>
									<td valign="top" align="center" style="padding:0px">';
												
									
		$body .=					  '<table width="100%" cellspacing="0" cellpadding="0" border="0" sel style="margin-top:10px;float:left;font-size:12px;color:#333;">
										<tbody>
											
											
											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">Customer\'s Name</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">'.$data['name'].'</td>
											</tr>
											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">Customer\'s Email</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">'.$data['email'].'</td>
											</tr>
											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">Customer\'s Phone</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">'.$data['phone'].'</td>
											</tr>
											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">Make</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">'.$data['make'].'</td>
											</tr>
											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">Model</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">'.$data['model'].'</td>
											</tr>
											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">Year</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">'.$data['year'].'</td>
											</tr>
											<tr>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">Color</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">:</td>
												<td style="padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #dddddd;">'.$data['color'].'</td>
											</tr>
											
											
										</tbody>
								  </table>';
								  
            $body .=             '</td>
								</tr>
                                <tr>
                                    <td>
                                    </td>
                                </tr>
								</tbody>
							</table>
						</td>
					</tr>';

		return $body;
	}

	function sendEmail($subject,$body,$to,$cc='',$bcc=''){

		require_once DOC_ROOT.'system/classes/mail/class.phpmailer.php';
		require_once DOC_ROOT.'system/classes/mail/class.smtp.php';
		
			
		$address_arr		 = $to; //echo 'ad';print_r($address_arr);
		$address_cc_arr		 = $cc;// echo 'bcc';print_r($address_cc_arr);
		$address_bcc_arr	 = $bcc;// echo 'cc';print_r($address_bcc_arr);

		$header = $this->getHeader($subject);
		$footer = $this->getFooter();

		$msg = $header.$body.$footer;

		$mail  = new PHPMailer();
		$mail->IsSMTP();
		
		$mail  = new PHPMailer();
		$mail->IsSMTP();
		$mail->SMTPAuth   = true;       // enable SMTP authentication
		$mail->SMTPSecure = "ssl";     // sets the prefix to the servier
		$mail->Host       = 'secure227.servconfig.com';//'localhost';      // sets GMAIL as the SMTP server 
		$mail->Port       = '465';//'465';     // set the SMTP port
		
		$mail->Username   = 'system@akila.codeplait.net';//'system@test.universalappserver.com';  // GMAIL username 
		$mail->Password   = '6H,%x4n2T}*J'; // GMAIL password 
		
		$mail->From       = 'system@akila.codeplait.net';//'system@test.universalappserver.com'; // 
		$mail->FromName   = 'Directautoimport.lk';
		$mail->Subject    = $subject;
		$mail->WordWrap   = 50; // set word wrap
		
		$mail->MsgHTML($msg); 
		/*
		* Email Receivers Addresses
		*/
		foreach($address_arr as $address){
			$mail->AddAddress($address);
		}
		$mail->AddAddress('dinushiakila@gmail.com');
		/*
		* Email Receivers CC Addresses
		*/
		if(count($address_cc_arr)>0){
			foreach($address_cc_arr as $address){
				$mail->AddCC($address);
			}
		}
		
		/*
		* Email Receivers BCC Addresses
		*/
		if(count($address_bcc_arr)>0){
			foreach($address_cc_arr as $address){
				$mail->AddBCC($address);
			}
		}
		
		$mail->IsHTML(true); // send as HTML
		//print_r($mail);
		//echo $msg;
		if($mail->Send()){
			return "200";
			//echo $subject;
			//echo $_REQUEST['name'].$_REQUEST['phone'].$_REQUEST['email'].$_REQUEST['message'];
		}else{
			return "400";
		}

	}

	
}

?>
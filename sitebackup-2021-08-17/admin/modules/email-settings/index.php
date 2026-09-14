<?php 

require_once '../system/config.php';
$yes_no = EmailSettings::yesNo();
$smtp_types = EmailSettings::smtpTypes();

$email_settings = new EmailSettings();
$data = $email_settings->selectAll();
?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="icon" type="image/png" sizes="16x16" href="images/favicon.png">
	<title>Email Settings | Server Renewal</title>
	
	<?php include(DOC_ROOT.'includes/head.php'); ?>
	
</head>
<body class="fix-header">
    <!-- ============================================================== -->
    <!-- Wrapper -->
    <!-- ============================================================== -->
    <div id="wrapper">

		<?php include(DOC_ROOT.'includes/header.php') ?>

		<?php include(DOC_ROOT.'includes/sidebar.php') ?>

		<div id="page-wrapper">
            <div class="container-fluid">
            	<div class="row bg-title">
                    <div class="col-lg-3 col-md-4 col-sm-4 col-xs-12">
                        <h4 class="page-title">Email Settings</h4> </div>
                    <div class="col-lg-9 col-sm-8 col-md-8 col-xs-12">
                        <ol class="breadcrumb">
                            <li><a href="<?php echo SITE_URL; ?>">Dashboard</a></li>
                            <li class="active">Email Settings</li>
                        </ol>
                    </div>
                </div>

				<div class="row">
					<div class="col-sm-12">
                        <div class="white-box">
							<h3 class="box-title">Add/Update Email Settings</h3>
							
							<div class="clearfix"></div>
							<div class="margin-top-10">
								<form class="form-horizontal" id="add_form">
										<div class="form-group">
										  <label class="col-md-2 control-label" for="is_smtp">Is SMTP</label>
										  <div class="col-md-10">
										    <select id="is_smtp" name="is_smtp" class="form-control">
										    <?php foreach ($yes_no as $key => $value) { ?>
										    	<option value="<?php echo $key; ?>" <?php echo ($data[0]['is_smtp']==$key)? 'selected':''; ?>><?php echo $value; ?></option>
										    <?php } ?>
										    </select>
										  </div>
										</div>
										<!-- Text input-->
										<div class="form-group">
										  <label class="col-md-2 control-label" for="smtp_host">SMTP Host</label>  
										  <div class="col-md-10">
										  <input id="smtp_host" name="smtp_host" type="text" placeholder="Enter SMTP host" value="<?php echo $data[0]['smtp_host']; ?>" class="form-control input-md">
										  </div>
										</div>

										<!-- Text input-->
										<div class="form-group">
										  <label class="col-md-2 control-label" for="smtp_port">SMTP Port</label>  
										  <div class="col-md-10">
										  <input id="smtp_port" name="smtp_port" type="text" placeholder="Enter SMTP Port" value="<?php echo $data[0]['smtp_port']; ?>" class="form-control input-md">
										  </div>
										</div>

										<!-- Text input-->
										<div class="form-group">
										  <label class="col-md-2 control-label" for="smtp_mailport">SMTP Port(TLS/SSL)</label>  
										  <div class="col-md-10">
										  <input id="smtp_mailport" name="smtp_mailport" type="text" placeholder="Enter SMTP Port(TLS/SSL)" value="<?php echo $data[0]['smtp_mailport']; ?>" class="form-control input-md">
										  </div>
										</div>

										<div class="form-group">
										  <label class="col-md-2 control-label" for="smtp_authentication">SMTP Authentication</label>
										  <div class="col-md-10">
										    <select id="smtp_authentication" name="smtp_authentication" class="form-control">
										    <?php foreach ($yes_no as $key => $value) { ?>
										    	<option value="<?php echo $key; ?>" <?php echo ($data[0]['smtp_authentication']==$key)? 'selected':''; ?>><?php echo $value; ?></option>
										    <?php } ?>
										    </select>
										  </div>
										</div>

										<!-- Text input-->
										<div class="form-group">
										  <label class="col-md-2 control-label" for="smtp_username">SMTP Username</label>  
										  <div class="col-md-10">
										  <input id="smtp_username" name="smtp_username" type="text" placeholder="Enter Username" value="<?php echo $data[0]['smtp_username']; ?>" class="form-control input-md">
										  </div>
										</div>

										<!-- Text input-->
										<div class="form-group">
										  <label class="col-md-2 control-label" for="smtp_password">SMTP Password<br><small>(keep this field empty to use the existing password)</small></label>  
										  <div class="col-md-10">
										  <input id="smtp_password" name="smtp_password" type="text" placeholder="Enter Password" class="form-control input-md">
										  </div>
										</div>

										<div class="form-group">
										  <label class="col-md-2 control-label" for="smtp_type">SMTP Type</label>
										  <div class="col-md-10">
										    <select id="smtp_type" name="smtp_type" class="form-control">
										    <?php foreach ($smtp_types as $key => $value) { ?>
										    	<option value="<?php echo $key; ?>" <?php echo ($data[0]['smtp_type']==$key)? 'selected':''; ?>><?php echo $value; ?></option>
										    <?php } ?>
										    </select>
										  </div>
										</div>
                                        <hr>
                                       <h5 class="box-sub-title">Email Receivers Details</h5><br/><br/>
                                        <!-- Text input-->
										<div class="form-group">
										  <label class="col-md-2 control-label" for="address">Add Address<br><small>Seperate each email address by comma(,)</small></label>  
										  <div class="col-md-10">
										  <input id="address" name="address" type="text" placeholder="john.doe@hotmail.com,jane@hotmail.com" value="<?php echo $data[0]['address']; ?>" class="form-control input-md">
										  </div>
										</div>
                                        
                                         <!-- Text input-->
										<div class="form-group">
										  <label class="col-md-2 control-label" for="address_cc">Add CC<br><small>Seperate each email address by comma(,)</small></label>  
										  <div class="col-md-10">
										  <input id="address_cc" name="address_cc" type="text" placeholder="john.doe@hotmail.com,jane@hotmail.com" value="<?php echo $data[0]['address_cc']; ?>" class="form-control input-md">
										  </div>
										</div>
                                        
                                         <!-- Text input-->
										<div class="form-group">
										  <label class="col-md-2 control-label" for="address_bcc">Add BCC<br><small>Seperate each email address by comma(,)</small></label>  
										  <div class="col-md-10">
										  <input id="address_bcc" name="address_bcc" type="text" placeholder="john.doe@hotmail.com,jane@hotmail.com" value="<?php echo $data[0]['address_bcc']; ?>" class="form-control input-md">
										  </div>
										</div>

										<div class="form-group">
										  <div class="col-md-12">
											<button class="btn btn-success pull-right" type="submit" id="submit_btn">Save</button>					    
										  </div>
										</div>

								</form>

							</div>
							<div class="clearfix">
							
					</div>
					<div id="form_submit_msg"></div>
				</div>
			</div>

			<footer class="footer text-center"> <?php echo date('Y'); ?> &copy; Neo@ogilvy </footer>
		</div>
	</div>

	<?php include(DOC_ROOT.'includes/footer.php'); ?>


<!-- Validate js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.16.0/jquery.validate.js"></script> 
<script type="text/javascript">
    $(document).ready(function(){
        
        
        $("#add_form").validate({
            rules: {
                smtp_host: {required: true},
                smtp_username: {required: true},
                address: {required: true},
            },
            messages: {
                smtp_host: "<p class='text-danger'>Please enter SMTP Host</p>",
                smtp_username: "<p class='text-danger'>Please enter SMTP Username</p>",
                address: "<p class='text-danger'>Please enter email addresses</p>",
                
            },
            submitHandler: function () {

              var url_data = $('#add_form').serialize();
              url_data += "&action=store"; console.log(url_data);

              $.ajax({
                 type: 'POST',
                 url: '../system/controllers/email_settings_controller.php',
                 data: url_data,
                 success: function(res) {
                    $('#form_submit_msg').show(); console.log(res);
                    if($.trim(res)==200){
                      //clearFormFieldsFront("#add_form");
                      showFrontFormMessage('#form_submit_msg','success',{message:'Successfully Saved'});
                      //$('#form_submit_msg').html('<p class="alert alert-success"> Successfully Added</p>');
                    }else{
                    	showFrontFormMessage('#form_submit_msg','error',{message:'Something wrong. Please try again'});
                      //$('#form_submit_msg').html('<p class="alert alert-danger"> Something wrong. Please try again</p>');
                    }
                    //$('#form_submit_msg').hide(3000);
                 },
              });
        
            }

        });          
    });

    
    </script>

    </body>
</html>
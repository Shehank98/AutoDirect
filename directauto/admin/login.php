<?php 
require_once '../system/config.php';
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

	<title>Login | Internal System</title>
    
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
    <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="css/form-elements.css">
    <link rel="stylesheet" href="css/style-login.css">
    
    
    
</head>
<body class="fix-header">
    <!-- ============================================================== -->
    <!-- Wrapper -->
    <!-- ============================================================== -->
    <div id="wrapper">

		<!-- ============================================================== -->
        <!-- Page Content -->
        <!-- ============================================================== -->

        <!-- Top content -->
        <div class="top-content">
            
            <div class="inner-bg">
                <div class="container">
                    <div class="row">
                        <div class="col-sm-6 col-sm-offset-3 login-logo-wrapper">
                            <div class="logo"><img class="img-responsive text-center" src="<?php echo SITE_URL; ?>images/logo.jpg"></div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-6 col-sm-offset-3 form-box">
                            <div class="form-top">
                                <div class="form-top-left">
                                    <h3>JPN Car Auction</h3>
                                    <p>Administrator Login</p>
                                </div>
                                <div class="form-top-right">
                                    <i class="fa fa-lock"></i>
                                </div>
                            </div>
                            <div class="form-bottom">
                                <form role="form" id="login_form" method="post" class="login-form">
                                    <div class="form-group">
                                        <label class="sr-only" for="username">Username</label>
                                        <input type="text" name="username" placeholder="Username..." class="form-username form-control" id="username">
                                    </div>
                                    <div class="form-group">
                                        <label class="sr-only" for="password">Password</label>
                                        <input type="password" name="password" placeholder="Password..." class="form-password form-control" id="password">
                                    </div>
                                    <button type="submit" class="btn">Sign in!</button>
                                </form>
                            </div>
                            <div id="form_submit_msg"></div>
                        </div>
                    </div>
                    
                </div>
            </div>
            
        </div>
           
                
               
            </div>
            
	</div>

	<?php include(DOC_ROOT.'admin/includes/footer.php'); ?>
    <script src="js/jquery.backstretch.min.js"></script>

    <script type="text/javascript">
        
        $(document).ready(function() {
    
            $.backstretch("images/backgrounds/1.jpg");
    
        });
    </script>

    <!-- Validate js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.16.0/jquery.validate.js"></script> 
<script type="text/javascript">
    $(document).ready(function(){
        
        
        $("#login_form").validate({
            rules: {
                username: {required: true},
                password: {required: true},
            },
            messages: {
                username: "<p class='text-danger'>Please enter username</p>",
                password: "<p class='text-danger'>Please enter password</p>",
                
            },
            submitHandler: function () {

              var url_data = $('#login_form').serialize();
              url_data += "&action=login"; console.log(url_data);

              $.ajax({
                 type: 'POST',
                 url: '../system/controllers/users_controller.php',
                 data: url_data,
                 success: function(res) {
                    $('#form_submit_msg').show(); console.log(res);
                    if($.trim(res)==200){
                      clearFormFieldsFront("#login_form");
                      showFrontFormMessage('#form_submit_msg','success',{message:'Login Success. Redirecting.....'});
                      setTimeout(function(){ window.location.href= '<?php echo SITE_URL ?>admin/'},3000);
                      //$('#form_submit_msg').html('<p class="alert alert-success"> Successfully Added</p>');
                    }else{
                        showFrontFormMessage('#form_submit_msg','error',{message:'Username or Password is incorrect'});
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
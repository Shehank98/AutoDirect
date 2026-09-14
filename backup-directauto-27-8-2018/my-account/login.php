<?php require_once('../system/config.php'); ?>
<?php 
$live_auction_redirect = false;
if($_GET['live_auction']){
  $live_auction_redirect = true;
}
?>
<!DOCTYPE HTML>
<html lang="en">

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="keywords" content="">
<meta name="description" content="">
<title>Car Auction - Login</title>
<?php include(DOC_ROOT.'includes/header.php'); ?>

<!--Page Header-->
<section class="page-header">
  <div class="container">
    <div class="page-header_wrap">
      <div class="page-heading">
        <h1>Login</h1>
      </div>
      <ul class="coustom-breadcrumb">
        <li><a href="#">Home</a></li>
        <li>Login</li>
      </ul>
    </div>
  </div>
  <!-- Dark Overlay-->
  <div class="dark-overlay"></div>
</section>
<!-- /Page Header--> 

<!--Contact-us-->
<section class="contact_us section-padding">
  <div class="container">
    <div class="row">
          <div class="login_wrap">
            <div class="col-md-6 col-sm-6">
              <h3>Login</h3>
              <form method="post" name="login_form" id="login_form">
                <div class="form-group">
                  <input type="text" class="form-control" name="email" id="email" placeholder="Username or Email address*">
                </div>
                <div class="form-group">
                  <input type="password" class="form-control" name="password" id="password" placeholder="Password*">
                </div>
                <!-- <div class="form-group checkbox">
                  <input type="checkbox" id="remember">
                  <label for="remember">Remember Me</label>
                </div> -->
                <div class="form-group">
                  <input type="submit" id="submit_btn" value="Login" class="btn btn-block">
                </div>
                <div id="form_submit_msg"></div>
              </form>
            </div>
            <div class="col-md-6 col-sm-6">
              <h6 class="gray_text">Don't have an account?</h6>
              <p>It's free and always will be.</p>
              <div class="text-center">
                <div class="form-group">
                  <?php if ($live_auction_redirect) { ?>
                  <button type="button" id="register" value="Register" onclick="window.location.href = http_path + 'my-account/register.php?live_auction=true'" class="btn btn-block">Signup Here</button>
                  <?php }else{ ?> 
                   <button type="button" id="register" value="Register" onclick="window.location.href = http_path + 'my-account/register.php'" class="btn btn-block">Signup Here</button>
                  <?php } ?>
                </div>
              
             <!--  <p>Don't have an account? <a href="<?php echo SITE_URL; ?>my-account/register.php">Signup Here</a></p> -->
              <!-- <p><a href="#forgotpassword" data-toggle="modal" data-dismiss="modal">Forgot Password ?</a></p> -->
            </div>
              <!-- <a href="#" class="btn btn-block facebook-btn"><i class="fa fa-facebook-square" aria-hidden="true"></i> Login with Facebook</a> --><!--  <a href="#" class="btn btn-block twitter-btn"><i class="fa fa-twitter-square" aria-hidden="true"></i> Login with Twitter</a> <a href="#" class="btn btn-block googleplus-btn"><i class="fa fa-google-plus-square" aria-hidden="true"></i> Login with Google+</a>  --></div>
            <div class="mid_divider"></div>
          </div>
        </div>

        
  </div>
</section>
<!-- /Contact-us--> 

<?php include(DOC_ROOT.'includes/footer.php'); ?>

<script type="text/javascript">
    $(document).ready(function(){
        
        
        $("#login_form").validate({
            rules: {
                email: {
                    required: true,
                    email: true,
                },
                password: {
                    required: true,
                }
                
            },
            messages: {
                email:{
                    required: "<span class='text-danger'>Please enter email address.</span>",
                    email: "<span class='text-danger'>Please enter a valid email address.</span>",
                },
                password: {
                    required: "<span class='text-danger'>Please enter your password.</span>",
                }
                
            },
            submitHandler: function () {

              var url_data = $('#login_form').serialize(); console.log(url_data);

              $('#submit_btn').attr('disabled','disabled');
              $("#submit_btn").val('Please Wait...');

              $.ajax({
                 type: 'POST',
                 url: '<?php echo SITE_URL?>system/controllers/frontend_controller.php',
                 data: "&action=customerLogin&"+url_data,
                 success: function(res) {
                      if($.trim(res)==200){
                        clearFormFieldsFront("#login_form");
                        showFrontFormMessage('#form_submit_msg','success',{message:'Login Success.. Redirecting'});
                        setTimeout(function(){
                          <?php if ($live_auction_redirect) { ?>
                            window.location.href = http_path + 'my-account/live-auction-request.php';
                          <?php }else{ ?> 
                            window.location.href = http_path + 'my-account/';
                          <?php } ?>

                        },3000);
                        
                      }else{
                        showFrontFormMessage('#form_submit_msg','error',{message:'Username Or Password Incorrect'});
                      }
                    $('#submit_btn').removeAttr('disabled');
                    $("#submit_btn").val('Login');
                    
                 },
              });
        
            }

        }); 

    });

    
        

</script>
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
<title>Car Auction - Register</title>
<?php include(DOC_ROOT.'includes/header.php'); ?>

<!--Page Header-->
<section class="page-header">
  <div class="container">
    <div class="page-header_wrap">
      <div class="page-heading">
        <h1>Register</h1>
      </div>
      <ul class="coustom-breadcrumb">
        <li><a href="#">Home</a></li>
        <li>Register</li>
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
              <h3>Register</h3>
              <form method="post" name="resitration_form" id="resitration_form">
                <div class="form-group">
                  <input type="text" class="form-control" name="name" id="name" placeholder="Full Name">
                </div>
                <div class="form-group">
                  <input type="text" class="form-control" name="email" id="email" placeholder="Email Address">
                </div>
                <div class="form-group">
                  <input type="text" class="form-control" name="phone" id="phone" placeholder="Phone Number">
                </div>
                <div class="form-group">
                  <input type="password" class="form-control" name="password" id="password" placeholder="Password">
                </div>
                <div class="form-group">
                  <input type="password" class="form-control" name="re_password" id="re_password" placeholder="Confirm Password">
                </div>
                <div class="form-group checkbox">
                  <input type="checkbox" id="terms_agree">
                  <label for="terms_agree">I Agree with <a href="#">Terms and Conditions</a></label>
                </div>
                <div class="form-group">
                  <input type="submit" id="submit_btn" value="Sign Up" class="btn btn-block">
                </div>
                <div id="form_submit_msg"></div>
              </form>
            </div>
            <div class="col-md-6 col-sm-6">
              <h6 class="gray_text">Already have an account?</h6>
              <p>Login Here.</p>
              <div class="text-center">
                <div class="form-group">
                  <?php if ($live_auction_redirect) { ?>
                   <button type="button" id="register" value="Register" onclick="window.location.href = http_path + 'my-account/login.php?live_auction=true'" class="btn btn-block">Login Here</button>
                 <?php }else{ ?> 
                  <button type="button" id="register" value="Register" onclick="window.location.href = http_path + 'my-account/login.php'" class="btn btn-block">Login Here</button>
                  <?php } ?>
                </div>
              </div>
             <!--  <p>Don't have an account? <a href="<?php echo SITE_URL; ?>my-account/register.php">Signup Here</a></p> -->
              <!-- <p><a href="#forgotpassword" data-toggle="modal" data-dismiss="modal">Forgot Password ?</a></p> -->
            </div>
            <div class="mid_divider"></div>
          </div>
        </div>

        <!-- <div class="text-center">
          <p>Already got an account? <a href="<?php echo SITE_URL; ?>my-account/login.php">Login Here</a></p>
          <!-- <p><a href="#forgotpassword" data-toggle="modal" data-dismiss="modal">Forgot Password ?</a></p> -->
        </div> -->
  </div>
</section>
<!-- /Contact-us--> 

<?php include(DOC_ROOT.'includes/footer.php'); ?>

<script type="text/javascript">
    $(document).ready(function(){
        
        
        $("#resitration_form").validate({
            rules: {
                name: {required: true},
                email: {
                    required: true,
                    email: true,
                },
                phone: {
                    required: true,
                },
                password: {
                    required: true,
                },
                re_password: {
                    required: true,
                    equalTo: "#password"
                }
                
            },
            messages: {
                name: "<span class='text-danger'>Please enter your name.</span>",
                email:{
                    required: "<span class='text-danger'>Please enter email address.</span>",
                    email: "<span class='text-danger'>Please enter a valid email address.</span>",
                },
                phone: {
                    required: "<span class='text-danger'>Please enter your phone number.</span>",
                },
                password: {
                    required: "<span class='text-danger'>Please enter your password.</span>",
                },
                re_password: {
                    required: "<span class='text-danger'>Please re enter the password.</span>",
                    equalTo: "<span class='text-danger'>Please enter the same password as above.</span>"
                }
                
            },
            submitHandler: function () {

              var url_data = $('#resitration_form').serialize(); console.log(url_data);

              $('#submit_btn').attr('disabled','disabled');
              $("#submit_btn").val('Please Wait...');

              $.ajax({
                 type: 'POST',
                 url: '<?php echo SITE_URL?>system/controllers/frontend_controller.php',
                 data: "&action=customerRegistration&"+url_data,
                 success: function(res) {
                     if($.trim(res)==200){
                        clearFormFieldsFront("#resitration_form");
                        showFrontFormMessage('#form_submit_msg','success',{message:'Successfully Added'});
                        <?php if($live_auction_redirect){ ?>
                          setTimeout(function(){window.location.href = http_path + 'my-account/live-auction-request.php'},3000);
                        <?php }else{?>
                          setTimeout(function(){window.location.href = http_path + 'my-account/'},3000);
                        <?php } ?>
                      }else{
                        showFrontFormMessage('#form_submit_msg','error',{message:'Something wrong. Please try again'});
                      }
                    $('#submit_btn').removeAttr('disabled');
                    $("#submit_btn").val('Sign Up');
                    
                 },
              });
        
            }

        }); 

    });

    
        

</script>
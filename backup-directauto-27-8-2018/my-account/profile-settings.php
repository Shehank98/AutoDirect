<?php require_once('../system/config.php'); 
Sessions::customerRedirectOnNotLoggedIn();
$customer_id = Sessions::getCustomerId();

$customers = new Customers();
$data = $customers->getById($customer_id);
?>
<!DOCTYPE HTML>
<html lang="en">

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="keywords" content="">
<meta name="description" content="">
<title>Car Auction - Profile Settings</title>
<?php include(DOC_ROOT.'includes/header.php'); ?>

<!--Page Header-->
<section class="page-header profile_page">
  <div class="container">
    <div class="page-header_wrap">
      <div class="page-heading">
        <h1>Your Profile</h1>
      </div>
      <ul class="coustom-breadcrumb">
        <li><a href="<?php echo SITE_URL; ?>my-account/">My Account</a></li>
        <li>Profile</li>
      </ul>
    </div>
  </div>
  <!-- Dark Overlay-->
  <div class="dark-overlay"></div>
</section>
<!-- /Page Header--> 

<!--Profile-setting-->
<section class="user_profile inner_pages">
  <div class="container">
    <!-- <div class="user_profile_info gray-bg padding_4x4_40">
      
      <div class="dealer_info">
        <h5>CARAUCTION.LK </h5>
        <p>nNo 81, Barnes Place <br>
          Colombo 07,  1234-5678-090</p>
      </div>
    </div> -->
    <div class="row">
      <div class="col-md-3 col-sm-3">
        <div class="profile_nav">
          <ul>
            <li><a href="<?php echo SITE_URL; ?>my-account/index.php">My Account</a></li>
            <li><a href="<?php echo SITE_URL; ?>my-account/live-auction-request.php">Request Auction Data</a></li>
            <li class="active"><a href="<?php echo SITE_URL; ?>my-account/profile-settings.php">Profile Settings</a></li>
            <li><a href="<?php echo SITE_URL; ?>my-account/my-inquiries.php">My Inquiries</a></li>
            <li><a href="javascript:;" onclick="logoutCustomer();">Sign Out</a></li>
          </ul>
        </div>
      </div>
      <div class="col-md-6 col-sm-6">
        <div class="profile_wrap">
          <h5 class="uppercase underline">Genral Settings</h5>
          <form method="post" name="profile_settings" id="profile_settings">
            <div class="form-group">
              <label class="control-label">Full Name</label>
              <input class="form-control white_bg" id="name" name="name" type="text" value="<?php echo $data[0]['name']; ?>">
              <input class="form-control white_bg" id="id" name="id" type="hidden" value="<?php echo $customer_id; ?>">
            </div>
            <div class="form-group">
              <label class="control-label">Email Address<small> (You cannot change your email address)</small></label>
              <input class="form-control white_bg" id="email" name="email" type="text" value="<?php echo $data[0]['email']; ?>" readonly>
            </div>
            <div class="form-group">
              <label class="control-label">Phone Number</label>
              <input class="form-control white_bg" id="phone" name="phone" type="text" value="<?php echo $data[0]['phone']; ?>">
            </div>
            <!-- <div class="form-group">
              <label class="control-label">Date of Birth</label>
              <input class="form-control white_bg" id="birth-date" type="text">
            </div> -->
            <div class="form-group">
              <label class="control-label">Your Address</label>
              <textarea class="form-control white_bg" name="address" id="address" rows="4"><?php echo $data[0]['address']; ?></textarea>
            </div>
            <!-- <div class="form-group">
              <label class="control-label">Country</label>
              <input class="form-control white_bg" id="country" type="text">
            </div>
            <div class="form-group">
              <label class="control-label">City</label>
              <input class="form-control white_bg" id="city" type="text">
            </div> -->
            <div class="gray-bg field-title">
              <h6>Update password</h6>
              <p>Keep them blank to use the same password</p>
            </div>
            <div class="form-group">
              <label class="control-label">Password</label>
              <input class="form-control white_bg" id="password" name="password" type="password">
            </div>
            <div class="form-group">
              <label class="control-label">Confirm Password</label>
              <input class="form-control white_bg" id="re_password" name="re_password" type="password">
            </div>
            <!-- <div class="gray-bg field-title">
              <h6>Social Links</h6>
            </div>
            <div class="form-group">
              <label class="control-label">Facebook ID</label>
              <input class="form-control white_bg" id="facebook" type="text">
            </div>
            <div class="form-group">
              <label class="control-label">Twitter ID</label>
              <input class="form-control white_bg" id="twitter" type="text">
            </div>
            <div class="form-group">
              <label class="control-label">Linkedin ID</label>
              <input class="form-control white_bg" id="linkedin" type="text">
            </div>
            <div class="form-group">
              <label class="control-label">Google+ ID</label>
              <input class="form-control white_bg" id="google" type="text">
            </div> -->
            <div class="form-group">
              <button type="submit" id="submit_btn" class="btn">Save Changes <span class="angle_arrow"><i class="fa fa-angle-right" aria-hidden="true"></i></span></button>
            </div>
            <div id="form_submit_msg"></div>
          </form>
        </div>
      </div>
      <div class="col-md-3 col-sm-3">
        <?php include(DOC_ROOT.'my-account/side-bar.php'); ?>
      </div>
    </div>
  </div>
</section>
<!--/Profile-setting--> 

<?php include(DOC_ROOT.'includes/footer.php'); ?>

<script type="text/javascript">
    $(document).ready(function(){
        
        
        $("#profile_settings").validate({
            rules: {
                name: {required: true},
                email: {
                    required: true,
                    email: true,
                },
                phone: {
                    required: true,
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

              var url_data = $('#profile_settings').serialize(); console.log(url_data);

              $('#submit_btn').attr('disabled','disabled');
              $("#submit_btn").val('Please Wait...');

              $.ajax({
                 type: 'POST',
                 url: '<?php echo SITE_URL?>system/controllers/customers_controller.php',
                 data: "&action=update&"+url_data,
                 success: function(res) {
                     if($.trim(res)==200){
                        $('#password').val('');
                        $('#re_password').val('');
                        showFrontFormMessage('#form_submit_msg','success',{message:'Successfully Updated.'});
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
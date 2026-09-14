<?php require_once('../system/config.php'); 
// $live_auction = $_GET['live_auction'];
// if(isset($live_auction) && $live_auction="true"){
//   $url_parameter = "?live_auction=true";
// }else{
//   $url_parameter='';
// }
// Sessions::customerRedirectOnNotLoggedIn($url_parameter);
$customer_id = Sessions::getCustomerId();
$customers = new Customers();

//if($customer_id){
  $data = $customers->getById($customer_id);
//}
?>
<!DOCTYPE HTML>
<html lang="en">

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="keywords" content="">
<meta name="description" content="">
<title>Directautoimport.lk - Request A Quote</title>
<?php include(DOC_ROOT.'includes/header.php'); ?>

<!--Page Header-->
<section class="page-header aboutus_page">
  <div class="container">
    <div class="page-header_wrap">
      <div class="page-heading">
        <h1>Request A Quote</h1>
      </div>
      <ul class="coustom-breadcrumb">
        <li><a href="<?php echo SITE_URL; ?>my-account/">My Account</a></li>
        <li>Request A Quote</li>
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
      <!-- <div class="col-md-3 col-sm-3">
        <div class="profile_nav">
          <ul>
            <li><a href="<?php echo SITE_URL; ?>my-account/index.php">My Account</a></li>
            <li class="active"><a href="<?php echo SITE_URL; ?>my-account/live-auction-request.php">Request Auction Data</a></li>
            <li><a href="<?php echo SITE_URL; ?>my-account/profile-settings.php">Profile Settings</a></li>
            <li><a href="<?php echo SITE_URL; ?>my-account/my-inquiries.php">My Inquiries</a></li>
            <li><a href="javascript:;" onclick="logoutCustomer();">Sign Out</a></li>
          </ul>
        </div>
      </div> -->
      <div class="col-md-9 col-sm-9">
        <div class="profile_wrap">
          <h5 class="uppercase underline">Your Info</h5>
          <form method="post" name="profile_settings" id="profile_settings">
            <div class="form-group">
              <label class="control-label">Full Name</label>
              <input class="form-control white_bg" id="name" name="name" type="text" value="<?php echo $data[0]['name']; ?>">
              <input class="form-control white_bg" id="id" name="id" type="hidden" value="<?php echo $customer_id; ?>">
            </div>
            <div class="form-group">
              <label class="control-label">Email Address</label>
              <input class="form-control white_bg" id="email" name="email" type="text" value="<?php echo $data[0]['email']; ?>">
            </div>
            <div class="form-group">
              <label class="control-label">Phone Number</label>
              <input class="form-control white_bg" id="phone" name="phone" type="text" value="<?php echo $data[0]['phone']; ?>">
            </div>
            
            <div class="gray-bg field-title">
              <h6>Vehicle Requirement</h6>
              
            </div>
            <div class="form-group">
              <label class="control-label">Make</label>
              <div class="select">
                <select class="form-control" id="manufacturer_live" name="manufacturer_live" onchange="loadModelsLive(this.value)">
                  <option value="">Select Make</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="control-label">Model</label>
              <div class="select">
                <select class="form-control" name="model_live" id="model_live" onchange="loadYearsLive(this.value)">
                  <option value="">Select Model</option>
                  
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label class="control-label">Year</label>
              <div class="select">
                <select class="form-control" name="year_live" id="year_live" onchange="loadColorsLive()">
                  <option value="">Year of Model </option>
                  
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="control-label">Colour</label>
              <div class="select">
                <select class="form-control" name="color_live" id="color_live">
                  <option value="">Select Colour </option>
                  
                </select>
              </div>
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
            <div class="form-group button">
              <button type="submit" id="submit_btn" class="btn">Request <span class="angle_arrow"><i class="fa fa-angle-right" aria-hidden="true"></i></span></button>
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
                }
                
            },
            submitHandler: function () {

              var url_data = $('#profile_settings').serialize(); console.log(url_data); 

              $('#submit_btn').attr('disabled','disabled');
              $("#submit_btn").val('Please Wait...');

              $.ajax({
                 type: 'POST',
                 url: '<?php echo SITE_URL?>system/controllers/frontend_controller.php',
                 data: "&action=liveInquiry&"+url_data,
                 success: function(res) {
                     if($.trim(res)==200){
                        $('#password').val('');
                        $('#re_password').val('');
                        showFrontFormMessage('#form_submit_msg','success',{message:'Successfully Updated.'});
                      }else{
                        showFrontFormMessage('#form_submit_msg','error',{message:'Something wrong. Please try again'});
                      }
                    $('#submit_btn').removeAttr('disabled');
                    $("#submit_btn").val('Request');
                    setTimeout(function(){window.location.href='<?php echo SITE_URL?>my-account/'},3000);
                 },
              });
        
            }

        }); 

    });

    
        

</script>

<script type="text/javascript">
  
  $(document).ready(function () {
      //loadAuctionDaysLive();
      loadManufacturerLive();
      loadModelsLive();
      loadYearsLive();
      loadColoursLive();
  });
</script>
<?php require_once('../system/config.php'); 
Sessions::customerRedirectOnNotLoggedIn();
$customer_id = Sessions::getCustomerId();

$customers = new Customers();
$data = $customers->getById($customer_id);

$inquiries = new LiveInquiry();
$live_inquiries = $inquiries->selectLatestByCustomerId($customer_id);
?>
<!DOCTYPE HTML>
<html lang="en">

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="keywords" content="">
<meta name="description" content="">
<title>Directautoimport.lk - My Account</title>
<?php include(DOC_ROOT.'includes/header.php'); ?>

<!--Page Header-->
<section class="page-header aboutus_page">
  <div class="container">
    <div class="page-header_wrap">
      <div class="page-heading">
        <h1>My Account</h1>
      </div>
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
            <li class="active"><a href="<?php echo SITE_URL; ?>my-account/index.php">My Account</a></li>
            <li><a href="<?php echo SITE_URL; ?>my-account/live-auction-request.php">Request Auction Data</a></li>
            <li><a href="<?php echo SITE_URL; ?>my-account/profile-settings.php">Profile Settings</a></li>
            <li><a href="<?php echo SITE_URL; ?>my-account/my-inquiries.php">My Inquiries</a></li>
            <li><a href="javascript:;" onclick="logoutCustomer();">Sign Out</a></li>
          </ul>
        </div>
      </div>
      <div class="col-md-6 col-sm-6">
        <h5 class="uppercase underline">My Latest Inquiries</h5>
        <table class="table table-responsive">
          <thead>
            <tr>
              <th>Make</th>
              <th>Model</th>
              <th>Year</th>
              <th>Color</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($live_inquiries as $row) { ?>            
            <tr>
              <td><?php echo $row['make']; ?></td>
              <td><?php echo $row['model']; ?></td>
              <td><?php echo $row['year']; ?></td>
              <td><?php echo $row['color']; ?></td>
              <td><?php echo date('d-M-Y',strtotime($row['created_at'])); ?></td>
            </tr>
            <?php } ?>
            <tr><td colspan="5"><a class="btn pull-right" href="<?php echo SITE_URL; ?>my-account/my-inquiries.php">View All <span class="angle_arrow"><i class="fa fa-angle-right" aria-hidden="true"></i></span></a></td></tr>
          </tbody>
        </table>

        <h5 class="uppercase underline">Profile Details</h5>
        <table class="table table-responsive">
          <div class="form-group">
              <label class="control-label">Full Name</label>
              <p><?php echo $data[0]['name']; ?></p>
            </div>
            <div class="form-group">
              <label class="control-label">Email Address</label>
              <p><?php echo $data[0]['email']; ?></p>
            </div>
            <div class="form-group">
              <label class="control-label">Phone Number</label>
              <p><?php echo $data[0]['phone']; ?></p>
            </div>
            <!-- <div class="form-group">
              <label class="control-label">Date of Birth</label>
              <input class="form-control white_bg" id="birth-date" type="text">
            </div> -->
            <div class="form-group">
              <label class="control-label">Your Address</label>
              <p><?php echo $data[0]['address']; ?></p>
            </div>
            <a class="btn pull-right" href="<?php echo SITE_URL; ?>my-account/profile-settings.php">Edit <span class="angle_arrow"><i class="fa fa-angle-right" aria-hidden="true"></i></span></a>
          
        </table>

      </div>
      <div class="col-md-3 col-sm-3">
        <?php include(DOC_ROOT.'my-account/side-bar.php'); ?>
      </div>
    </div>
  </div>
</section>
<!--/Profile-setting--> 

<?php include(DOC_ROOT.'includes/footer.php'); ?>
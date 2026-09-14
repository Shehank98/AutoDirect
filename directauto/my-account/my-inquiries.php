<?php require_once('../system/config.php'); ?>
<?php  
Sessions::customerRedirectOnNotLoggedIn();
$customer_id = Sessions::getCustomerId();

$inquiries = new LiveInquiry();
$live_inquiries = $inquiries->selectAllByCustomerId($customer_id);
?>
<!DOCTYPE HTML>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="keywords" content="">
<meta name="description" content="">
<title>Car Auction - My Inquiries</title>
<?php include(DOC_ROOT.'includes/header.php'); ?>

<!--Page Header-->
<section class="page-header profile_page">
  <div class="container">
    <div class="page-header_wrap">
      <div class="page-heading">
        <h1>My Inquiries</h1>
      </div>
      <ul class="coustom-breadcrumb">
        <li><a href="<?php echo SITE_URL; ?>my-account/">My Account</a></li>
        <li>My Inquiries</li>
      </ul>
    </div>
  </div>
  <!-- Dark Overlay-->
  <div class="dark-overlay"></div>
</section>
<!-- /Page Header--> 

<!--my-vehicles-->
<section class="user_profile inner_pages">
  <div class="container">
      <!-- <div class="dealer_info">
        <h5>CARAUCTION.LK </h5>
        <p>nNo 81, Barnes Place <br>
          Colombo 07,  1234-5678-090</p>
      </div> -->
    <div class="row">
      <div class="col-md-3 col-sm-3">
        <div class="profile_nav">
          <ul>
            <li><a href="<?php echo SITE_URL; ?>my-account/index.php">My Account</a></li>
            <li><a href="<?php echo SITE_URL; ?>my-account/live-auction-request.php">Request Auction Data</a></li>
            <li><a href="<?php echo SITE_URL; ?>my-account/profile-settings.php">Profile Settings</a></li>
            <li class="active"><a href="<?php echo SITE_URL; ?>my-account/my-inquiries.php">My Inquiries</a></li>
            <li><a href="javascript:;" onclick="logoutCustomer();">Sign Out</a></li>
          </ul>
        </div>
      </div>
      <div class="col-md-6 col-sm-6">
        <h5 class="uppercase underline">My Inquiries</h5>
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
          </tbody>
        </table>
            <!-- <div class="pagination">
              <ul>
                <li class="current">1</li>
                <li><a href="#">2</a></li>
                <li><a href="#">3</a></li>
                <li><a href="#">4</a></li>
                <li><a href="#">5</a></li>
              </ul>
            </div> -->


      </div>
      <div class="col-md-3 col-sm-3">
        <?php include(DOC_ROOT.'my-account/side-bar.php'); ?>
      </div>
    </div>
  </div>
</section>
<!--/my-vehicles--> 

<?php include(DOC_ROOT.'includes/footer.php'); ?>
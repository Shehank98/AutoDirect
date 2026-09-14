<?php require_once('../system/config.php'); ?>
<?php //error_reporting(E_ALL);

if(isset($_GET['manufacturer_live'])){
  $manufacturer_live = htmlentities($_GET['manufacturer_live']);
}else{
  $manufacturer_live = '';
}
if (isset($_GET['model_live'])) {
  $model = htmlentities($_GET['model_live']);
}else{
  $model = '';
}
if(isset($_GET['year_live'])){
  $year = htmlentities($_GET['year_live']);
}else{
  $year = '';
}
if(isset($_GET['chassis_no'])){
  $chassis_no = htmlentities($_GET['chassis_no']);
}else{
  $chassis_no = '';
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
<title>Car Auction - Our Stock</title>
<?php include(DOC_ROOT.'includes/header.php'); ?>

<!--Page Header-->
<section class="page-header listing_page">
  <div class="container">
    <div class="page-header_wrap">
      <div class="page-heading">
        <h1>Live Auction</h1>
      </div>
      <ul class="coustom-breadcrumb">
        <li><a href="#">Home</a></li>
        <li>Live Auction</li>
      </ul>
    </div>
  </div>
  <!-- Dark Overlay-->
  <div class="dark-overlay"></div>
</section>
<!-- /Page Header--> 

<section id="filter_form2" class="filter_form_inner_page">
  <div class="container">
    
        <div class="white_bg black-text">
            <h3>Find Your Dream Car</h3>
            <div class="row">
              <form id="search_vehicles_live" name="search_vehicles_live" method="post">
                
                <div class="form-group col-md-3 col-sm-6">
                  <div class="select">
                    <select class="form-control" id="manufacturer_live" name="manufacturer_live" onchange="loadModelsLive(this.value)">
                      <option value="">Select Make</option>
                    </select>
                  </div>
                </div>
                <div class="form-group col-md-3 col-sm-6">
                  <div class="select">
                    <select class="form-control" name="model_live" id="model_live" onchange="loadYearsLive(this.value)">
                      <option value="">Select Model</option>
                      
                    </select>
                  </div>
                </div>
                <div class="form-group col-md-3 col-sm-6">
                  <div class="select">
                    <select class="form-control" name="chassis_no" id="chassis_no">
                      <option value="">Chassis Code </option>
                      
                    </select>
                  </div>
                </div>
                <div class="form-group col-md-3 col-sm-6">
                  <div class="select">
                    <select class="form-control" name="year_live" id="year_live">
                      <option value="">Year of Model </option>
                      
                    </select>
                  </div>
                </div>
                <div class="form-group col-md-3 col-sm-6">
                  <div class="select">
                    <select class="form-control" name="auction_date" id="auction_date">
                      <option value="">Auction Date </option>
                      
                    </select>
                  </div>
                </div>
                <input type="hidden" name="loaded" id="loaded" value="">
                
                <div class="form-group col-md-3 col-sm-6 pull-right">
                  <button type="button" id="search_live" onclick="searchVehicle(1);" class="btn btn-block"><i class="fa fa-search" aria-hidden="true"></i> Search </button>
                </div>
              </form>
            </div>
        </div>
      
  </div>
</section>
<!-- /Filter-Form --> 

<!--Listing-->
<section class="listing-page listing_page_2">
  <div class="container">
    <div class="row">
      <div class="col-md-12">
        <div class="result-sorting-wrapper">
          <div class="sorting-count">
            <p>1 - 8 <span>of 50 Listings</span></p>
          </div>
          <!-- <div class="result-sorting-by">
            <p>Sort by:</p>
            <form action="#" method="post">
              <div class="form-group select sorting-select">
                <select class="form-control ">
                  <option>Price (low to high)</option>
                  <option>$100 to $500</option>
                  <option>$500 to $1000</option>
                  <option>$1000 to $1500</option>
                  <option>$1500 to $2000</option>
                </select>
              </div>
            </form>
          </div> -->
        </div>
        <div id="loading" class="text-center" style="margin: 80px auto;display: none;"><img src="<?php echo SITE_URL . "images/loader.gif" ?>"/></div>
        <div id="car_listing">
        
        <?php 
        /*foreach ($vehicle_data as $vehicle) {
          $in_compare_list = false;
          $images = explode(',', $vehicle['images']);
          if(in_array($vehicle['id'], $compare_list)){
            $in_compare_list = true;
          }
         ?>
       
        <div class="product-listing-m gray-bg">
          <div class="product-listing-img"> <a href="<?php echo SITE_URL; ?>our-stock/<?php echo $vehicle['seo_url']; ?>"><img src="<?php echo SITE_URL; ?>uploads/vehicles/<?php echo $images[0]; ?>" class="img-responsive" alt="" /> </a>
            <div class="label_icon"><?php echo $condition[$vehicle['conditions']]; ?></div>
            <div class="compare_item" onclick="addToCompareLocal(<?php echo $vehicle['id']; ?>,'compare_<?php echo $vehicle['id']; ?>')">
              <div class="checkbox">
                <input type="checkbox" value="" id="compare_<?php echo $vehicle['id']; ?>" <?php echo ($in_compare_list)? 'checked="checked"':''; ?>>
                <label for="compare22">Compare</label>
              </div>
            </div>
          </div>
          <div class="product-listing-content">
            <h5><a href="<?php echo SITE_URL; ?>our-stock/<?php echo $vehicle['seo_url']; ?>"><?php echo $vehicle['vehicle_manufacturer_name'].' '.$vehicle['vehicle_model_name']; ?></a></h5>
            <!--<p class="list-price">$90,000</p>-->
           <ul>
              <li><i class="fa fa-road" aria-hidden="true"></i><?php echo $vehicle['mileage'] ?></li>
              <li><i class="fa fa-tachometer" aria-hidden="true"></i><?php echo $vehicle['engine_capacity'] ?></li>
              <li><i class="fa fa-calendar" aria-hidden="true"></i><?php echo $vehicle['year'] ?></li>
              <li><i class="fa fa-car" aria-hidden="true"></i><?php echo $fuel_type[$vehicle['fuel_type']] ?></li>
              <li><i class="fa fa-user" aria-hidden="true"></i><?php echo $vehicle['seats'] ?></li>
              <li><i class="fa fa-superpowers" aria-hidden="true"></i><?php echo $transmission[$vehicle['transmission']]; ?></li>
            </ul>
            <a href="<?php echo SITE_URL; ?>our-stock/<?php echo $vehicle['seo_url']; ?>" class="btn">VIEW PROFILE <span class="angle_arrow"><i class="fa fa-angle-right" aria-hidden="true"></i></span></a>
            <!--<div class="car-location"><span><i class="fa fa-map-marker" aria-hidden="true"></i> Colorado, USA</span></div>-->
          </div>
        </div>
         <?php }*/ ?>
        </div>

         
       
        <div class="pagination" id="pagination"><?php //echo $pagination; ?></div>
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
      
     
    </div>
  </div>
</section>
<!-- /Listing--> 

<?php include(DOC_ROOT.'includes/footer.php'); ?>
<script type="text/javascript">
$(document).ready(function(){
  setValues('<?php echo $manufacturer_live ?>','<?php echo $model ?>','<?php echo $chassis_no ?>','<?php echo $year ?>');
  //searchVehiclesLive(1);

});

// $('#search_live').click(function(e){
//   e.preventDefault();
//   searchVehicle(1);
// });
</script>
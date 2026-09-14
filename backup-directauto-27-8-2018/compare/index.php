<?php require_once('../system/config.php'); 
$compare_list = Sessions::getCompareVehiclesLocal();

$vehicles = new Vehicle();
$vehicle_colors = new vehicleColor();

$vehicles_data = array();
foreach ($compare_list as $vehicle_id) {
  $_tmp_vehicle_data = $vehicles->getById($vehicle_id);
  $images = explode(',', $_tmp_vehicle_data[0]['images']);
  $other_color = $vehicle_colors->getById($_tmp_vehicle_data[0]['other_color']);
  $_tmp_vehicle_data[0]['main_image'] = $images[0];
  $_tmp_vehicle_data[0]['other_color'] = $other_color[0]['name'];
  $vehicles_data[] = $_tmp_vehicle_data[0];
}

$transmission = Vehicle::getTransmissionData();
$condition = Vehicle::getCondition();
$drive_type = Vehicle::getDriveType();
$fuel_type = Vehicle::getFuelType();

$vehicle_features = new VehicleFeature();
$features = $vehicle_features->selectAllActive();


?>
<!DOCTYPE HTML>
<html lang="en">

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Direct auto import, Car Auction Sri Lanka,Japan Car sales in Sri lanka,Direct car import, car import Sri lanka, brand new vehicles</title>
		<meta name="description" content="Direct auto import, Car Auction Japan Sri Lanka,best japanese car auction website,how to import vehicles from japan?,Japan Car sales in Sri lanka,car auctions in japan with prices, car import Sri lanka, brand new vehicles, unregistered vehicle sale in sri lanka,trusted japanese car exporters">
		<meta name="keywords" content="Direct auto import, Car Auction Japan Sri Lanka,Japan Car sales in Sri lanka, car import Sri lanka, brand new vehicles, Car, Jeep,SVU,Van,unregistered vehicle sale in sri lanka, best cars in sri lanka, online car auction sites">
		<meta name="keywords" content="aqua car sale in sri lanka,toyota car auction,toyota car sell sri lanka,nissan hybrid cars in sri lanka,honda cars for sale in sri lanka,wagon car sale sri lanka,honda fit cars for sale in sri lanka,Toyota Aqua,Toyota Axio Hybrid,Toyota Premio,Toyota Vitz,Suziki Wagon R,Suziki Wagon R Stringray,Suziki Baleno,Honda Grace, Honda Vezel,Nissan Leaf,Nissan X-Trail,Nissan Van,Audi Q,">

		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="google-site-verification" content="vRdLKlGFD76JRAqe6NmoJm3CQH5Y3e86BvWKzPYSRvc"/>
		<meta name="msvalidate.01" content="229A142268841684EC75AE1AA0293625"/>

		<link href="http://www.directautoimport.lk" hreflang="en-us" rel="alternate" title="directautoimport" type="text/html"/>

		<meta name="twitter:card" content="summary">
		<meta name="twitter:site" content="@directautoimport">
		<meta name="twitter:title" content="Directautoimport, Direct auto import, Car Auction Japan Sri Lanka,Japan Car sale Sri lanka,Car import Sri lanka">
		<meta name="twitter:description" content="Importing cars directly from Japan is a new concept for many, but we never exploit your inexperience in this subject. Our main mission is to make sure that you have the right knowledge and experience and then let you take advantage of the opportunities. ">
		<meta name="twitter:creator" content="@directautoimport">
		<meta name="twitter:image" content="http://directautoimport.lk/images/Select-2.jpg">
		<meta property="og:title" content="Directautoimport, Direct auto import, Car Auction Japan Sri Lanka,Japan Car sale Sri lanka,Car import Sri lanka"/>
		<meta property="og:type" content="article"/>
		<meta name="author" content="Akila Dunukara"/>
		<meta property="og:url" content="http://www.directautoimport.lk"/>
		<meta property="og:image" content="http://directautoimport.lk/images/Select-2.jpgg"/>
		<meta property="og:description" content="Importing cars directly from Japan is a new concept for many, but we never exploit your inexperience in this subject. Our main mission is to make sure that you have the right knowledge and experience and then let you take advantage of the opportunities."/>
		<meta property="og:site_name" content="Directautoimport"/>
<?php include(DOC_ROOT.'includes/header.php'); ?>

<!--Page Header-->
<section class="page-header compare_page">
  <div class="container">
    <div class="page-header_wrap">
      <div class="page-heading">
        <h1>Compare Vehicles</h1>
      </div>
      <ul class="coustom-breadcrumb">
        <li><a href="<?php echo SITE_URL; ?>">Home</a></li>
        <li>Compare Vehicles</li>
      </ul>
    </div>
  </div>
  <!-- Dark Overlay-->
  <div class="dark-overlay"></div>
</section>
<!-- /Page Header--> 

<!--Compare-->
<section class="compare-page inner_pages">
  <div class="container">
    <div class="compare_info">
      <div class="compare_product_img">
        <div class="inventory_info_list inventory_image_list">
          <ul>
            <li class="search_other_inventory"><i class="fa fa-search text-right" aria-hidden="true"></i> Compare Vehicles</li>
            <?php foreach ($vehicles_data as $key=>$vehicle) { ?>
              <li><a href="<?php echo SITE_URL; ?>our-stock/<?php echo $vehicle['seo_url']; ?>" class="compare_img"><img src="<?php echo SITE_URL; ?>uploads/vehicles/<?php echo $vehicle['main_image']; ?>" alt="image" class="img-responsive" ></a><a href="javascript:;" onclick="removeFromComparePageLocal(<?php echo $vehicle['id']; ?>)" class="btn remove_compare_btn">Remove From List</a></li>

            <?php } ?>
            <?php for ($i=3; $i > count($vehicles_data) ; $i--) { ?>
              <li><a href="<?php echo SITE_URL; ?>our-stock/"><img src="<?php echo SITE_URL; ?>images/empty_car.png" alt="image"></a></li>
            <?php } ?>
            
          </ul>
        </div>
        <table>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </table>
      </div>
      <div class="compare_product_title gray-bg">
        <div class="inventory_info_list">
          <ul>
            <li class="listing_heading main_heading">Compare<br>
              Vehicles<span class="td_divider"></span></li>
              <?php foreach ($vehicles_data as $key=>$vehicle) { ?>
                <li><a href="<?php echo SITE_URL; ?>our-stock/<?php echo $vehicle['seo_url']; ?>"><?php echo strtoupper($vehicle['vehicle_manufacturer_name'].' '.$vehicle['vehicle_model_name']); ?></a>
                  <?php if($key<2){ ?>
                <span class="vs">V/s</span>
                <?php } ?>
                <!--<p class="price">$90,000</p>
                <span class="vs">V/s</span>-->
                </li>
              
              <?php } ?>
              <?php for ($i=3; $i > count($vehicles_data) ; $i--) { ?>
                <li><a href="<?php echo SITE_URL; ?>our-stock/">ADD CAR TO COMPARE</a>
                <?php if(($i-count($vehicles_data))>1){ ?>
                <span class="vs">V/s</span>
                <?php } ?>
                </li>
              <?php } ?>
            
          </ul>
        </div>
      </div>
      <div class="compare_product_info"> 
        <!--Basic-Info-Table-->
        <div class="inventory_info_list">

          <div class="listing_heading">
            <div>Overview</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
          </div>
          
          <ul>
            <li class="info_heading">
              <div>Body</div>
              <div>Make</div>
              <div>Model</div>
              <div>Mileage</div>
              <div>Fuel Type</div>
              <div>Engine</div>
              <div>Year</div>
              <div>Transmission</div>
              <div>Drive Type</div>
              <div>No of Seats</div>
              <div>Exterior Color</div>
              <div>Interior Color</div>
            </li>
            <?php foreach ($vehicles_data as $key=>$vehicle) { ?>
            <li>
              <div><?php echo $vehicle['vehicle_type_name']; ?></div>
              <div><?php echo $vehicle['vehicle_manufacturer_name']; ?></div>
              <div><?php echo $vehicle['vehicle_model_name']; ?></div>
              <div><?php echo $vehicle['mileage']; ?></div>
              <div><?php echo $fuel_type[$vehicle['fuel_type']]; ?></div>
              <div><?php echo $vehicle['engine_capacity']; ?></div>
              <div><?php echo $vehicle['year']; ?></div>
              <div><?php echo $transmission[$vehicle['transmission']]; ?></div>
              <div><?php echo $drive_type[$vehicle['drive_type']]; ?></div>
              <div><?php echo ($vehicle['seats'])?$vehicle['seats']:'&nbsp;&nbsp;'; ?></div>
              <div><?php echo $vehicle['vehicle_color']; ?></div>
              <div><?php echo ($vehicle['other_color'])?$vehicle['other_color']:'&nbsp;&nbsp;'; ?></div>
            </li>
            <?php } ?>
            <?php for ($i=3; $i > count($vehicles_data) ; $i--) { ?>
            <li>
              <div>&nbsp;&nbsp;</div>
              <div>&nbsp;&nbsp;</div>
              <div>&nbsp;&nbsp;</div>
              <div>&nbsp;&nbsp;</div>
              <div>&nbsp;&nbsp;</div>
              <div>&nbsp;&nbsp;</div>
              <div>&nbsp;&nbsp;</div>
              <div>&nbsp;&nbsp;</div>
              <div>&nbsp;&nbsp;</div>
              <div>&nbsp;&nbsp;</div>
              <div>&nbsp;&nbsp;</div>
              <div>&nbsp;&nbsp;</div>
            </li>
            <?php } ?>
          
            
          </ul>
        </div>
        
        <!--Accessories-->
        <div class="inventory_info_list">
          <div class="listing_heading">
            <div>Features</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
          </div>
          <ul>
            <li class="info_heading">
            <?php foreach ($features as $feature) { ?>
              <div><?php echo $feature['name']; ?></div>
            <?php } ?> 
            </li>
            
            <?php foreach ($vehicles_data as $vehicle) { 
              $feature_ids = explode(',', $vehicle['feature_ids']);
              ?>
            <li>
              <?php foreach ($features as $feature) { 
                if(in_array($feature['id'], $feature_ids)){
              ?>
                  <div><i class="fa fa-check" aria-hidden="true"></i></div>
              <?php }else{  ?>
                  <div><i class="fa fa-close" aria-hidden="true"></i></div>
              <?php }  ?> 
              <?php }  ?> 
            </li>
            <?php } ?> 

            <?php for ($i=3; $i > count($vehicles_data) ; $i--) { ?>
            <li>
            <?php foreach ($features as $feature) { ?>
              <div>&nbsp;&nbsp;</div>
            <?php } ?> 
            </li>
            <?php } ?> 
          </ul>
        </div>
        <div class="inventory_info_list text-center">
          <ul>
            <li>&nbsp;</li>
            <?php foreach ($vehicles_data as $vehicle) { ?>
            <li><a href="<?php echo SITE_URL ?>our-stock/<?php echo $vehicle['seo_url']; ?>" class="btn">VIEW PROFILE</a></li>
            <?php } ?> 
            <?php for ($i=3; $i > count($vehicles_data) ; $i--) { ?>
              <li>&nbsp;&nbsp;</li>
            <?php } ?> 
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>
<!--/Compare--> 

<?php include(DOC_ROOT.'includes/footer.php'); ?>
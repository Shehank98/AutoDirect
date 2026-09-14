<?php require_once('../system/config.php'); ?>
<?php 
if(isset($_GET['manufacturer'])){
  $manufacturer = htmlentities($_GET['manufacturer']);
}else{
  $manufacturer = '';
}
if (isset($_GET['model'])) {
  $model = htmlentities($_GET['model']);
}else{
  $model = '';
}
if(isset($_GET['year'])){
  $from_year = htmlentities($_GET['year']);
}else{
  $from_year = '';
}
if(isset($_GET['to_year'])){
  $to_year = htmlentities($_GET['to_year']);
}else{
  $to_year = '';
}
if(isset($_GET['color'])){
  $color = htmlentities($_GET['color']);
}else{
  $color = '';
}

$vehicles = new Vehicle();
$all = $vehicles->searchVehicles($manufacturer,$model,$from_year,$to_year,$color);

$transmission = Vehicle::getTransmissionData();
$condition = Vehicle::getCondition();
$drive_type = Vehicle::getDriveType();
$fuel_type = Vehicle::getFuelType();

$page = 1;
  $limit = 10;
  //$link = "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";;
  $jscallback = 'searchVehiclesLocal';
  $class = '';

  $Pager = new PagerJs();
  $query = $vehicles->searchVehiclesQuery($manufacturer,$model,$from_year,$to_year,$color);
  $Buttons = array('&laquo;', '&raquo;');

  $pagination = '';

  $vehicle_data = $Pager->pager($query, $page, $limit);
  if(count($all)>$limit){
    $Pager->getPager();
    $pagination .= $Pager->getPagerStyle($Buttons, $class, $jscallback);
  }

$manufacturers = new vehicleManufacturer();
$manufacturer_data = $manufacturers->selectAllActive();

$types = new vehicleType();
$type_data = $types->selectAllActive();

$compare_list = Sessions::getCompareVehiclesLocal();

$models = new VehicleModel();
$all_models = $models->selectAllActive();

$years = $vehicles->getYears();

$colors = new vehicleColor();
$colors_data = $colors->selectAllActive();

$latest_cars = $vehicles->getLatestCars();
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
<section class="page-header listing_page">
  <div class="container">
    <div class="page-header_wrap">
      <div class="page-heading">
        <h1>Our Stock</h1>
      </div>
      <ul class="coustom-breadcrumb">
        <li><a href="<?php echo SITE_URL ?>">Home</a></li>
        <li>Our Stock</li>
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
              <form id="search_vehicles_local" name="search_vehicles_local" action="<?php echo SITE_URL ?>our-stock/" method="get">
                <div class="form-group col-md-2 col-sm-6">
                  <div class="select">
                    <select class="form-control" id="manufacturer" name="manufacturer" onchange="loadModelsLocal(this.value)">
                      <option value="">Select Make</option>
                      <?php foreach ($manufacturer_data as $data) { ?>
                        <option value="<?php echo $data['id']; ?>" <?php echo ($manufacturer==$data['id'])?'selected':''; ?>><?php echo $data['name']; ?></option>
                     <?php }?>
                    </select>
                  </div>
                </div>
                <div class="form-group col-md-2 col-sm-6">
                  <div class="select">
                    <select class="form-control" name="model" id="model" onchange="loadYearLocal('',this.value)">
                      <option value="">Select Model</option>
                      <?php foreach ($all_models as $data) { ?>
                        <option value="<?php echo $data['id']; ?>" <?php echo ($model==$data['id'])?'selected':''; ?>><?php echo $data['name']; ?></option>
                      <?php }?>
                    </select>
                  </div>
                </div>
                <div class="form-group col-md-2 col-sm-6">
                  <div class="select">
                    <select class="form-control" name="year" id="year" onchange="loadColoursLocal()">
                      <option value="">From Year</option>
                      <?php foreach ($years as $data) { ?>
                        <option value="<?php echo $data['year']; ?>" <?php echo ($from_year==$data['year'])?'selected':''; ?>><?php echo $data['year']; ?></option>
                      <?php }?>
                    </select>
                  </div>
                </div>
                <div class="form-group col-md-2 col-sm-6">
                  <div class="select">
                    <select class="form-control" name="to_year" id="to_year" onchange="loadColoursLocal()">
                      <option value="">To Year</option>
                      <?php foreach ($years as $data) { ?>
                        <option value="<?php echo $data['year']; ?>" <?php echo ($to_year==$data['year'])?'selected':''; ?>><?php echo $data['year']; ?></option>
                      <?php }?>
                    </select>
                  </div>
                </div>
                <div class="form-group col-md-2 col-sm-6">
                  <div class="select">
                    <select class="form-control" name="color" id="color">
                      <option value="">Select Colour</option>
                      <?php foreach ($colors_data as $data) { ?>
                        <option value="<?php echo $data['id']; ?>" <?php echo ($color==$data['id'])?'selected':''; ?>><?php echo $data['name']; ?></option>
                      <?php }?>
                    </select>
                  </div>
                </div>
                <div class="form-group col-md-2 col-sm-6">
                  <button type="submit" class="btn btn-icon"><i class="fa fa-search" aria-hidden="true"></i></button>
                  <button type="button" onclick="clearSearchFields('#search_vehicles_local_home')" class="btn btn-icon"><i class="fa fa-refresh" aria-hidden="true"></i></button>
                </div>
              </form>
        </div>
      
  </div>
</section>
<!-- /Filter-Form --> 

<!--Listing-->
<section class="listing-page listing_page_2">
  <div class="container">
    <div class="row">
      <div class="col-md-9 col-md-push-3">
        <div class="result-sorting-wrapper">
          <div class="sorting-count">
            <p id="car_count"><?php echo count($all); ?> <span>vehicle(s) found.</span></p>
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
        foreach ($vehicle_data as $vehicle) {
          $in_compare_list = false;
          $images = explode(',', $vehicle['images']);
          if(in_array($vehicle['id'], $compare_list)){
            $in_compare_list = true;
          }
         ?>
       
        <div class="product-listing-m gray-bg">
          <div class="product-listing-img"> <a href="<?php echo SITE_URL; ?>our-stock/<?php echo $vehicle['seo_url']; ?>"><img src="<?php echo SITE_URL; ?>uploads/vehicles/<?php echo $images[0]; ?>" class="img-responsive" alt="" /> </a>
            <div class="label_icon"><?php echo $condition[$vehicle['conditions']]; ?></div>
            <div class="compare_item" onclick="addToCompareLocalInner(<?php echo $vehicle['id']; ?>,'compare_<?php echo $vehicle['id']; ?>')">
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
         <?php } ?>
        </div>

         
       
        <div class="pagination" id="pagination"><?php echo $pagination; ?></div>
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
      
      <!--Side-Bar-->
      <aside class="col-md-3 col-md-pull-9">
        <div class="sidebar_widget">
          <div class="widget_heading">
            <h5><i class="fa fa-search" aria-hidden="true"></i> Filter </h5>
          </div>
          <div class="sidebar_filter">
            <form id="filter_vehicles_local" name="filter_vehicles_local" method="post">
              <div class="form-group">
                <h5>Vehicle Type</h5>
                <?php foreach ($type_data as $data) { ?>
                     
                   
                <div class="radio">
                  <label><input type="radio" name="type" value="<?php echo $data['id']; ?>" onclick="searchVehiclesLocal(1)"><?php echo $data['name']; ?></label>
                </div>
                <?php }?>
                <!-- <div class="select">
                  <select class="form-control" id="type" name="type" onchange="searchVehiclesLocal(1)">
                    <option value="">Select Vehicle Type</option>
                    <?php foreach ($type_data as $data) { ?>
                      <option value="<?php echo $data['id']; ?>"><?php echo $data['name']; ?></option>
                   <?php }?>
                  </select>
                </div> -->
              </div>
              <!-- <div class="form-group">
                <div class="select">
                  <select class="form-control" id="manufacturer" name="manufacturer" onchange="loadModelsLocal(this.value)">
                    <option value="">Select Brand</option>
                    <?php foreach ($manufacturer_data as $data) { ?>
                      <option value="<?php echo $data['id']; ?>"><?php echo $data['name']; ?></option>
                   <?php }?>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <div class="select">
                  <select class="form-control" name="model" id="model" onchange="loadYearLocal('',this.value)">
                    <option value="">Select Model</option>
                    
                  </select>
                </div>
              </div>
              <div class="form-group">
                <div class="select">
                  <select class="form-control" name="year" id="year" onchange="searchVehiclesLocal(1)">
                    <option value="">Year of Model </option>
                    
                  </select>
                </div>
              </div>
             -->
              
              <!-- <div class="form-group">
                  <label class="form-label">Price Range ($)</label>
                  <input id="price_range" type="text" class="span2" value="" data-slider-min="50" data-slider-max="6000" data-slider-step="5" data-slider-value="[1000,5000]"/>
              </div>
              <div class="form-group select">
                <select class="form-control">
                  <option>Type of Car </option>
                  <option>New Car</option>
                  <option>Used Car</option>
                </select>
              </div> -->
              <div class="form-group">
                <button type="submit" class="btn btn-block"><i class="fa fa-search" aria-hidden="true"></i> Search Car</button>
              </div>
            </form>
          </div>
        </div>
        <!-- <div class="sidebar_widget sell_car_quote">
          <div class="white-text div_zindex text-center">
            <h3>Sell Your Car</h3>
            <p>Request a quote and sell your car now!</p>
            <a href="#" class="btn">Request a Quote <span class="angle_arrow"><i class="fa fa-angle-right" aria-hidden="true"></i></span></a> </div>
          <div class="dark-overlay"></div>
        </div> -->
        <div class="sidebar_widget">
          <div class="widget_heading">
            <h5><i class="fa fa-car" aria-hidden="true"></i> Recently Listed Cars</h5>
          </div>
          <div class="recent_addedcars">
            <ul>
              <?php foreach ($latest_cars as $vehicle) { 
                $images = explode(',', $vehicle['images']);
                ?>
               
              
              <li class="gray-bg">
                <div class="recent_post_img"> <a href="<?php echo SITE_URL; ?>our-stock/<?php echo $vehicle['seo_url']; ?>"><img src="<?php echo SITE_URL; ?>uploads/vehicles/<?php echo $images[0]; ?>" alt="image"></a> </div>
                <div class="recent_post_title"> <a href="<?php echo SITE_URL; ?>our-stock/<?php echo $vehicle['seo_url']; ?>"><?php echo $vehicle['vehicle_manufacturer_name'].' '.$vehicle['vehicle_model_name']; ?></a>
                  <p class="widget_price"><?php echo $vehicle['mileage'] ?></p>
                </div>
              </li>
              <?php } ?>
              <!-- <li class="gray-bg">
                <div class="recent_post_img"> <a href="#"><img src="<?php echo SITE_URL; ?>/images/post_200x200_2.jpg" alt="image"></a> </div>
                <div class="recent_post_title"> <a href="#">BMW 535i</a>
                  <p class="widget_price">$92,000</p>
                </div>
              </li>
              <li class="gray-bg">
                <div class="recent_post_img"> <a href="#"><img src="<?php echo SITE_URL; ?>/images/post_200x200_3.jpg" alt="image"></a> </div>
                <div class="recent_post_title"> <a href="#">Mazda CX-5 SX, V6, ABS, Sunroof </a>
                  <p class="widget_price">$92,000</p>
                </div>
              </li>
              <li class="gray-bg">
                <div class="recent_post_img"> <a href="#"><img src="<?php echo SITE_URL; ?>/images/post_200x200_4.jpg" alt="image"></a> </div>
                <div class="recent_post_title"> <a href="#">Ford Shelby GT350 </a>
                  <p class="widget_price">$92,000</p>
                </div>
              </li> -->
            </ul>
          </div>
        </div>
      </aside>
      <!--/Side-Bar--> 
    </div>
  </div>
</section>
<!-- /Listing--> 

<?php include(DOC_ROOT.'includes/footer.php'); ?>
<script type="text/javascript">


</script>
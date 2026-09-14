<?php require_once('../system/config.php'); 
$seo_url = htmlentities($_GET['seo_url']);
$vehicle = new Vehicle();

$data = $vehicle->getBySeoUrl($seo_url);
$images = explode(',', $data[0]['images']);

$latest = Vehicle::getIsLatest();
$transmission = Vehicle::getTransmissionData();
$condition = Vehicle::getCondition();
$drive_type = Vehicle::getDriveType();
$fuel_type = Vehicle::getFuelType();

$vehicle_features = new VehicleFeature();
$features = $vehicle_features->selectAllActive();

$feature_ids = explode(',', $data[0]['feature_ids']);

$similar_cars = $vehicle->getSimilarCars($data[0]['vehicle_type'],$data[0]['vehicle_manufacturer'],$data[0]['vehicle_model'],$data[0]['id']);  //print_r($similar_cars);

$compare_list = Sessions::getCompareVehiclesLocal();
?>
<!DOCTYPE HTML>
<html lang="en">

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="keywords" content="">
<meta name="description" content="">
<title>Car Auction - Vehicle Profile</title>
<?php include(DOC_ROOT.'includes/header.php'); ?>

<!-- Listing-detail-header -->
<section class="listing_detail_header">
  <div class="container">
    <div class="listing_detail_head white-text div_zindex row">
      <div class="col-md-12">
        <h2><?php echo strtoupper($data[0]['vehicle_manufacturer_name'].' '.$data[0]['vehicle_model_name']); ?></h2>
        <!-- <div class="car-location"><span><i class="fa fa-map-marker" aria-hidden="true"></i> 12250 F Garvey Ave South West Covina, CA 91791</span></div> -->
        <div class="add_compare">
          <div class="checkbox">
            <input value="" id="compare_<?php echo $data[0]['id']; ?>" type="checkbox" <?php echo (in_array($data[0]['id'], $compare_list))?'checked="checked"':''; ?>>
            <label id="label_compare_<?php echo $data[0]['id']; ?>" for="compare_<?php echo $data[0]['id']; ?>" onclick="addToCompareLocal(<?php echo $data[0]['id']; ?>,'compare_<?php echo $data[0]['id']; ?>')">Add to Compare</label>
          </div>
          <!-- <div class="share_vehicle">
            <p>Share: <a href="#"><i class="fa fa-facebook-square" aria-hidden="true"></i></a> <a href="#"><i class="fa fa-twitter-square" aria-hidden="true"></i></a> <a href="#"><i class="fa fa-linkedin-square" aria-hidden="true"></i></a> <a href="#"><i class="fa fa-google-plus-square" aria-hidden="true"></i></a> </p>
          </div> -->
        </div>
      </div>
      <!-- <div class="col-md-3">
        <div class="price_info">
          <p>$90,000</p>
          <p class="old_price">$95,000</p>
        </div>
      </div> -->
    </div>
  </div>
  <div class="dark-overlay"></div>
</section>
<!-- /Listing-detail-header -->

<!-- <section class="listing_other_info secondary-bg">
  <div class="container">
    <div id="filter_toggle" class="search_other"> <i class="fa fa-filter" aria-hidden="true"></i> Search Car </div>
    <div id="other_info"><i class="fa fa-info-circle" aria-hidden="true"></i></div>
    <div id="info_toggle">
      <button type="button" data-toggle="modal" data-target="#schedule"> <i class="fa fa-car" aria-hidden="true"></i> Schedule Test Drive </button>
      <button type="button" data-toggle="modal" data-target="#make_offer"> <i class="fa fa-money" aria-hidden="true"></i> Make an Offer </button>
      <button type="button" data-toggle="modal" data-target="#email_friend"> <i class="fa fa-envelope" aria-hidden="true"></i> Email to a Friend </button>
      <button type="button" data-toggle="modal" data-target="#more_info"> <i class="fa fa-file-text-o" aria-hidden="true"></i> Request More Info </button>
    </div>
  </div>
</section> -->

<!-- Filter-Form -->
<!-- <section id="filter_form" class="inner-filter gray-bg">
  <div class="container">
    <h3>Find Your Dream Car <span>(Easy search from here)</span></h3>
    <div class="row">
      <form action="#" method="get">
        <div class="form-group col-md-3 col-sm-6 black_input">
          <div class="select">
            <select class="form-control">
              <option value="">Select Location </option>
              <option value="">Location 1 </option>
              <option value="">Location 1 </option>
            </select>
          </div>
        </div>
        <div class="form-group col-md-3 col-sm-6 black_input">
          <div class="select">
            <select class="form-control">
              <option>Select Brand</option>
              <option>Audi</option>
              <option>BMW</option>
              <option>Nissan</option>
              <option>Toyota</option>
            </select>
          </div>
        </div>
        <div class="form-group col-md-3 col-sm-6 black_input">
          <div class="select">
            <select class="form-control">
              <option>Select Model</option>
              <option>Series 1</option>
              <option>Series 2</option>
              <option>Series 3</option>
            </select>
          </div>
        </div>
        <div class="form-group col-md-3 col-sm-6 black_input">
          <div class="select">
            <select class="form-control">
              <option>Year of Model </option>
              <option>2016</option>
              <option>2015</option>
              <option>2014</option>
            </select>
          </div>
        </div>
        <div class="form-group col-md-6 col-sm-6 black_input">
          <label class="form-label">Price Range ($)</label>
          <input id="price_range" type="text" class="span2" value="" data-slider-min="50" data-slider-max="6000" data-slider-step="5" data-slider-value="[1000,5000]"/>
        </div>
        <div class="form-group col-md-3 col-sm-6 black_input">
          <div class="select">
            <select class="form-control">
              <option>Type of Car </option>
              <option>New Car</option>
              <option>Used Car</option>
            </select>
          </div>
        </div>
        <div class="form-group col-md-3 col-sm-6">
          <button type="submit" class="btn btn-block"><i class="fa fa-search" aria-hidden="true"></i> Search Car </button>
        </div>
      </form>
    </div>
  </div>
</section> -->
<!-- /Filter-Form --> 

<!--Listing-detail-->
<section class="listing-detail">
  <div class="container">
    <div class="row">
      <div class="col-md-9">
        <div class="listing_images">
          <div id="listing_images_slider"  class="listing_images_slider">
          <?php foreach ($images as $image) { ?>
            <div class="slick_main_image"><img align="center" src="<?php echo SITE_URL; ?>uploads/vehicles/<?php echo $image; ?>" alt="image"></div>
          <?php } ?>            
          </div>
          <div id="listing_images_slider_nav" class="listing_images_slider_nav">
           <?php foreach ($images as $image) { ?>
            <div><img src="<?php echo SITE_URL; ?>uploads/vehicles/<?php echo $image; ?>" alt="image"></div>
          <?php } ?>

          </div>
        </div>
        <div class="main_features">
          <ul>
            <li> <i class="fa fa-tachometer" aria-hidden="true"></i>
              <h5><?php echo $data[0]['mileage'] ?></h5>
              <p>Total Kilometres</p>
            </li>
            <li> <i class="fa fa-calendar" aria-hidden="true"></i>
              <h5><?php echo $data[0]['year'] ?></h5>
              <p>Year</p>
            </li>
            <li> <i class="fa fa-registered" aria-hidden="true"></i>
              <h5><?php echo $condition[$data[0]['conditions']] ?></h5>
              <p>Condition</p>
            </li>
            <li> <i class="fa fa-cogs" aria-hidden="true"></i>
              <h5><?php echo $fuel_type[$data[0]['fuel_type']] ?></h5>
              <p>Fuel Type</p>
            </li>
            <li> <i class="fa fa-power-off" aria-hidden="true"></i>
              <h5><?php echo $transmission[$data[0]['transmission']] ?></h5>
              <p>Transmission</p>
            </li>
            <li> <i class="fa fa-superpowers" aria-hidden="true"></i>
              <h5><?php echo $data[0]['engine_capacity'] ?></h5>
              <p>Engine</p>
            </li>
            <li> <i class="fa fa-user-plus" aria-hidden="true"></i>
              <h5><?php echo $data[0]['seats'] ?></h5>
              <p>Seats</p>
            </li>
            <li> <i class="fa fa-car" aria-hidden="true"></i>
              <h5><?php echo $data[0]['vehicle_type_name'] ?></h5>
              <p>Body Type</p>
            </li>
            <li> <i class="fa fa-eyedropper" aria-hidden="true"></i>
              <h5><?php echo $data[0]['vehicle_color'] ?></h5>
              <p>Exterior Color</p>
            </li>
            <li> <i class="fa fa-eyedropper" aria-hidden="true"></i>
              <h5><?php echo $drive_type[$data[0]['drive_type']] ?></h5>
              <p>Drive Type</p>
            </li>
            
          </ul>
        </div>
        <div class="listing_more_info">
          <div class="listing_detail_wrap"> 
            <!-- Nav tabs -->
            <ul class="nav nav-tabs gray-bg" role="tablist">
             
              <li role="presentation" class="active"><a href="#features" aria-controls="features" role="tab" data-toggle="tab">Features</a></li>
              <li role="presentation"><a href="#vehicle-overview " aria-controls="vehicle-overview" role="tab" data-toggle="tab">Vehicle Overview </a></li>
              <!-- <li role="presentation"><a href="#contact" aria-controls="contact" role="tab" data-toggle="tab">Contact Us</a></li> -->
            </ul>
            
            <!-- Tab panes -->
            <div class="tab-content"> 
              <!-- vehicle-overview -->
              <!-- <div role="tabpanel" class="tab-pane active" id="vehicle-overview">
                <?php //echo $data[0]['description']; ?>
              </div> -->
              
                            <!-- Accessories -->
              <div role="tabpanel"  class="tab-pane active" id="features"> 
                <!--Accessories-->
                <table>
                  <thead>
                    <tr>
                      <th colspan="2">Features</th>
                    </tr>
                  </thead>
                  <tbody>
                  <?php foreach ($feature_ids as $id) {
                    foreach ($features as $feature) {
                    if($id==$feature['id']){ 
                  ?>
                    <tr>
                      <td><?php echo $feature['name']; ?></td>
                      <td><i class="fa fa-check" aria-hidden="true"></i></td>
                    </tr>
                  <?php
                      }
                    }
                    
                  } ?>
                    
                  </tbody>
                </table>
              </div>
              <!-- <div role="tabpanel" class="tab-pane" id="contact"> 
                <div class="comment_form">
                  <h6>Submit Enquiry</h6>
                  <form method="POST" name="vehicle-inquiry" id="vehicle-inquiry">
                    <div class="form-group">
                      <input type="text" class="form-control" name="vehicle_name" id="vehicle_name" readonly="readonly" value="<?php //echo strtoupper($data[0]['vehicle_manufacturer_name'].' '.$data[0]['vehicle_model_name']) ?>">
                      <input type="hidden" name="vehicle_id" = id="vehicle_id" value="<?php //echo $data[0]['id']; ?>">
                      <input type="hidden" name="vehicle_url" = id="vehicle_url" value="<?php //echo SITE_URL.'our-stock/'.$data[0]['seo_url']; ?>">
                      <input type="hidden" name="stock_type" = id="stock_type" value="0">
                    </div>
                    <div class="form-group">
                      <input type="text" class="form-control" name="name" id="name" placeholder="Your Name">
                    </div>
                    <div class="form-group">
                      <input type="text" class="form-control" name="email" id="email" placeholder="Email Address">
                    </div>
                    <div class="form-group">
                      <input type="text" class="form-control" name="phone" id="phone" placeholder="Phone Number">
                    </div>
                    <div class="form-group">
                      <textarea rows="5" class="form-control" name="message" id="message" placeholder="Message">I am interested in a price quote on this vehicle. Please contact me at your earliest convenience with your best price for this vehicle.</textarea>
                    </div>
                    <div class="form-group">
                      <input type="submit" id="submit_btn" class="btn" value="Submit Enquiry">
                    </div>
                    <div id="form_submit_msg"></div>
                  </form>
                </div>
              </div> -->
              <div role="tabpanel" class="tab-pane" id="vehicle-overview">
                <h6>Vehicle Overview</h6>
               <?php echo $data[0]['description']; ?>
              </div>
            </div>

            
          </div>
          
           <!--Vehicle-Video-->
          <!-- <div class="video_wrap">
            <h6>Watch Video </h6>
            <div class="video-box">
               <iframe class="mfp-iframe" src="https://www.youtube.com/embed/rqSoXtKMU3Q" allowfullscreen></iframe>
            </div>
         </div> -->
        
          <!--Comment-Form-->
          
          <!--/Comment-Form--> 
          
        </div>
      </div>
      
      <!--Side-Bar-->
      <aside class="col-md-3">
        <!-- <div class="sidebar_widget">
          <div class="widget_heading">
            <h5><i class="fa fa-calculator" aria-hidden="true"></i> Financing Calculator </h5>
          </div>
          <div class="financing_calculatoe">
            <form action="#" method="get">
              <div class="form-group">
                <label class="form-label">Vehicle Price ($)</label>
                <input class="form-control" type="text">
              </div>
              <div class="form-group">
                <label class="form-label">Down Price ($)</label>
                <input class="form-control" type="text">
              </div>
              <div class="form-group">
                <label class="form-label">Interest Rate</label>
                <div class="select">
                  <select class="form-control select">
                    <option>12%</option>
                    <option>13%</option>
                    <option>14%</option>
                    <option>15%</option>
                    <option>16%</option>
                    <option>17%</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Period in Years</label>
                <div class="select">
                  <select class="form-control">
                    <option>3 Year</option>
                    <option>4 Year</option>
                    <option>5 Year</option>
                    <option>6 Year</option>
                    <option>7 Year</option>
                    <option>8 Year</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <button type="submit" class="btn btn-block">Calcuate</button>
              </div>
            </form>
          </div>
        </div> -->
        <div class="sidebar_widget">
          <div class="widget_heading">
            <h5><i class="fa fa-address-card-o" aria-hidden="true"></i> Dealer Information </h5>
          </div>
          <div class="dealer_detail">
            <p><span>Address :</span> No 81, Barnes Place, Colombo 07</p>
            <p><span>Email :</span> contact@example.com</p>
            <p><span>Phone :</span> +61-1234-5678-09</p>
            
          </div>
        </div>
        <div class="sidebar_widget">
          <div class="widget_heading">
            <h5><i class="fa fa-envelope" aria-hidden="true"></i> Request More Info</h5>
          </div>
          <form method="POST" name="vehicle-inquiry" id="vehicle-inquiry">
                    <div class="form-group">
                      <input type="text" class="form-control" name="vehicle_name" id="vehicle_name" readonly="readonly" value="<?php echo strtoupper($data[0]['vehicle_manufacturer_name'].' '.$data[0]['vehicle_model_name']) ?>">
                      <input type="hidden" name="vehicle_id" = id="vehicle_id" value="<?php echo $data[0]['id']; ?>">
                      <input type="hidden" name="vehicle_url" = id="vehicle_url" value="<?php echo SITE_URL.'our-stock/'.$data[0]['seo_url']; ?>">
                      <input type="hidden" name="stock_type" = id="stock_type" value="0">
                    </div>
                    <div class="form-group">
                      <input type="text" class="form-control" name="name" id="name" placeholder="Your Name">
                    </div>
                    <div class="form-group">
                      <input type="text" class="form-control" name="email" id="email" placeholder="Email Address">
                    </div>
                    <div class="form-group">
                      <input type="text" class="form-control" name="phone" id="phone" placeholder="Phone Number">
                    </div>
                    <div class="form-group">
                      <textarea rows="5" class="form-control" name="message" id="message" placeholder="Message">I am interested in a price quote on this vehicle. Please contact me at your earliest convenience with your best price for this vehicle.</textarea>
                    </div>
                    <div class="form-group">
                      <input type="submit" id="submit_btn" class="btn" value="Submit Enquiry">
                    </div>
                    <div id="form_submit_msg"></div>
                  </form>
        </div>
      </aside> 
      <!--/Side-Bar--> 
      
    </div>
    <div class="space-20"></div>
    <div class="divider"></div>
    
    <!--Similar-Cars-->
    <div class="similar_cars">
      <h3>Similar Vehicles</h3>
      <div class="row">
      <?php foreach ($similar_cars as $car) { 
        $img_sim_arr = explode(',', $car['images']);
      ?>
        
      
        <div class="col-md-3 grid_listing">
          <div class="product-listing-m gray-bg">
            <div class="product-listing-img"> <a href="<?php echo SITE_URL; ?>our-stock/<?php echo $car['seo_url']; ?>"><img src="<?php echo SITE_URL; ?>uploads/vehicles/<?php echo $img_sim_arr[0]; ?>" class="img-responsive" alt="image" /> </a>
              <div class="label_icon"><?php echo $condition[$car['conditions']]; ?></div>
              <div class="compare_item">
                <div class="checkbox">
                  <input type="checkbox" value="" onclick="addToCompareLocal(<?php echo $car['id']; ?>,'compare_<?php echo $car['id']; ?>')" id="compare_<?php echo $car['id']; ?>" type="checkbox" <?php echo (in_array($car['id'], $compare_list))?'checked="checked"':''; ?>>
                  <label for="compare_<?php echo $car['id']; ?>">Compare</label>
                </div>
              </div>
            </div>
            <div class="product-listing-content">
              <h5><a href="<?php echo SITE_URL; ?>our-stock/<?php echo $car['seo_url']; ?>"><?php echo $car['vehicle_manufacturer_name'].' '.$car['vehicle_model_name'] ; ?></a></h5>
              <!--<p class="list-price">$89,000</p>
              <div class="car-location"><span><i class="fa fa-map-marker" aria-hidden="true"></i> Colorado, USA</span></div>-->
              <ul class="features_list">
                <li><i class="fa fa-road" aria-hidden="true"></i><?php echo $car['mileage'] ?></li>
                <li><i class="fa fa-tachometer" aria-hidden="true"></i><?php echo $car['engine_capacity'] ?></li>
                <li><i class="fa fa-calendar" aria-hidden="true"></i><?php echo $car['year'] ?></li>
                <li><i class="fa fa-car" aria-hidden="true"></i><?php echo $fuel_type[$car['fuel_type']]; ?></li>
              </ul>
            </div>
          </div>
        </div>
        <?php } ?>
        
        
      </div>
    </div>
    <!--/Similar-Cars--> 
    
  </div>
</section>
<!--/Listing-detail--> 

<?php include(DOC_ROOT.'includes/footer.php'); ?>
<script type="text/javascript">
    $(document).ready(function(){
        
        
        $("#vehicle-inquiry").validate({
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
                            required: "<span class='text-danger'>Please enter your mobile number.</span>",
                    },
                
            },
            submitHandler: function () {

              var url_data = $('#vehicle-inquiry').serialize(); console.log(url_data);

              $('#submit_btn').attr('disabled','disabled');
              $("#submit_btn").html('Please Wait...');

              $.ajax({
                 type: 'POST',
                 url: '<?php echo SITE_URL?>system/controllers/frontend_controller.php',
                 data: "&action=vehicleEnquiry&"+url_data,
                 success: function(res) {
                    $('#submit_btn').removeAttr('disabled');
                    $("#submit_btn").html('Submit Enquiry');
                    
                    if($.trim(res)==200){
                      clearFormFieldsFront("#vehicle-inquiry");
                      showFrontFormMessage('#form_submit_msg','success',{message:'Successfully Sent.'});
                    }else{
                      showFrontFormMessage('#form_submit_msg','error',{message:'Something went wrong. Please try again.'});
                    }
                   /* if($.trim(res)==200){
                      clearFormFieldsFront("#enquiry_form");
                     // window.location = "<?php //echo SITE_URL; ?>thankyou.php";
                      $('#form_submit_msg').html('<p class="alert alert-success"> Message hass been sent successfully</p>');
                      //setTimeout(function(){ window.location = "<?php //echo SITE_URL; ?>thankyou.php" },3000);
                    }else{
                      $('#form_submit_msg').html('<p class="alert alert-danger"> Something wrong. Please try again.</p>');
                    }*/
                    //$('#form_submit_msg').hide(3000);
                 },
              });
        
            }

        }); 

        jQuery.validator.addMethod("startwithzero", function (value, element) {
              return this.optional(element) || /(^[0a-zA-Z].{9})$/.test(value);
        }, "Your mobile number should start with 0.");
         
    });

    
        

</script>
<?php  
$vehicles = new Vehicle();
$latest_cars = $vehicles->getLatestCars();
?>
<div class="sidebar_widget sell_car_quote">
  <div class="white-text div_zindex text-center">
    <h3>Auto Auction Cars</h3>
    <p>Request a quote from auto auction now!</p>
    <a href="<?php echo SITE_URL; ?>my-account/live-auction-request.php" class="btn">Request a Quote <span class="angle_arrow"><i class="fa fa-angle-right" aria-hidden="true"></i></span></a> </div>
  <div class="dark-overlay"></div>
</div>
<div class="sidebar_widget">
  <div class="widget_heading">
    <h5><i class="fa fa-car" aria-hidden="true"></i> Recent Cars from Our Stock</h5>
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
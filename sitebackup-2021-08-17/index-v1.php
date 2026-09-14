<?php
require_once( 'system/config.php' );

$vehicles = new Vehicle();
$featured_cars = $vehicles->getFeaturedCarsForHome();

$latest = Vehicle::getIsLatest();
$transmission = Vehicle::getTransmissionData();
$condition = Vehicle::getCondition();
$drive_type = Vehicle::getDriveType();
$fuel_type = Vehicle::getFuelType();

$manufacturer = new vehicleManufacturer();
$manufacturer_data = $manufacturer->selectAllActive();
$compare_list = Sessions::getCompareVehiclesLocal();

$models = new VehicleModel();
$all_models = $models->selectAllActive();

$years = $vehicles->getYears();

$colors = new vehicleColor();
$colors_data = $colors->selectAllActive();
?>
<!DOCTYPE HTML>


	<html lang="en" itemscope itemtype="https://schema.org/WebPage">
	<head>
	    	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

		<meta http-equiv="Content-Type" content="text/html; charset=euc-jp">
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


		<!--Banner-->
		<section id="banner2">
			<div id="carousel-example-generic" class="carousel slide" data-ride="carousel">
				<!-- Wrapper for slides -->
				<div class="carousel-inner">
					<!--item-1-->
					<div class="item active">
						<img src="images/Select-2.jpg" alt="image">
						<div class="carousel-caption">
							<div class="banner_text text-center div_zindex white-text">
								<h1>Making your dream car a reality - is our passion! </h1>
								<h3>Offering more than a thousand choices. </h3>
								<!-- <a href="#" class="btn">Read More</a> -->
							</div>
						</div>
					</div>



					<!--item-2-->
					<div class="item">
						<img src="images/Select-3.jpg" alt="image">
						<div class="carousel-caption">
							<div class="banner_text text-center div_zindex white-text">
								<h1>Count on us - The best choice is guaranteed!</h1>
								<h3>Offering more than a thousand choices. </h3>
								<!-- <a href="#" class="btn">Read More</a> -->
							</div>
						</div>
					</div>

					<!--item-3-->
					<div class="item">
						<img src="images/select-4.jpg" alt="image">
						<div class="carousel-caption">
							<div class="banner_text text-center div_zindex white-text">
								<h1>Trust & transparency guaranteed! </h1>
								<h3>Offering more than a thousand choices. </h3>
								<!-- <a href="#" class="btn">Read More</a> -->
							</div>
						</div>
					</div>
				</div>

				<!-- Controls -->
				<a class="left carousel-control" href="#carousel-example-generic" role="button" data-slide="prev">
					<div class="icon-prev"></div>
				</a>
				<a class="right carousel-control" href="#carousel-example-generic" role="button" data-slide="next">
					<div class="icon-next"></div>
				</a>
			</div>
		</section>
		<!--/Banner-->


		<!-- Filter-Form -->
		<section id="filter_form2">
			<div class="container">
				<ul class="nav nav-tabs home-tabs">
					<li class="active"><a href="#local" data-toggle="tab">Our Stock</a>
					</li>
					<li><a href="<?php echo SITE_URL ?>live-auction/">Auto Auction</a>
					</li>

				</ul>
				<div id="myTabContent" class="tab-content">
					<div class="tab-pane" id="live">
						<div class="white_bg black-text">
							<h3>Login/register to request Auto Auction Data</h3>
							<div class="row">

								<form method="post" name="login_form" id="login_form">
									<div class="form-group col-md-3 col-sm-6">
										<input type="text" class="form-control" name="email" id="email" placeholder="Email address*">
									</div>
									<div class="form-group col-md-3 col-sm-6">
										<input type="password" class="form-control" name="password" id="password" placeholder="Password*">
									</div>
									<!-- <div class="form-group checkbox">
                  <input type="checkbox" id="remember">
                  <label for="remember">Remember Me</label>
                </div> -->
									<div class="form-group col-md-3 col-sm-6">
										<input type="submit" id="login_btn" value="Login" class="btn btn-block">
									</div>
									<div class="form-group col-md-3 col-sm-6">
										<button type="button" id="register" value="Register" onclick="window.location.href = http_path + 'my-account/register.php?live_auction=true'" class="btn btn-block">Register</button>
									</div>

								</form>
								<div id="form_submit_msg"></div>
								<!-- <form id="search_vehicles_live_home" name="search_vehicles_live_home" action="<?php echo SITE_URL ?>live-auction/" method="get">
                
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
                
                <div class="form-group col-md-3 col-sm-6 pull-right">
                  <button type="submit" class="btn btn-block"><i class="fa fa-search" aria-hidden="true"></i> Search </button>
                </div>
              </form> -->
							</div>
						</div>
					</div>

					<div class="tab-pane active in" id="local">
						<div class="white_bg black-text">
							<h3>Find your vehicle from Our Stock</h3>
							<div class="row">
								<form id="search_vehicles_local_home" name="search_vehicles_local_home" action="<?php echo SITE_URL ?>our-stock/" method="get">
									<div class="form-group col-md-2 col-sm-6">
										<div class="select">
											<select class="form-control" id="manufacturer" name="manufacturer" onchange="loadModelsLocal(this.value)">
												<option value="">Select Make</option>
												<?php foreach ($manufacturer_data as $data) { ?>
												<option value="<?php echo $data['id']; ?>">
													<?php echo $data['name']; ?>
												</option>
												<?php }?>
											</select>
										</div>
									</div>
									<div class="form-group col-md-2 col-sm-6">
										<div class="select">
											<select class="form-control" name="model" id="model" onchange="loadYearLocal('',this.value)">
												<option value="">Select Model</option>
												<?php foreach ($all_models as $data) { ?>
												<option value="<?php echo $data['id']; ?>">
													<?php echo $data['name']; ?>
												</option>
												<?php }?>
											</select>
										</div>
									</div>
									<div class="form-group col-md-2 col-sm-6">
										<div class="select">
											<select class="form-control" name="year" id="year" onchange="loadColoursLocal()">
												<option value="">From Year</option>
												<?php foreach ($years as $data) { ?>
												<option value="<?php echo $data['year']; ?>">
													<?php echo $data['year']; ?>
												</option>
												<?php }?>
											</select>
										</div>
									</div>
									<div class="form-group col-md-2 col-sm-6">
										<div class="select">
											<select class="form-control" name="to_year" id="to_year" onchange="loadColoursLocal()">
												<option value="">To Year</option>
												<?php foreach ($years as $data) { ?>
												<option value="<?php echo $data['year']; ?>">
													<?php echo $data['year']; ?>
												</option>
												<?php }?>
											</select>
										</div>
									</div>
									<div class="form-group col-md-2 col-sm-6">
										<div class="select">
											<select class="form-control" name="color" id="color">
												<option value="">Select Colour</option>
												<?php foreach ($colors_data as $data) { ?>
												<option value="<?php echo $data['id']; ?>">
													<?php echo $data['name']; ?>
												</option>
												<?php }?>
											</select>
										</div>
									</div>
									<div class="form-group col-md-2 col-sm-6 buttons">
										<button type="submit" class="btn btn-icon"><i class="fa fa-search" aria-hidden="true"></i></button>
										<button type="button" onclick="clearFormFieldsFront('#search_vehicles_local_home')" class="btn btn-icon"><i class="fa fa-refresh" aria-hidden="true"></i></button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
		<!-- /Filter-Form -->

		<!--Featured Car-->
		<section class="section-padding">
			<div class="container">
				<div class="section-header text-center">
					<h2>Featured Vehicles</h2>
					<!-- <p>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. </p> -->
				</div>
				<div class="row">
					<div id="featured-car-slider">

						<?php foreach ($featured_cars as $car) { 
          $images = explode(',', $car['images']);
          $in_compare_list = false;
          if(in_array($car['id'], $compare_list)){
            $in_compare_list = true;
          }
        ?>

						<div class="featured-car-list">
							<div class="featured-car-img"> <a href="<?php echo SITE_URL; ?>our-stock/<?php echo $car['seo_url']; ?>"><img src="<?php echo SITE_URL; ?>uploads/vehicles/<?php echo $images[0]; ?>" class="img-responsive" alt="Image"></a>
								<div class="label_icon">
									<?php echo $condition[$car['conditions']]; ?>
								</div>
								<div class="compare_item">
									<div class="checkbox">
										<input type="checkbox" value="" onclick="addToCompareLocal(<?php echo $car[0]['id']; ?>,'compare_<?php echo $car[0]['id']; ?>')" id="compare_<?php echo $car['id']; ?>" <?php echo ($in_compare_list)? 'checked="checked"': ''; ?>>
										<label for="compare_<?php echo $car['id']; ?>">Compare</label>
									</div>
								</div>
							</div>
							<div class="featured-car-content">
								<h6><a href="<?php echo SITE_URL; ?>our-stock/<?php echo $car['seo_url']; ?>"><?php echo $car['vehicle_manufacturer_name'].' '.$car['vehicle_model_name']; ?></a></h6>
								<!-- <div class="price_info">
              <p class="featured-price">$90,000</p>
              <div class="car-location"><span><i class="fa fa-map-marker" aria-hidden="true"></i> Colorado, USA</span></div>
            </div> -->
								<ul>
									<li><i class="fa fa-road" aria-hidden="true"></i>
										<?php echo $car['mileage'] ?>
									</li>
									<li><i class="fa fa-tachometer" aria-hidden="true"></i>
										<?php echo $car['engine_capacity'] ?>
									</li>
									<li><i class="fa fa-calendar" aria-hidden="true"></i>
										<?php echo $car['year'] ?>
									</li>
									<li><i class="fa fa-car" aria-hidden="true"></i>
										<?php echo $fuel_type[$car['fuel_type']] ?>
									</li>
									<li><i class="fa fa-user" aria-hidden="true"></i>
										<?php echo $car['seats'] ?>
									</li>
									<li><i class="fa fa-superpowers" aria-hidden="true"></i>
										<?php echo $transmission[$car['transmission']]; ?>
									</li>
								</ul>
							</div>
						</div>
						<?php } ?>

					</div>
				</div>
			</div>
		</section>
		<!-- /Featured Car-->

		<!--About-us-->
		<section id="about_us" class="section-padding">
			<div class="container">
				<div class="section-header text-center">
					<h2>Why <span>Choose directautoimport.lk</span></h2>
					<h4>We keep it simple, candid and real…</h4>
					<p>Importing cars directly from Japan is a new concept for many, but we never exploit your inexperience in this subject. Our main mission is to make sure that you have the right knowledge and experience and then let you take advantage of the opportunities. </p>

				</div>

				<div class="row">
					<div class="col-md-4 col-sm-6">
						<div class="about_info">
							<div class="icon_box">
								<i class="fa fa-money" aria-hidden="true"></i>
							</div>
							<h5>Right choices! Best price!</h5>
							<p>We want our clients to make the right choices because your success is our success. We never let you buy a vehicle that is not right for you. We believe in meeting your goals and aspirations. We have no hidden fees and we offer the best prices.</p>
						</div>
					</div>

					<div class="col-md-4 col-sm-6">
						<div class="about_info">
							<div class="icon_box">
								<i class="fa fa-thumbs-o-up" aria-hidden="true"></i>
							</div>
							<h5>Honesty! Transparency!! Trust!!!</h5>
							<p>Your trust is our key to success. We have been in business for many years with loyal clients. Our integrity is our defining factor. We carefully select only the best quality vehicles and the original auction sheet will be shared with the English translation prior to every bidding. </p>
						</div>
					</div>

					<div class="col-md-4 col-sm-6">
						<div class="about_info">
							<div class="icon_box">
								<i class="fa fa-history" aria-hidden="true"></i>
							</div>
							<h5>Faster and Complete Service</h5>
							<p>We understand your busy schedule and our team will guide and handle the entire process of purchasing your dream vehicle. The excellent reviews and recommendations from our clients over the years bears testimony to our service that we have extended to our client.</p>
						</div>
					</div>


				</div>
			</div>
		</section>
		<!--/About-us-->

		<!-- Why-Choose-Us-->
		<section id="services" class="why_choose_us section-padding gray-bg">
			<div class="container">
				<div class="section-header text-center">
					<h2>How <span>to buy</span></h2>
					<p>The entire process could be monitored through your Login/Register Account on this website. It is very easy and straight forward with no hidden chargers. </p>
				</div>

				<div class="row">
					<div class="col-md-5th-1 col-sm-4 col-md-offset-0 col-sm-offset-2">
						<div class="about_info">
							<!-- <img src="<?php echo SITE_URL; ?>images/how-to-buy/1.jpg"> -->
							<div class="icon_box">

								<i class="fa fa-car" aria-hidden="true"></i>
							</div>
							<h5>1. <span>Selecting your vehicle</span></h5>
							<p>First, we learn your needs...</p>
							<button type="button" class="btn btn-default" data-container="body" data-toggle="popover" data-trigger="focus" data-html="true" data-placement="top" data-title="Selecting your vehicle" data-content="First, we take time to discuss with you and identify the type of vehicle suited to your needs. Our expert professional team strives to make the right choice and best price for you by reviewing a large database from reputed auction houses. Through this mutual collaboration we take all steps to source your dream vehicle through our  established connections and exclusive deals with the auctions.">
             More
            </button>
						

							<!-- <p>First, we learn your needs. Our expert professional team really eager to make right choice and best price for you by reviewing a large database reputed auction houses .This mutual collaboration leads to plan your dream vehicle and we together establish a good relationship and exclusive deals with the auctions. </p> -->
						</div>
					</div>
					<div class="col-md-5th-1 col-sm-4">
						<div class="about_info">
							<div class="icon_box">
								<i class="fa fa-gavel" aria-hidden="true"></i>
							</div>
							<h5>2. <span>Bid on your Vehicle</span></h5>
							<p>We start your bidding process after making...</p>
							<button type="button" class="btn btn-default" data-container="body" data-toggle="popover" data-trigger="focus" data-html="true" data-placement="top" data-title="Bidding for your vehicle at the auction" data-content="We start your bidding process after making an initial 100% refundable deposit. Our team searches your desired vehicle and submits a bidding request i.e. Original Auction sheet along with English translation, photos of the vehicle, bid amount etc.  for your approval. Our team continues to support the bidding process in the auction until your bid is successful.  We assure to pass the benefits to you if the selling price of your vehicle is less than your bid.">
             More
            </button>
						
							<!-- <p>We start your bidding process after making an initial refundable deposit. Our team searches your desired vehicle and submits a bidding request i.e Original Auction sheet along with English translate, photos of the vehicle,  bid amount etc.  for your approval. Our team continues to support your auction process until your bid is successful.  We assure to pass the benefits if the sold price of your vehicle is less than your bid. </p> -->
						</div>
					</div>
					<div class="col-md-5th-1 col-sm-4">
						<div class="about_info">
							<div class="icon_box">
								<i class="fa fa-money" aria-hidden="true"></i>
							</div>
							<h5>3. <span>Payment</span></h5>
							<p>The letter of credit (LC) payment is to be made within 07 days...</p>
							<button type="button" class="btn btn-default" data-container="body" data-toggle="popover" data-trigger="focus" data-html="true" data-placement="top" data-title="Payment" data-content="<b>The letter of credit (LC)</b> payment can be made within 07 days from the date of the pro-forma invoice. Our team will assist you through the  entire process i.e. required documents for the Bank for LC opening (Pro-forma/conditions, etc.), and any other assistance as and when required.">
             More
            </button>
						
							<!-- <p>The letter of credit (LC) payment is to be made within 07 days from the date of proforma invoice. Our team will assist for entire process ie; required documents for the Bank for LC opening (Proforma/conditions, etc), and any other assist when it is required. </p> -->
						</div>
					</div>
					<div class="col-md-5th-1 col-sm-4">
						<div class="about_info">
							<div class="icon_box">
								<i class="fa fa-ship" aria-hidden="true"></i>
							</div>
							<h5>4. <span>Shipping</span></h5>
							<p>Vehicle clearance documentation i.e.: LC documents...</p>
							<button type="button" class="btn btn-default" data-container="body" data-toggle="popover" data-trigger="focus" data-html="true" data-placement="top" data-title="Shipping" data-content="Vehicle clearance documentation i.e.: LC documents, custom duty etc. could be handled by a nominated third party clearance agent who will be guided by us. <br>The third-party charges i.e. customs duty & levy, clearance chargers will be informed to you and it has to be paid directly to the relevant parties’ i.e. customs duty to the Sri Lanka customs.<br>If this shipping is handled by your own agent, all the documents will be handed over to you from the Bank.">
             More
            </button>
						
							<!-- <p>The shipping schedule will be notified to you after completion of the LC and all the documentations i.e: export certificates, vehicle inspections etc. In generally this would take 20 days after loading the vehicle into vessel. However, the arrival date could be deviated due to the unavoidable circumstance. </p> -->
						</div>
					</div>
					<div class="col-md-5th-1 col-sm-4">
						<div class="about_info">
							<div class="icon_box">
								<i class="fa fa-handshake-o" aria-hidden="true"></i>
							</div>
							<h5>5. <span>Order & Delivery Time</span></h5>
							<p>The total process would take 30 - 45 days...</p>
							<button type="button" class="btn btn-default" data-container="body" data-toggle="popover" data-trigger="focus" data-html="true" data-placement="top" data-title="Order & Delivery Tim" data-content="The total process would take 30 - 45 days from the date of opening LC. However, it could vary dependent on the shipment schedules and any other unforeseen circumstances.<br>Why we need a deposit?<br>First of all, the deposits are 100% refundable. We require a deposit to ensure both the security of the user and to ensure that that there will be no last minute cancellations of an auction bid or any fake or spam bid request.<br>As a service to our customers, we will save you the hassle of waiting and bidding yourselves.  This means we will be using our resources to bid and pay for the car that you have requested. Thus we require our customers to make a deposit to ensure that the requests made are genuine.">
             More
            </button>
						
							<!--<p>Vehicle clearance all the documentations i.e: LC documents, custom duty etc. on arrivals could be handled by nominated third party clearance agent which guided by us. 
The third party charges i.e customs duty & levy, clearance chargers will be informed to you and it has to be paid directly to the relevant parties’ i.e.: customs duty to the Sri Lanka customs.
If this step handles by your own agent, all the documents will be handed over to you  from the Bank. 
Time: The total process would take 30- 45 days in generally from the date of opening LC. However it could be vary on shipment schedules and due to unavoidable circumstances. 
</p> -->
						</div>
					</div>
					<!-- <div class="column col-md-2 col-sm-6">
              <div class="about_info">
                    <div class="icon_box">
                        <i class="fa fa-money" aria-hidden="true"></i>
                    </div>
                    <h5>Select Your Vehicle</h5>
                    <p>First, we learn your needs. Our expert professional team really eager to make right choice and best price for you by reviewing a large database reputed auction houses .This mutual collaboration leads to plan your dream vehicle and we together establish a good relationship and exclusive deals with the auctions. </p>
                </div>
            </div>
            
            <div class="column col-md-2 col-sm-6">
              <div class="about_info">
                    <div class="icon_box">
                        <i class="fa fa-thumbs-o-up" aria-hidden="true"></i>
                    </div>
                    <h5>Bid on your Vehicle</h5>
                    <p>We start your bidding process after making an initial refundable deposit. Our team searches your desired vehicle and submits a bidding request i.e Original Auction sheet along with English translate, photos of the vehicle,  bid amount etc.  for your approval. Our team continues to support your auction process until your bid is successful.  We assure to pass the benefits if the sold price of your vehicle is less than your bid. </p>
                </div>
            </div>
            
            <div class="column col-md-2 col-sm-6">
              <div class="about_info">
                    <div class="icon_box">
                        <i class="fa fa-money" aria-hidden="true"></i>
                    </div>
                    <h5>Pay</h5>
                    <p>The letter of credit (LC) payment is to be made within 07 days from the date of proforma invoice. Our team will assist for entire process ie; required documents for the Bank for LC opening (Proforma/conditions, etc), and any other assist when it is required. </p>
                </div>
            </div>
            
            <div class="column col-md-2 col-sm-6">
              <div class="about_info">
                    <div class="icon_box">
                        <i class="fa fa-users" aria-hidden="true"></i>
                    </div>
                    <h5>Shipping</h5>
                    <p>The shipping schedule will be notified to you after completion of the LC and all the documentations i.e: export certificates, vehicle inspections etc. In generally this would take 20 days after loading the vehicle into vessel. However, the arrival date could be deviated due to the unavoidable circumstance. </p>
                </div>
            </div>

            <div class="column col-md-2 col-sm-6">
              <div class="about_info">
                    <div class="icon_box">
                        <i class="fa fa-users" aria-hidden="true"></i>
                    </div>
                    <h5>Customer Clearance</h5>
                    <p>Vehicle clearance all the documentations i.e: LC documents, custom duty etc. on arrivals could be handled by nominated third party clearance agent which guided by us. 
The third party charges i.e customs duty & levy, clearance chargers will be informed to you and it has to be paid directly to the relevant parties’ i.e.: customs duty to the Sri Lanka customs.
If this step handles by your own agent, all the documents will be handed over to you  from the Bank. 
Time: The total process would take 30- 45 days in generally from the date of opening LC. However it could be vary on shipment schedules and due to unavoidable circumstances. 
 </p>
                </div>
            </div> -->
				</div>
				<!-- <div class="space-40"></div>
        <div class="row">
          <div class="text-center">
            <a href="<?php echo SITE_URL; ?>how-to-buy/" class="btn">Read More <span class="angle_arrow"><i class="fa fa-angle-right" aria-hidden="true"></i></span></a>
          </div>
        </div> -->
			</div>
		</section>
		<!-- /Why-Choose-Us-->

		<section id="testimonial" class="section-padding">
			<div class="container div_zindex">
				<div class="section-header text-center">
					<h2>What Our Customers Say</h2>
					<p>Customers are the lifeblood of our business. There’s no better way to understand them than sharing their own experiences … </p>
				</div>
				<div class="row">
					<div id="testimonial-slider-2">
						<div class="testimonial_wrap">
							<div class="testimonial-img">
								<img src="<?php echo SITE_URL; ?>images/7.jpg" alt="image">
							</div>
							<div class="testimonial-heading">
								<h5>Mrs. Thilini Karalliyadda</h5>
								<span class="client-designation">Bank of Ceylon (BOC) - Kegalle Branch</span>
							</div>
							<p>Very friendly and professional service. I wanted to import a used average car but ended up buying a Brand-new Suzuki Baleno XT along with the latest advanced options for the similar budget. Got a fabulous solution and positive experience. Thanks to the team for dealing with all the processes involved in buying a new car :) Happy to recommend this dealership.</p>
						</div>

						<div class="testimonial_wrap">
							<div class="testimonial-img">
								<img src="<?php echo SITE_URL; ?>images/6.jpg" alt="image">
							</div>
							<div class="testimonial-heading">
								<h5>Virajitha M. Bandara from Peradeniya </h5>
								<span class="client-designation">Engineer -CEB Norochchole (virajitham7@gmail.com)</span>
							</div>
							<p>directautoimport.lk enables us to purchase any vehicle online today. This virtual direct deal of Toyota Corolla Toyota Axio G NKE 165 car by eliminating middleman made a considerable saving. Absolutely recommend their excellent service and treatment and I have already planned to buy my second vehicle through them.</p>
						</div>

						<div class="testimonial_wrap">
							<div class="testimonial-img">
								<img src="<?php echo SITE_URL; ?>images/3.jpg" alt="image">
							</div>
							<div class="testimonial-heading">
								<h5>Sashen Jayasooriya</h5>
								<span class="client-designation">Area Engineer at NWS&DB (jayasooriyabpj@gmail.com)</span>
							</div>
							<p>I was happy with the service at directautoimort.lk because I had a great experience. The imported MITSUBISHI OUTLANDER was in Brand new condition which was beyond my expectations. Thanks for the team. I never hesitate to recommend this place who over deliver what they promised.</p>
						</div>

						<div class="testimonial_wrap">
							<div class="testimonial-img">
								<img src="<?php echo SITE_URL; ?>images/1.jpg" alt="image">
							</div>
							<div class="testimonial-heading">
								<h5>Dr. Roshan Gajadeera</h5>
								<span class="client-designation">The National Hospital (Cardiologist Unit) - Colombo (0711866560) </span>
							</div>
							<p>The experience at directautoimort.lk was positive and fantastic whilst making the difficult decision of choosing the right car, made easy. It was all about finding me the right solution which was the brand-new quality Toyota Premio EX for my needs. 10/10 from me. I never hesitate to recommend them for any professional whom known to me from the childhood.</p>
						</div>

						<div class="testimonial_wrap">
							<div class="testimonial-img">
								<img src="<?php echo SITE_URL; ?>images/2.jpg" alt="image">
							</div>
							<div class="testimonial-heading">
								<h5>ජනක  කරුණාරත්න - අනුරාධපුර</h5>
								<span class="client-designation">janakakaru83@gmail.com</span>
							</div>
							<p>මම directautoimport.lk එකට යනකොට , මගේ නමටම වාහනයක් ගෙන්න ගැනීම ගැන ලොකු බලාපොරොතුවක් තිබුනේ නැහැ . මගේ යාලුවෙක් කීව නිසා ගියා . නමුත් directautoimort.lk මටතිබුන බය නැති කලා පමණක් නොව , මට ඕනම Wagon R Stingray රථය ගෙනත් දුන්න . මට කියන්න තියෙන්නේ ඔබ‍ට ලියකියවිලි හෝ බැංකු කටයුතු ගැන බයක් ඇත්නම් හෝ දැණුමක් නැත්නම්, විශ්වාශයෙන් යන්න . ඕන වාහනය කිව්වම , අනෙක් සියලුම දේවල් ඔවුන් කරනවා . මට අඩු ගාණකට අලුත්ම වාහනයක් ගන්න පුළුවන් වුනා.</p>
						</div>

						<div class="testimonial_wrap">
							<div class="testimonial-img">
								<img src="<?php echo SITE_URL; ?>images/5.jpg" alt="image">
							</div>
							<div class="testimonial-heading">
								<h5>Udesh Karavita</h5>
								<span class="client-designation">Superintend- CEB from Karapitiya , Galle (0714 291 064)</span>
							</div>
							<p>The team at directautoimport.lk was attentive throughout my buying experience and the price of the car (Suziki Wagon R Stingray) was competitive. They explained everything and was professional and friendly, no complaints whatsoever. I am a loyal customer and already recommended them to a few of my friends and relations. Apparently, their experiences at directautoimport.lk were great with fantastic customer service.</p>
						</div>

						<div class="testimonial_wrap">
							<div class="testimonial-img">
								<img src="<?php echo SITE_URL; ?>images/4.jpg" alt="image">
							</div>
							<div class="testimonial-heading">
								<h5>Dr. Nilan Sanjeewa</h5>
								<span class="client-designation">MOH: Tangalle (mohofficeangunakolapelessa@gmail.com)</span>
							</div>
							<p>My experience at direcautotimport.lk was cracking because they made us feel comfortable and answered all our questions. Team spent time to explained different options available to us. More gratefully, the team was clearly value our professional time. Everything went smoothly and quickly. I would like to recommend them, if you wish to have a much more pleasant and professional experience.</p>
						</div>
					</div>
				</div>
			</div>

		</section>
		<!-- /Testimonial-->

		<?php include(DOC_ROOT.'includes/footer.php'); ?>
		<script type="text/javascript">
			$( document ).ready( function () {
				//loadAuctionDaysLive();
				//loadManufacturerLive();
			} );
		</script>

		<script type="text/javascript">
			$( document ).ready( function () {


				$( "#login_form" ).validate( {
					rules: {
						email: {
							required: true,
							email: true,
						},
						password: {
							required: true,
						}

					},
					messages: {
						email: {
							required: "<span class='text-danger'>Please enter email address.</span>",
							email: "<span class='text-danger'>Please enter a valid email address.</span>",
						},
						password: {
							required: "<span class='text-danger'>Please enter your password.</span>",
						}

					},
					submitHandler: function () {

						var url_data = $( '#login_form' ).serialize();
						console.log( url_data );

						$( '#submit_btn' ).attr( 'disabled', 'disabled' );
						$( "#submit_btn" ).val( 'Please Wait...' );

						$.ajax( {
							type: 'POST',
							url: '<?php echo SITE_URL?>system/controllers/frontend_controller.php',
							data: "&action=customerLogin&" + url_data,
							success: function ( res ) {
								if ( $.trim( res ) == 200 ) {
									clearFormFieldsFront( "#login_form" );
									showFrontFormMessage( '#form_submit_msg', 'success', {
										message: 'Login Success.. Redirecting'
									} );
									setTimeout( function () {
										window.location.href = http_path + 'my-account/live-auction-request.php'
									}, 3000 );

								} else {
									showFrontFormMessage( '#form_submit_msg', 'error', {
										message: 'Username Or Password Incorrect'
									} );
								}
								$( '#submit_btn' ).removeAttr( 'disabled' );
								$( "#submit_btn" ).val( 'Login' );

							},
						} );

					}

				} );

			} );
		</script>
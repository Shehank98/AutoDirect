<?php 

require_once '../config.php';

$action = strip_tags($_POST['action']); 

switch ($action) {

	case 'vehicleEnquiry':
		vehicleEnquiry();
		break;

  case 'newsletterSubscribe':
    newsletterSubscribe();
    break;

  case 'contactFormSumbission':
    contactFormSumbission();
    break;

  case 'customerLogin':
    customerLogin();
    break;

  case 'customerRegistration':
    customerRegistration();
    break;

  case 'liveInquiry':
    liveInquiry();
    break;

	case 'searchVehicles':
		searchVehicles();
		break;

  case 'addToCompareLocal':
    addToCompareLocal();
    break;

  case 'removeFromCompareLocal':
    removeFromCompareLocal();
    break;

  case 'logoutCustomer':
    logoutCustomer();
    break;

  /**live auction**/
  case 'loadManufacturerLive':
    loadManufacturerLive();
    break;

  case 'loadAuctionDaysLive';
    loadAuctionDaysLive();
    break;

  case 'loadModelsLive':
    loadModelsLive();
    break;

  case 'loadYearsLive':
    loadYearsLive();
    break;
  
  case 'loadColoursLive':
    loadColoursLive();
    break;

  case 'loadChassisNoLive':
    loadChassisNoLive();
    break;

  case 'searchVehiclesLive':
    searchVehiclesLive();
    break;

}

function vehicleEnquiry(){
  $date = date("Y-m-d H:i:s");

  $data = $_POST;
  $data['created_at'] = $date;

  $inquiry = new Inquiry();
  $insert  = $inquiry->store($data);

  $emails = new Emails();
  $email_body = $emails->createVehilceInquiryBody($data);
  $email_status = $emails->sendEmail('New Vehicle inquiry for Directautoimport.lk',$email_body,array('info@directautoimport.lk','jlankacar@gmail.com'),'','dinushiakila@gmail.com');


  if($insert){
    echo 200;
  }else{
    echo 400;
  }
}

function newsletterSubscribe(){
  $date = date("Y-m-d H:i:s");

  $data = $_POST;
  $data['name'] = $_POST['newsletter_name'];
  $data['email'] = $_POST['newsletter_email'];
  $data['created_at'] = $date;

  $nl = new NewsLetters();
  $insert  = $nl->store($data);

  $emails = new Emails();
  $email_body = $emails->createNewsletterSubscriptionBody($data);
  $email_status = $emails->sendEmail('Newsletter Subscription for Directautoimport.lk',$email_body,array('info@directautoimport.lk','jlankacar@gmail.com'),'','dinushiakila@gmail.com');


  if($insert){
    echo 200;
  }else{
    echo 400;
  }
}

function contactFormSumbission(){

  $data = $_POST;
  $emails = new Emails();
  $email_body = $emails->createContactFormSubmissionBody($data);
  $email_status = $emails->sendEmail('New Enquiry for Directautoimport.lk',$email_body,array('info@directautoimport.lk','directautoimport.lk@gmail.com'),'','directautoimport.lk@gmail.com');

  if($email_status){
    echo 200;
  }else{
    echo 400;
  }

}

function customerLogin(){
  
  $customers = new Customers();
  $data  = $customers->getByEmailAndPassword(strip_tags($_POST['email']),strip_tags($_POST['password']));

  if(count($data)>0 && !empty($data)){
    Sessions::setCustomerLoginDetails($data[0]['id'],$data[0]['email'],$data[0]['name']);
    echo 200;
  }else{
    echo 400;
  }
}

function customerRegistration(){

  $date = date("Y-m-d H:i:s");

  $data = $_POST;
  $data['created_at'] = $date;

  $customers = new Customers();
  $insert  = $customers->store($data);

  $emails = new Emails();
  $to = $data['email'];
  $email_body = $emails->createCustomerRegistrationBody($data);
  $email_status = $emails->sendEmail('Thank You for Signing Up for Directautoimport.lk!',$email_body,$to);


  if($insert){
    echo 200;
  }else{
    echo 400;
  }
  
}

function liveInquiry(){
  $date = date("Y-m-d H:i:s");

  $data = $_POST;
  $data['created_at'] = $date;
  $data['customer_id'] = $data['id'];
  $data['make'] = $data['manufacturer_live'];
  $data['model'] = $data['model_live'];
  $data['year'] = $data['year_live'];
  $data['color'] = $data['color_live'];
  //print_r($data);

  $inquiry = new LiveInquiry();
  $insert  = $inquiry->store($data);

  $emails = new Emails();
  $email_body = $emails->createLiveInquiryBody($data);
  $email_status = $emails->sendEmail('New Live Auction inquiry for Directautoimport.lk',array('info@directautoimport.lk','jlankacar@gmail.com'),'','dinushiakila@gmail.com');


  if($insert){
    echo 200;
  }else{
    echo 400;
  }
}

function searchVehicles(){
	$type = strip_tags($_POST['type']);
	$manufacturer = strip_tags($_POST['manufacturer']);
	$model = strip_tags($_POST['model']);
	$from_year = strip_tags($_POST['from_year']);
  $to_year = strip_tags($_POST['to_year']);
  $color = strip_tags($_POST['color']);

  $page = strip_tags($_POST['page']);
  $limit = 10;
  //$link = strip_tags($_POST['current_url']);
  $jscallback = 'searchVehiclesLocal';
  $class = '';
 

  $vehicles = new Vehicle();
  $all = $vehicles->searchVehicles($manufacturer,$model,$from_year,$to_year,$color,$type);

  $Pager = new PagerJs();
  $query = $vehicles->searchVehiclesQuery($manufacturer,$model,$from_year,$to_year,$color,$type);
  $Buttons = array('&laquo;', '&raquo;');

  $pagination = '';

  $vehicle_data = $Pager->pager($query, $page, $limit); 
  if(count($all)>$limit){
    $Pager->getPager();
    $pagination .= $Pager->getPagerStyle($Buttons, $class, $jscallback);
  }

	$transmission = Vehicle::getTransmissionData();
	$condition = Vehicle::getCondition();
	$drive_type = Vehicle::getDriveType();
	$fuel_type = Vehicle::getFuelType();

  $compare_list = Sessions::getCompareVehiclesLocal();

	$out = '';
	foreach ($vehicle_data as $vehicle) {
    $checked = '';
    if(in_array($vehicle['id'], $compare_list)){
      $checked = 'checked="checked"';
    }
		$images = explode(',', $vehicle['images']);
		$out .= '<div class="product-listing-m gray-bg">
          <div class="product-listing-img"> <a href="'.SITE_URL.'our-stock/'.$vehicle['seo_url'].'"><img src="'.SITE_URL.'uploads/vehicles/'.$images[0].'" class="img-responsive" alt="" /> </a>
            <div class="label_icon">'.$condition[$vehicle['conditions']].'</div>
            <div class="compare_item" onclick="addToCompareLocalInner('.$vehicle['id'].',\'compare_'.$vehicle['id'].'\')">
              <div class="checkbox">
                <input type="checkbox" value="'.$vehicle['id'].'" id="compare_'.$vehicle['id'].'" '.$checked.'>
                <label for="compare22">Compare</label>
              </div>
            </div>
          </div>
          <div class="product-listing-content col-md-9">
            <h5><a href="'.SITE_URL.'our-stock/'.$vehicle['seo_url'].'">'.$vehicle['vehicle_manufacturer_name'].' '.$vehicle['vehicle_model_name'].'</a></h5>
            <!--<p class="list-price">$90,000</p>-->
           <ul>
              <li><i class="fa fa-road" aria-hidden="true"></i>'.$vehicle['mileage'].'</li>
              <li><i class="fa fa-tachometer" aria-hidden="true"></i>'.$vehicle['engine_capacity'].'</li>
              <li><i class="fa fa-calendar" aria-hidden="true"></i>'.$vehicle['year'].'</li>
              <li><i class="fa fa-car" aria-hidden="true"></i>'.$fuel_type[$vehicle['fuel_type']].'</li>
              <li><i class="fa fa-user" aria-hidden="true"></i>'.$vehicle['seats'].'</li>
              <li><i class="fa fa-superpowers" aria-hidden="true"></i>'.$transmission[$vehicle['transmission']].'</li>
            </ul>
            <a href="'.SITE_URL.'our-stock/'.$vehicle['seo_url'].'" class="btn">VIEW PROFILE <span class="angle_arrow"><i class="fa fa-angle-right" aria-hidden="true"></i></span></a>
            <!--<div class="car-location"><span><i class="fa fa-map-marker" aria-hidden="true"></i> Colorado, USA</span></div>-->
          </div>
        </div>';
	}
	echo json_encode(array('table'=>$out,'pagination'=>$pagination,'count'=>count($all)));

}

function addToCompareLocal(){
  $vehicle_id = strip_tags($_POST['vehicle_id']);
  $compare_list = Sessions::getCompareVehiclesLocal();
  if(count($compare_list)<3){
    if(isset($compare_list)){
      if(!in_array($vehicle_id, $compare_list)){
        $compare_list[] = $vehicle_id; 
      }
    }else{
      $compare_list[] = $vehicle_id;
    }
    Sessions::setCompareVehiclesLocal($compare_list); 
    echo json_encode(array('code'=>200,'count'=>count($compare_list),'msg'=>'Added Successfully'));
  }else{
    echo json_encode(array('code'=>400,'count'=>count($compare_list),'msg'=>'Adding Failed'));
  }
}

function removeFromCompareLocal(){
  $vehicle_id = strip_tags($_POST['vehicle_id']);
  $compare_list = Sessions::getCompareVehiclesLocal();
  if (($key = array_search($vehicle_id, $compare_list)) !== false) {
    unset($compare_list[$key]);
  }
  Sessions::setCompareVehiclesLocal($compare_list); 
  echo json_encode(array('code'=>200,'count'=>count($compare_list)));
}

function logoutCustomer(){
  Sessions::logoutCustomer();
  echo "200";
}

function loadManufacturerLive(){ //error_reporting(E_ALL);
  $serverSQL = new ServerSql();
  $data = $serverSQL->getDistinctManufacturer(); //print_r($data);
  echo json_encode(array('code'=>'200','data'=>$data));
}

function loadAuctionDaysLive(){ //echo "123"; error_reporting(E_ALL);
  $serverSQL = new ServerSql();
  $data = $serverSQL->getAuctionDays(); //print_r($data);

  $output = array();
  for ($i = 0; $i < count($data); $i++) {
      $day = $data[$i]['AUCTION_DATE'];
      $day_by_date = explode(" ", $day);
      $day = strtotime($day);
      $main_day = date('D', $day);
      if ($data[$i]['AUCTION_DATE'] != '0000-00-00 00:00:00') {
          ?>
      
          <option value="<?php echo $day_by_date[0]; ?>" <?php
              /*if (in_array($day_by_date[0], $available_daysArr)) {
                  echo "selected";
              }*/
              ?>        
          ><?php echo $main_day." - ".$day_by_date[0] ?></option>
     
          <?php
      }
  }
 // echo json_encode(array('code'=>'200','data'=>$data));
}

function loadModelsLive(){ //echo "123"; error_reporting(E_ALL);
  $serverSQL = new ServerSql();
  $manufacturer = strip_tags($_POST['manufacturer']);
  $data = $serverSQL->getModelByManufacturer($manufacturer); //print_r($data);
  echo json_encode(array('code'=>'200','data'=>$data));
}

function loadYearsLive(){ //echo "123"; error_reporting(E_ALL);
  $serverSQL = new ServerSql();
  $manufacturer = strip_tags($_POST['manufacturer']);
  $model = strip_tags($_POST['model']);
  if($model != '' || $model !='undefined'){
    if($manufacturer == '' || empty($manufacturer) || $manufacturer =='undefined'){
      $data = $serverSQL->getYears();
    }else{
      $data = $serverSQL->getYearByModelManufacturer($manufacturer,$model);
    }
    //$data = $serverSQL->getYearByModelManufacturer($manufacturer,$model);
  }else{

    $data = $serverSQL->getYearByManufacturer($manufacturer); //print_r($data);
  }
  echo json_encode(array('code'=>'200','data'=>$data));
}

function loadColoursLive(){ //error_reporting(E_ALL);
  $manufacturer = strip_tags($_POST['manufacturer_id']);
  $model = strip_tags($_POST['model_id']); 
  $from_year = strip_tags($_POST['from_year']); 
  $to_year = strip_tags($_POST['to_year']); 

  $serverSQL = new ServerSql();
  if(($model == '' || empty($model) || $model =='undefined')){
    if($manufacturer == '' || empty($manufacturer) || $manufacturer =='undefined'){
      $data = $serverSQL->getColours();
    }else{
      $data = $serverSQL->getColoursByManufacturer($manufacturer,$from_year,$to_year);
    }
  }else{
    if($manufacturer == '' || empty($manufacturer) || $manufacturer =='undefined'){
      $data = $serverSQL->getColours();
    }else{
      $data = $serverSQL->getColoursByManufacturerAndModel($manufacturer,$model,$from_year,$to_year);
    }
  }
 // print_r($data);
  echo json_encode(array('colors' => $data));
}

function loadChassisNoLive(){ //echo "123"; error_reporting(E_ALL);
  $serverSQL = new ServerSql();
  $manufacturer = strip_tags($_POST['manufacturer']);
  $model = strip_tags($_POST['model']);
  $data = $serverSQL->getChassisNo($manufacturer,$model); //print_r($data);
  echo json_encode(array('code'=>'200','data'=>$data));
}

function searchVehiclesLive(){
  $manufacturer = strip_tags($_POST['manufacturer']);
  $model = strip_tags($_POST['model']);
  $year = strip_tags($_POST['year']);
  $chassis_no = strip_tags($_POST['chassis_no']);
  $enginecc = (strip_tags($_POST['enginecc']))? strip_tags($_POST['enginecc']) : '';
  $color = (strip_tags($_POST['color']))? strip_tags($_POST['color']) : '';
  $lot_no = (strip_tags($_POST['lotNo']))? strip_tags($_POST['lotNo']) : '';
  $available_days = (strip_tags($_POST['available_days']))? strip_tags($_POST['available_days']) : '';
  $page = strip_tags($_POST['page']);
  $available_daysArr = explode(",", $available_days); //print_r($_POST);
  
  $sql_class6 = new serverSQL();
  $sql_class6->setManufactureName($manufacturer);
  $sql_class6->setModelName($model);
  $sql_class6->setYear($year);
  $sql_class6->setChassiNo($chassis_no);
  $sql_class6->setEnginecc($enginecc);
  $sql_class6->setColour($color);
  $sql_class6->setLotNo($lot_no);
  $sql_class6->setAvailableDays($available_days);

  $data6 = $sql_class6->searchVehiclePaged($page); //print_r($data6);die();
  $count6 = $sql_class6->searchVehicleCount();

$pagination = new Pagination();
$pagination->setLimit(10);
$pagination->setPage($page);
$pagination->setJSCallback("searchVehicle");
$pagination->setTotalPages($count6);
$pagination->makePagination();

$out = '';
if ($count6 == "1") {
  $out .= '<h3 class="h3 hasbrackets orange text-center"><b>' . $count6 . "</b>  Vehicle Found </h3> <hr/>";
} else {
  $out .= '<h3 class="h3 hasbrackets orange text-center"><b>' . $count6 . "</b>  Vehicles Found</h3> <hr/>";
}

for ($i = 0; $i < count($data6); $i++) {

  $images = $data6[$i]['IMAGES'];
  $images = explode('#', $images);

  $AUCTION_DATEARR = explode(" ", $data6[$i]['AUCTION_DATE']);

  $seo_url = "";

  if ($data6[$i]['ID']) {
      $seo_url .= $data6[$i]['ID'];
  }

  if ($data6[$i]['MARKA_NAME']) {
      $seo_url .= "/" . Common::makeSeo($data6[$i]['MARKA_NAME']);
  }

  if ($data6[$i]['MODEL_NAME']) {
      $seo_url .= "/" . Common::makeSeo($data6[$i]['MODEL_NAME']);
  }

  if ($data6[$i]['COLOR']) {
      $seo_url .= "/" . Common::makeSeo($data6[$i]['COLOR']);
  }

  if ($data6[$i]['YEAR']) {
      $seo_url .= "/" . Common::makeSeo($data6[$i]['YEAR']);
  }

  $img = str_replace("&h=50", "", $images[0]);

  
  
    $out .= '<div class="product-listing-m gray-order-bottom">
          <div class="product-listing-img"> <a href="'.SITE_URL.'live-auction/'.$seo_url.'"><img src="'.$img.'" class="img-responsive" alt="" /> </a>
            
            
          </div>
          <div class="product-listing-content">
            <h5><a href="'.SITE_URL.'live-auction/'.$seo_url.'">'.$data6[$i]['MARKA_NAME'] . " " . $data6[$i]['MODEL_NAME'].'</a></h5>
            <!--<p class="list-price">$90,000</p>-->
           <ul>
              <li>Mileage : '. $data6[$i]['MILEAGE'].' KM </li>
              <li>Engine Capacity : '.$data6[$i]['ENG_V'].'CC </li>
              <li>Year : '.$data6[$i]['YEAR'].'</li>
              <li>Lot No : '.$data6[$i]['LOT'].'</li>
              <li>Chassis ID : '.$data6[$i]['KUZOV'].'</li>
              <li>Color : '.$data6[$i]['COLOR'].'</li>
              <li>Status : '.$data6[$i]['STATUS'].'</li>
              <li>Average Price : '.$data6[$i]['AVG_PRICE'].'</li>
              <li>Sold For : '.$data6[$i]['FINISH'].'</li>
            </ul>
            <a href="'.SITE_URL.'live-auction/'.$seo_url.'" class="btn">VIEW PROFILE <span class="angle_arrow"><i class="fa fa-angle-right" aria-hidden="true"></i></span></a>
            <!--<div class="car-location"><span><i class="fa fa-map-marker" aria-hidden="true"></i> Colorado, USA</span></div>-->
          </div>
        </div>';
  }

  $get_pagination = $pagination->getPagination();
  echo json_encode(array('table'=>$out,'pagination'=>$get_pagination));

}
?>
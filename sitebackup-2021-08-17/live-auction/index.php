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
<title>Car Auction - Auto Auction</title>
<?php include(DOC_ROOT.'includes/header.php'); ?>


<!--Page Header-->

<!-- /Page Header--> 



<!--Listing-->
<section class="about_us section-padding">
  <div class="iframe-wrapper container-fluid">
       <iframe src="https://jpcenter.ru/on?classic" width="100%" height="100%"></iframe>
       <!--  <iframe src="https://carused.jp/car-auction" width="100%" height="100%"></iframe> -->
        <!-- <iframe src="http://www.autorama.jp/search_auction.php" width="100%" height="100%"></iframe> -->
        
    
  </div>
  <div id="div1" class="slide" style="display: block;"> 
   <!-- <div class="slide-title">Login Details</div>  -->
    <p>Username :  jlanka</p><p>Password :  jlanka</p> 
  </div>
</section>
<!-- /Listing--> 

<section class="buttons live-auction">
  <div class="row">
        <div class="col-md-6 col-sm-6 col-xs-6 text-center"> <a class="btn btn-danger live-left-button" href="<?php echo SITE_URL; ?>my-account/live-auction-request.php?live_auction=true">INQUIRY/DETAILS<br> </a></div>
        <div class="col-md-6 col-sm-6 col-xs-6 text-center"> <a class="btn btn-danger" href="<?php echo SITE_URL; ?>how-to-read-auction-sheet/"><div><small>HOW TO READ</small></div>AUCTION SHEET</a></div>
      </div>
</section>
<?php include(DOC_ROOT.'includes/footer.php'); ?>
<script type="text/javascript">
$(document).ready(function(){
  //setValues('<?php echo $manufacturer_live ?>','<?php echo $model ?>','<?php echo $chassis_no ?>','<?php echo $year ?>');
  //searchVehiclesLive(1);

});
// $(document).ready(function(){
//     var frame = $('iframe'),
//         contents = frame.contents(),
//         body = contents.find('body'),
//         styleTag = contents.find('head').append(('<style>.iframe-wrapper iframe .bgnone{display: none !important;}.iframe-wrapper iframe #back-to-top{display: none !important;}.iframe-wrapper iframe .meshim_widget_components_chatButton_ButtonBar{display: none !important;}.iframe-wrapper iframe #header{display: none !important;}</style>');

//         body.text('<style>.iframe-wrapper iframe .bgnone{display: none !important;}.iframe-wrapper iframe #back-to-top{display: none !important;}.iframe-wrapper iframe .meshim_widget_components_chatButton_ButtonBar{display: none !important;}.iframe-wrapper iframe #header{display: none !important;}</style>');
//         console.log(body);
// });

// $('#search_live').click(function(e){
//   e.preventDefault();
//   searchVehicle(1);
// });
</script>
<style type="text/css">

  .buttons{
    width: 100%;
    margin: 0 auto;
    z-index: 1;
    position: relative;
    padding: 10px 0px;
    background-color: #fff;
  }
</style>

<style>
  iframe{
       /* margin-top: -185px;
        min-height: 3200px;
        margin-bottom: -600px;*/
    /*margin-top: -98px;
    min-height: 2000px;
    margin-bottom: -593px;*/
    margin-top: -337px;
    min-height: 2000px;
    margin-bottom: -593px;

  }
  .iframe-wrapper{
    /*position: relative;*/
  }
  .iframe-wrapper iframe .bgnone{
    display: none !important;
  }
  .iframe-wrapper iframe #back-to-top{
    display: none !important;
  }
  .iframe-wrapper iframe .meshim_widget_components_chatButton_ButtonBar{
    display: none !important;
  }
  .iframe-wrapper iframe #header{
    display: none !important;
  }
  .brand-section{
    /*margin-top: -600px;*/
    position: relative;
    /*z-index: 9999 !important;*/
  }
  footer{
    position: relative;
  }

  @media (max-width:768px) {
    iframe{
      margin-bottom: -165px;
     margin-top: -75px;
      min-height: 896px;
    }
  }

  @media (max-width:1200px) {
    iframe{
      margin-bottom: -165px;
     margin-top: -257px;
      min-height: 896px;
    }
    .slide {
    
        top: 55%;
        right: 3%;
        
    }
  }

   @media (max-width:768px) {
    iframe{
      margin-bottom: -165px;
     margin-top: -332px;
      min-height: 896px;
    }
    .slide {
    
        top: 48%;
        right: 4%;
        
    }
  }
  
  .iframe-wrapper {
      
      margin-top:310px;
 
    }
</style>
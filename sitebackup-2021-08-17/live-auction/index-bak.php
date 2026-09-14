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
<section class="page-header aboutus_page">
  <div class="container">
    <div class="page-header_wrap">
      <div class="page-heading">
        <h1>Auto Auction</h1>
      </div>
      <ul class="coustom-breadcrumb">
        <li><a href="<?php echo SITE_URL; ?>">Home</a></li>
        <li>Auto Auction</li>
      </ul>
    </div>
  </div>
  <!-- Dark Overlay-->
  <div class="dark-overlay"></div>
</section>
<!-- /Page Header--> 



<!--Listing-->
<section class="about_us section-padding">
  <div class="iframe-wrapper container-fluid">
       <iframe src="https://www.yamagin.net/ynet/LiveAuction" width="100%" height="100%"></iframe>
       <!--  <iframe src="https://carused.jp/car-auction" width="100%" height="100%"></iframe> -->
        <!-- <iframe src="http://www.autorama.jp/search_auction.php" width="100%" height="100%"></iframe> -->
        
    
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
    margin-top: -98px;
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
</style>
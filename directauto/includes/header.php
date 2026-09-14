<!--Bootstrap -->
<link rel="stylesheet" href="<?php echo SITE_URL; ?>css/bootstrap.min.css" type="text/css">
<!--Custome Style -->
<link rel="stylesheet" href="<?php echo SITE_URL; ?>css/style.css" type="text/css">
<!--OWL Carousel slider-->
<link rel="stylesheet" href="<?php echo SITE_URL; ?>css/owl.carousel.css" type="text/css">
<link rel="stylesheet" href="<?php echo SITE_URL; ?>css/owl.transitions.css" type="text/css">
<!--slick-slider -->
<link href="<?php echo SITE_URL; ?>css/slick.css" rel="stylesheet">
<!--bootstrap-slider -->
<link href="<?php echo SITE_URL; ?>css/bootstrap-slider.min.css" rel="stylesheet">
<!--FontAwesome Font Style -->
<!--<link href="<?php echo SITE_URL; ?>css/font-awesome.min.css" rel="stylesheet">-->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">


<link rel="stylesheet" type="text/css" href="<?php echo SITE_URL; ?>css/orange.css" title="orange" media="all"/>
        
<!-- Fav and touch icons -->
<link rel="apple-touch-icon-precomposed" sizes="144x144" href="<?php echo SITE_URL; ?>images/favicon-icon/apple-touch-icon-144-precomposed.png">
<link rel="apple-touch-icon-precomposed" sizes="114x114" href="<?php echo SITE_URL; ?>images/favicon-icon/apple-touch-icon-114-precomposed.html">
<link rel="apple-touch-icon-precomposed" sizes="72x72" href="<?php echo SITE_URL; ?>images/favicon-icon/apple-touch-icon-72-precomposed.png">
<link rel="apple-touch-icon-precomposed" href="<?php echo SITE_URL; ?>images/favicon-icon/apple-touch-icon-57-precomposed.png">
<link rel="shortcut icon" href="<?php echo SITE_URL; ?>images/favicon-icon/favicon.png">
<!-- Google-Font-->
<link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700" rel="stylesheet">
<!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
<!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
<!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
        <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
<![endif]-->  
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-118118557-1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-118118557-1');
</script>
</head>
<body> 
        
<!--Header-->
<header class="fixed">
  <div class="default-header">
    <div class="container">
      <div class="row">
        <div class="col-sm-3 col-md-2">
          <div class="logo"> <a href="<?php echo SITE_URL; ?>"><img src="<?php echo SITE_URL; ?>images/logo.png" alt="image"></a> </div>
        </div>
        <div class="col-sm-9 col-md-10">
          <div class="header_info">
            <div class="header_widgets">
              <div class="circle_icon"> <i class="fa fa-envelope" aria-hidden="true"></i> </div>
              <p class="uppercase_text">EMail us : </p>
              <a href="mailto:info@example.com">info@directautoimport.lk</a> </div>
            <div class="header_widgets">
              <div class="circle_icon"> <i class="fa fa-phone" aria-hidden="true"></i> </div>
              <p class="uppercase_text">Call Us: </p>
              <a href="tel:94112123456">+94 768 65 65 15</a> </div>
            <div class="social-follow">
              <ul>
                <li><a href="https://www.instagram.com/directautoimport.lk/"><i class="fa fa-facebook-square" aria-hidden="true"></i></a></li>
                <!-- <li><a href="#"><i class="fa fa-twitter-square" aria-hidden="true"></i></a></li>
                <li><a href="#"><i class="fa fa-linkedin-square" aria-hidden="true"></i></a></li> -->
                <!--<li><a href="#"><i class="fa fa-google-plus-square" aria-hidden="true"></i></a></li>-->
                 <li><a href="https://www.instagram.com/directautoimport.lk/"><i class="fa fa-instagram" aria-hidden="true"></i></a></li> 
              </ul>
            </div>
            <div class="login_btn"> <a href="<?php echo SITE_URL ?>my-account/login.php" class="btn btn-xs uppercase" data-toggle="modal" data-dismiss="modal">Login / Register</a> </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Navigation -->
  <nav id="navigation_bar" class="navbar navbar-default">
    <div class="container">
      <div class="navbar-header">
        <button id="menu_slide" data-target="#navigation" aria-expanded="false" data-toggle="collapse" class="navbar-toggle collapsed" type="button"> <span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span> </button>
      </div>
      
      
      <div class="header_wrap">
      <?php $is_customer_logged_in = Sessions::getIsCustomerLoggedIn();
      if($is_customer_logged_in){
       ?>
        <div class="user_login">
          <ul>
            <li class="dropdown"> <a href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fa fa-user-circle" aria-hidden="true"></i> <?php echo Sessions::getCustomerName(); ?> <i class="fa fa-angle-down" aria-hidden="true"></i></a>
              <ul class="dropdown-menu">
                <li><a href="<?php echo SITE_URL; ?>my-account/">My Account</a></li>
                <li><a href="<?php echo SITE_URL; ?>my-account/live-auction-request.php">Request Auction Data</a></li>
                <li><a href="<?php echo SITE_URL; ?>my-account/profile-settings.php">Profile Settings</a></li>
                <li><a href="<?php echo SITE_URL; ?>my-account/my-inquiries.php">My Inquiries</a></li>
               
                <li><a href="javascript:;" onclick="logoutCustomer();">Sign Out</a></li>
              </ul>
            </li>
          </ul>
        </div>

         <?php } ?>
         
        <!-- <div class="header_search">
          <div id="search_toggle"><i class="fa fa-search" aria-hidden="true"></i></div>
          <form action="#" method="get" id="header-search-form">
            <input type="text" placeholder="Search..." class="form-control">
            <button type="submit"><i class="fa fa-search" aria-hidden="true"></i></button>
          </form>
        </div> -->
      </div>
     
      <div class="collapse navbar-collapse" id="navigation">
        <ul class="nav navbar-nav" id="header-nav">
          <li><a href="<?php echo SITE_URL; ?>">Find Vehicles</a>
          </li>
         
          <li><a href="<?php echo SITE_URL; ?>live-auction/">Auto Auction</a>
          </li>
          <li><a href="<?php echo SITE_URL; ?>our-stock/">Our Stock</a>
          </li>
          <!-- <li><a href="<?php echo SITE_URL; ?>how-to-buy/">FAQS</a></li> -->
          <li class="dropdown"><a href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">FAQS</a>
             <ul class="dropdown-menu">
              <li><a href="<?php echo SITE_URL; ?>how-to-buy/">How to Buy</a></li>
              <li><a href="<?php echo SITE_URL; ?>how-to-read-auction-sheet/">How to Read Auction Sheet</a></li>
              <li><a href="<?php echo SITE_URL; ?>vocabulary/">Vocabulary</a></li>
            </ul>
          </li>
          <li><a href="<?php echo SITE_URL; ?>contact-us/">Contact Us</a>
          <li><a href="<?php echo SITE_URL; ?>about-us/">About Us</a></li>

          <?php 
        $compare_list = Sessions::getCompareVehiclesLocal();
        if(isset($compare_list)){
          $compare_count = count(Sessions::getCompareVehiclesLocal()); 
        }else{
          $compare_count = 0;
        } 
        ?>
          <li><a href="<?php echo SITE_URL; ?>compare/"><span class="list-label heading-font">Compare</span>
            <?php if($compare_count){ ?><span class="list-badge"><span id="compare_item_count"><?php echo $compare_count; ?></span></span><?php } ?>
          </a>
          </li>
<!--           <li><a href="<?php echo SITE_URL; ?>testimonials/">Testimonials</a>
          </li>
 -->            
          <!-- <li class="dropdown"><a href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">News</a>
            <ul class="dropdown-menu">
              <li><a href="blog-left-sidebar.html">Blog Left Sidebar</a></li>
              <li><a href="blog-right-sidebar.html">Blog Right Sidebar</a></li>
              <li><a href="blog-detail.html">Blog Detail</a></li>
            </ul>
          </li> -->

        </ul>
        
      </div>
    </div>
  </nav>
  <!-- Navigation end --> 
  
</header>
<!-- /Header --> 
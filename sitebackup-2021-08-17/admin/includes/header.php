</head>
<body class="hold-transition skin-blue sidebar-mini">
<div class="wrapper">

  <header class="main-header">
    <!-- Logo -->
    <a href="<?php echo SITE_URL;?>admin/" class="logo">
   <img style="padding-right: 55px" class="logo" src="<?php echo SITE_URL;?>images/logo.png">
    </a>
    <!-- Header Navbar: style can be found in header.less -->
    <nav class="navbar navbar-static-top">
      <!-- Sidebar toggle button-->
      <a class="sidebar-toggle" data-toggle="offcanvas" role="button">
        <span class="sr-only">Toggle navigation</span>
      </a>

      <div class="navbar-custom-menu">
        <ul class="nav navbar-nav">
          
          <!-- User Account: style can be found in dropdown.less -->
          <li class="dropdown user user-menu">
            <a class="dropdown-toggle" data-toggle="dropdown">
              <img src="<?php echo SITE_URL;?>admin/images/admin.png" class="user-image" alt="User Image">
              <span class="hidden-xs"><?php echo Sessions::getAdminFullName(); ?></span>
            </a>
            <ul class="dropdown-menu">
              <!-- User image -->
              <li class="user-header">
                <img src="<?php echo SITE_URL;?>images/admin.png" class="img-circle" alt="User Image">

                <p>
                  <?php echo Sessions::getAdminFullName(); ?>
                  
                </p>
              </li>
              <!-- Menu Body -->
              <li class="user-body">
               
                <!-- /.row -->
              </li>
              <!-- Menu Footer-->
              <li class="user-footer">
                <div class="pull-left">
                  <a href="<?php echo SITE_URL;?>modules/client/" class="btn btn-default btn-flat">Profile</a>
                </div>
                <div class="pull-right">
                  <a href="javascript:;" onclick="doLogout();" class="btn btn-default btn-flat">Sign out</a>
                </div>
              </li>
            </ul>
          </li>
         
        </ul>
      </div>
    </nav>
  </header>
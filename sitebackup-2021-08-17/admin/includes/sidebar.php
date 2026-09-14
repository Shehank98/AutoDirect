 <aside class="main-sidebar">
    <!-- sidebar: style can be found in sidebar.less -->
    <section class="sidebar">
      <!-- Sidebar user panel -->
      <div class="user-panel">
       
        
      </div>
  
      <!-- sidebar menu: : style can be found in sidebar.less -->
      <ul class="sidebar-menu">
        <li class="header">MAIN NAVIGATION</li>
        <li><a href="<?php echo SITE_URL;?>admin/"><i class="fa fa-dashboard"></i> <span>Dashboard</span></a></li>
        <li class="header">VEHICLE CMS</li>
        <li>
          <a href="<?php echo SITE_URL;?>admin/modules/vehicle-type/">
            <i class="fa fa-bus"></i> <span>Vehicle Type</span>
            
          </a>
        </li>
        <li>
          <a href="<?php echo SITE_URL;?>admin/modules/vehicle-manufacturer/">
            <i class="fa fa-cogs"></i> <span>Vehicle Manufacturer</span>
            
          </a>
        </li>
        <li>
          <a href="<?php echo SITE_URL;?>admin/modules/vehicle-model/">
            <i class="fa fa-bus"></i> <span>Vehicle Model</span>
            
          </a>
        </li>
        <li>
          <a href="<?php echo SITE_URL;?>admin/modules/vehicle-color/">
            <i class="fa fa-list-alt"></i> <span>Vehicle Color</span>
            
          </a>
        </li>
        <li>
          <a href="<?php echo SITE_URL;?>admin/modules/vehicle-feature/">
            <i class="fa fa-camera-retro"></i> <span>Vehicle Feature</span>
            
          </a>
        </li>
        <li>
          <a href="<?php echo SITE_URL;?>admin/modules/vehicle/">
            <i class="fa fa-car"></i> <span>Vehicle</span>
            
          </a>
        </li>

        <li class="header">MANAGE INQUIRIES</li>
        <li>
          <a href="<?php echo SITE_URL;?>admin/modules/customers/">
            <i class="fa fa-users"></i> <span>Customers</span>
            
          </a>
        </li>
        <li>
          <a href="<?php echo SITE_URL;?>admin/modules/inquiries/">
            <i class="fa fa-envelope"></i> <span>Local Inquiries</span>
            
          </a>
        </li>
        <li>
          <a href="<?php echo SITE_URL;?>admin/modules/live-inquiries/">
            <i class="fa fa-envelope"></i> <span>Live Auction Inquiries</span>
            
          </a>
        </li>
        <li>
          <a href="<?php echo SITE_URL;?>admin/modules/newsletters/">
            <i class="fa fa-users"></i> <span>Newsletter Subscribes</span>
            
          </a>
        </li>

        <li class="header">MANAGE USERS</li>
        
        <li>
          <a href="<?php echo SITE_URL;?>admin/modules/users/">
            <i class="fa fa-users"></i> <span>Users</span>
            
          </a>
        </li>

         <!-- <li>
          <a href="<?php echo SITE_URL;?>admin/modules/clients/">
            <i class="fa fa-users"></i> <span>Clients</span>
            
          </a>
        </li>  -->     

        <?php 
              // $val = Common::getPermissions("userpermissions","view");
              // if ($val== 1) {  ?>

         <li>
          <a href="<?php echo SITE_URL;?>admin/modules/userpermissions/">
            <i class="fa fa-lock"></i> <span>User Permissions</span>
            
          </a>
        </li>


       <?php  //} ?>
       
          <!-- <li>
          <a href="<?php echo SITE_URL;?>admin/modules/developers/index.php">
            <i class="fa fa-industry"></i> <span>Developers</span>
            
          </a>
        </li>

           <li>
          <a href="<?php echo SITE_URL;?>admin/modules/projects/index.php">
            <i class="fa fa-tasks"></i> <span>Projects</span>
            
          </a>
        </li>

        <li>
          <a href="<?php echo SITE_URL;?>admin/modules/discounts/index.php">
            <i class="fa fa-credit-card"></i> <span>Discounts</span>
            
          </a>
        </li>

         <li>
          <a href="<?php echo SITE_URL;?>admin/modules/proposals/index.php">
            <i class="fa fa-newspaper-o"></i> <span>Proposals</span>
            
          </a>
        </li>

        <li>
          <a href="<?php echo SITE_URL;?>admin/modules/projectcosts/index.php">
            <i class="fa fa-money"></i> <span>Project Costs</span>
            
          </a>
        </li> -->
       
        
      </ul>
    </section>
    <!-- /.sidebar -->
  </aside>
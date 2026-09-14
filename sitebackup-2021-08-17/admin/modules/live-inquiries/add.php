<?php 
require_once '../../../system/config.php';
Sessions::adminRedirectOnNotLoggedIn();

$value = Common::getPermissions("users","add");

if ($value== 1) {

$userpermissions = new Userpermissions();
$userpermissionsdata = $userpermissions->selectAll();

//print_r($userpermissionsdata);die();

?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Car Auction| Add Users</title>
  <!-- Tell the browser to be responsive to screen width -->
  <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
  <?php include "../../includes/head.php" ?>
</head>
<body class="hold-transition skin-blue sidebar-mini">
<div class="wrapper">

  <?php include "../../includes/header.php" ?>
  <!-- Left side column. contains the logo and sidebar -->
   <?php include "../../includes/sidebar.php" ?>

  <!-- Content Wrapper. Contains page content -->
  <div class="content-wrapper">
    <!-- Content Header (Page header) -->
    <section class="content-header">
      <h1>
        Car Auction
        <small>Control panel</small>
      </h1>
      <ol class="breadcrumb">
        <li><a href="<?php echo SITE_URL; ?>"><i class="fa fa-dashboard"></i> Home</a></li>
        <li class="active">Add Users</li>
      </ol>
    </section>

    <!-- Main content -->
   <section class="content">
      <div class="row">
      
        <!-- /.col -->
        <div class="col-lg-2">
              
          <a href="<?php echo SITE_URL; ?>admin/modules/users/" class="btn btn-primary"><i class="fa fa-eye" aria-hidden="true"></i> View Users</a>
          <br><br>
        </div>
       
        <div class="col-md-12">
            <div class="box box-info">
              <!-- /.box -->
              <div class="box">
                <div class="box-header">
                  <h3 class="box-title">Add Users</h3>
                </div>
                <!-- /.box-header -->
                <div class="box-body">
                  
                  <div class="margin-top-10">
                    <form class="form-horizontal" id="add_form">

                    <!-- Text input-->
                        <div class="form-group">
                          <label class="col-md-2 control-label" for="first_name">User Type</label>  
                          <div class="col-md-10">
                          <select id="type" name="type" class="form-control">

                          <option selected="true" disabled="disabled">-- select user type-- </option> 

                          <?php foreach ($userpermissionsdata as $key) { ?>
                           
                                <option value="<?php echo $key[id];?>"><?php echo $key[username];?></option>

                           <?php  } ?>

                          

                        </select>
                          </div>
                        </div>
                        

                        <!-- Text input-->
                        <div class="form-group">
                          <label class="col-md-2 control-label" for="first_name">First Name</label>  
                          <div class="col-md-10">
                          <input id="first_name" name="first_name" type="text" placeholder="Enter First Name" class="form-control input-md">
                          </div>
                        </div>

                        <!-- Text input-->
                        <div class="form-group">
                          <label class="col-md-2 control-label" for="last_name">Last Name</label>  
                          <div class="col-md-10">
                          <input id="last_name" name="last_name" type="text" placeholder="Enter Last Name" class="form-control input-md">
                          </div>
                        </div>

                        <!-- Text input-->
                        <div class="form-group">
                          <label class="col-md-2 control-label" for="email">Email</label>  
                          <div class="col-md-10">
                          <input id="email" name="email" type="text" placeholder="Email" class="form-control input-md">
                          </div>
                        </div>

                        <!-- Text input-->
                        <div class="form-group">
                          <label class="col-md-2 control-label" for="username">Username</label>  
                          <div class="col-md-10">
                          <input id="username" name="username" type="text" placeholder="Enter Username" class="form-control input-md">
                          </div>
                        </div>

                        <!-- Text input-->
                        <div class="form-group">
                          <label class="col-md-2 control-label" for="password">Password</label>  
                          <div class="col-md-10">
                          <input id="password" name="password" type="password" placeholder="Enter Password" class="form-control input-md">
                          </div>
                        </div>
                    


                        <div class="form-group">
                          <div class="col-md-12">
                          <button class="btn  btn-danger pull-right" type="submit" id="submit_btn">Save</button>              
                          </div>
                        </div>

                    </form>

                  </div>
                      <div id="form_submit_msg"></div>
                </div>
                <!-- /.box-body -->
              </div>
          </div>
        </div>
      
        </div>
        <!-- /.col -->
      </div>
      <!-- /.row -->
    
    </section>

  </div>
  <!-- /.content-wrapper -->
  
<?php include "../../includes/footer.php"; ?>
  <!-- Control Sidebar -->
  <aside class="control-sidebar control-sidebar-dark">
    <!-- Create the tabs -->
    <ul class="nav nav-tabs nav-justified control-sidebar-tabs">
      <li><a href="#control-sidebar-home-tab" data-toggle="tab"><i class="fa fa-home"></i></a></li>
      <li><a href="#control-sidebar-settings-tab" data-toggle="tab"><i class="fa fa-gears"></i></a></li>
    </ul>
    <!-- Tab panes -->
    <div class="tab-content">
      <!-- Home tab content -->
      
         
          <!-- /.form-group -->
        </form>
      </div>
      <!-- /.tab-pane -->
    </div>
  </aside>

  <div class="control-sidebar-bg"></div>
</div>
<!-- ./wrapper -->
<script src="../../plugins/jQuery/jquery-2.2.3.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.16.0/jquery.validate.js"></script> 
<script type="text/javascript">
    $(document).ready(function(){
        
        
        $("#add_form").validate({
            rules: {
                first_name: {required: true},
                last_name: {required: true},
                username: {required: true},
                password: {required: true},
                type: {required: true},
                email: {required: true,email: true}
                
            },
            messages: {
                first_name: "<p class='text-danger'>Please enter first name</p>",
                last_name: "<p class='text-danger'>Please enter last name</p>",
                username: "<p class='text-danger'>Please enter username</p>",
                password: "<p class='text-danger'>Please enter password</p>",
                 type: "<p class='text-danger'>Please select user type</p>",
                

                email: {
                  required: "<p class='text-danger'>Please enter a email address</p>",
                  email: "<p class='text-danger'>Please enter valid email address</p>"
                },
                           
                
            },
            submitHandler: function () {

              var url_data = $('#add_form').serialize();
              url_data += "&action=store"; console.log(url_data);

              $.ajax({
                 type: 'POST',
                 url: '../../system/controllers/users_controller.php',
                 data: url_data,
                 success: function(res) {
                    $('#form_submit_msg').show(); console.log(res);
                    if($.trim(res)==200){
                      clearFormFieldsFront("#add_form");
                      showFrontFormMessage('#form_submit_msg','success',{message:'Successfully Added'});
                      //$('#form_submit_msg').html('<p class="alert alert-success"> Successfully Added</p>');
                    }else{
                      showFrontFormMessage('#form_submit_msg','error',{message:'Something wrong. Please try again'});
                      //$('#form_submit_msg').html('<p class="alert alert-danger"> Something wrong. Please try again</p>');
                    }
                    //$('#form_submit_msg').hide(3000);
                 },
              });
        
            }

        });    
        jQuery.validator.addMethod("startwithzero", function (value, element) {
              return this.optional(element) || /(^[0a-zA-Z].{9})$/.test(value);
        }, "start from zero.");      
    });

    
    </script>


 <?php include "../../includes/footerscript.php" ?>
</body>
</html>
<?php   
  
}else{

  header("Location: ".SITE_URL."");
}

  ?>

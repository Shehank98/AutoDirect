<?php 
require_once '../../../system/config.php';
Sessions::adminRedirectOnNotLoggedIn();

$value = Common::getPermissions("vehicle-color","add");

if ($value== 1) {

?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Car Auction| Add Vehicle Colors</title>
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
        <li class="active">Add Vehicle Colors</li>
      </ol>
    </section>

    <!-- Main content -->
   <section class="content">
      <div class="row">
      
        <!-- /.col -->
        <div class="col-lg-2">
              
          <a href="<?php echo SITE_URL; ?>admin/modules/vehicle-color/" class="btn btn-primary"><i class="fa fa-eye" aria-hidden="true"></i> View Vehicle Colors</a>
          <br><br>
        </div>
       
        <div class="col-md-12">
            <div class="box box-info">
              <!-- /.box -->
              <div class="box">
                <div class="box-header">
                  <h3 class="box-title">Add Vehicle Colors</h3>
                </div>
                <!-- /.box-header -->
                <div class="box-body">
                  
                  <div class="margin-top-10">
                    <form class="form-horizontal" id="add_form">

                        <!-- Text input-->
                        <div class="form-group">
                          <label class="col-md-2 control-label" for="name">Color Name</label>  
                          <div class="col-md-10">
                          <input id="name" name="name" type="text" placeholder="Enter Color Name" class="form-control input-md">
                          </div>
                        </div>

                        <div class="form-group">
                          <label class="col-md-2 control-label" for="first_name">Status</label>  
                          <div class="col-md-10">
                          <select id="status" name="status" class="form-control">

                          <?php 
                          $status = Common::getStatus();
                          foreach ($status as $key => $val) { ?>
                           
                                <option value="<?php echo $key;?>" <?php if($key==1){ echo 'selected="selected"';}?>><?php echo$val;?></option>

                           <?php  } ?>

                          

                        </select>
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
                name: {required: true},
            },
            messages: {
                name: "<p class='text-danger'>Please enter color name</p>",
               
            },
            submitHandler: function () {

              var url_data = $('#add_form').serialize();
              url_data += "&action=store"; console.log(url_data);

              $.ajax({
                 type: 'POST',
                 url: '../../../system/controllers/vehicle_color_controller.php',
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

  header("Location: ".SITE_URL."admin/");
}

  ?>

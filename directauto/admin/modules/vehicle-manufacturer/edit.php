<?php 

require_once '../../../system/config.php';
Sessions::adminRedirectOnNotLoggedIn();

$value = Common::getPermissions("vehicle-manufacturer","edit");

if ($value== 1) {

$id = htmlentities($_GET['id']);

$manufacturer = new vehicleManufacturer();
$data = $manufacturer->getById($id);

?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Car Auction | Edit Vehicle Manufacturer</title> 
  <!-- Tell the browser to be responsive to screen width -->
  <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">

  <?php include "../../includes/head.php" ?>

</head>
<body class="hold-transition skin-blue sidebar-mini">
<div class="wrapper">

  <?php include "../../includes/header.php" ?>

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
        <li><a href="<?php echo SITE_URL; ?>admin/"><i class="fa fa-dashboard"></i> Home</a></li>
        <li class="active">Add Vehicle Manufacturer</li>
      </ol>
    </section>

    <!-- Main content -->
   <section class="content">
      <div class="row">
        <div class="col-lg-2">
              
            <a href="<?php echo SITE_URL; ?>admin/modules/vehicle-manufacturer/" class="btn btn-primary"><i class="fa fa-eye fa-fw"></i> View Vehicle Manufacturers</a>
            <br><br>
        </div> 
        <!-- /.col -->
        <div class="col-lg-12">
          <div class="box box-info">
            <!-- /.box -->
            <div class="box">
              <div class="box-header">
                <h3 class="box-title">Edit Vehicle Manufacturer</h3>
              </div>
              <!-- /.box-header -->
              <div class="box-body">
                
                <div class="margin-top-10">
                  
                  <form class="form-horizontal" id="edit_form" name="edit_form" enctype="multipart/form-data">


                        <!-- Text input-->
                        <div class="form-group">
                          <label class="col-md-2 control-label" for="name">Vehicle Manufacturer Name</label>  
                          <div class="col-md-10">
                          <input id="name" name="name" type="text" placeholder="Vehicle Manufacturer Name" class="form-control input-md" value="<?php echo $data[0]['name'] ?>">
                          <input type="hidden" name="id" value="<?php echo $data[0]['id'] ?>">
                          </div>
                        </div>

                        <div class="form-group">
                          <label class="col-md-2 control-label" for="first_name">Status</label>  
                          <div class="col-md-10">
                          <select id="status" name="status" class="form-control">

                          <?php 
                          $status = Common::getStatus();
                          foreach ($status as $key => $val) { ?>
                           
                                <option value="<?php echo $key;?>" <?php if($key==$data[0]['status']){ echo 'selected="selected"';}?>><?php echo$val;?></option>

                           <?php  } ?>

                          

                        </select>
                          </div>
                        </div>

                        <!-- Text input-->
                        <div class="form-group">
                          <label class="col-md-2 control-label" for="image">Logo Image</label>  
                          <div class="col-md-10">
                            <input id="image" name="image" type="file" class="form-control input-md">
                            <p class="help-block">Only .jpg and .png</p>
                            <input type="hidden" name="action" value="update">
                            <?php if($data[0]['image'] !=''){ ?>
                              <div class="preview"><img width="75" height="35" src="<?php echo SITE_URL ?>uploads/vehicle-manufacturer/<?php echo $data[0]['image']; ?>"></div>
                            <?php } ?>
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
        
        
        $("#edit_form").validate({
            rules: {
                name: {required: true},
                
            },
            messages: {
                name: "<p class='text-danger'>Please enter vehicle manufacturer name</p>",
                 
            },

            submitHandler: function () {             

               // Get form
                var form = $('#edit_form')[0]; 

               // Create an FormData object
                var data = new FormData(form);   console.log(data);            

              $.ajax({
                 type: "POST",
                  enctype: 'multipart/form-data',
                  url: '../../../system/controllers/vehicle_manufacturer_controller.php',
                  data: data,
                  processData: false,
                  contentType: false,
                  cache: false,
                  timeout: 600000,

                 
                 success: function(res) {

                  //console.log(res);

                    $('#form_submit_msg').show(); //console.log(res);
                    if($.trim(res)==200){
                      clearFormFieldsFront("#add_form");
                      showFrontFormMessage('#form_submit_msg','success',{message:'Successfully Updated'});
                      //window.location.reload();
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

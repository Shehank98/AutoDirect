<?php 

require_once '../../../system/config.php';
Sessions::adminRedirectOnNotLoggedIn();

$value = Common::getPermissions("vehicle","edit");

if ($value== 1) {

$id = htmlentities($_GET['id']);

$vehicle = new vehicle();
$data = $vehicle->getById($id);

$vehicle_type = new vehicleType();
$vehicletypes = $vehicle_type->selectAllActive(); 

$manufacturer = new vehicleManufacturer();
$manufacturerdata = $manufacturer->selectAllActive();

$vehicle_feature = new vehicleFeature();
$featuredata  = $vehicle_feature->selectAllActive();

$vehicle_color = new vehicleColor();
$colordata  = $vehicle_color->selectAllActive();


?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Car Auction | Edit Vehicle</title> 
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
        <li><a href="<?php echo SITE_URL; ?>"><i class="fa fa-dashboard"></i> Home</a></li>
        <li class="active">Edit Vehicle</li>
      </ol>
    </section>

    <!-- Main content -->
   <section class="content">
      <div class="row">
        <div class="col-lg-2">
              
            <a href="<?php echo SITE_URL; ?>admin/modules/vehicle/" class="btn btn-primary"><i class="fa fa-eye fa-fw"></i> View Vehicles</a>
            <br><br>
        </div> 
        <!-- /.col -->
        <div class="col-lg-12">
          <div class="box box-info">
            <!-- /.box -->
            <div class="box">
              <div class="box-header">
                <h3 class="box-title">Edit Vehicle</h3>
              </div>
              <!-- /.box-header -->
              <div class="box-body">
                
                <div class="margin-top-10">
                  
                  <form class="form-horizontal" id="edit_form" name="edit_form" enctype="multipart/form-data">


                        <div class="form-group">
                          <label class="col-md-2 control-label" for="first_name">Vehicle Type</label>  
                          <div class="col-md-6">
                            <select id="vehicle_type" name="vehicle_type" class="form-control">
                              <option value=""> --Select-- </option>
                            <?php 
                            
                            foreach($vehicletypes as $type){ ?>
                             
                                  <option value="<?php echo $type['id'];?>" <?php echo ($type['id'] == $data[0]['vehicle_type'])?'selected':'' ?> ><?php echo $type['name'];?></option>

                            <?php } ?>

                            </select>
                          </div>
                        </div>

                        <div class="form-group">
                          <label class="col-md-2 control-label" for="first_name">Vehicle Manufacturer</label>  
                          <div class="col-md-6">
                          <select id="vehicle_manufacturer" name="vehicle_manufacturer" class="form-control" onchange="loadVehicleModel(this.value)">
                            <option value=""> --Select-- </option>

                          <?php 
                          
                          foreach($manufacturerdata as $manufacturer){ ?>
                           
                                <option value="<?php echo $manufacturer['id'];?>" <?php echo ($manufacturer['id'] == $data[0]['vehicle_manufacturer'])?'selected':'' ?> ><?php echo $manufacturer['name'];?></option>

                          <?php } ?>

                          

                        </select>
                          </div>
                        </div>

                        <div class="form-group">
                          <label class="col-md-2 control-label" for="vehicle_model">Vehicle Model</label>  
                          <div class="col-md-6" id="model_container">
                            <select id="vehicle_model" name="vehicle_model" class="form-control" onchange="setSeo();">
                              <option value=""> --Select-- </option>
                            </select>
                          </div>
                        </div>

                        <div class="form-group">
                          <label class="col-md-2 control-label" for="main_color">Exterior Color</label>  
                          <div class="col-md-6">
                          <select id="main_color" name="main_color" class="form-control">
                            <option value=""> --Select-- </option>

                          <?php 
                          
                          foreach($colordata as $color){ ?>
                           
                                <option value="<?php echo $color['id'];?>" <?php echo ($color['id'] == $data[0]['main_color'])?'selected':'' ?> ><?php echo $color['name'];?></option>

                          <?php } ?>

                          

                        </select>
                          </div>
                        </div>

                        <div class="form-group">
                          <label class="col-md-2 control-label" for="other_color">Interior Color</label>  
                          <div class="col-md-6">
                          <select id="other_color" name="other_color" class="form-control">
                            <option value=""> --Select-- </option>

                          <?php 
                          
                          foreach($colordata as $color){ ?>
                           
                                <option value="<?php echo $color['id'];?>" <?php echo ($color['id'] == $data[0]['other_color'])?'selected':'' ?> ><?php echo $color['name'];?></option>

                          <?php } ?>

                          

                        </select>
                          </div>
                        </div>

                        <div class="form-group">
                          <label class="col-md-2 control-label" for="feature_ids">Vehicle Features</label>  
                          <div class="col-md-10">
                          <?php 
                          $featurea_ids = explode(',', $data[0]['feature_ids']); 
                          foreach($featuredata as $feature){ ?>
                                <label class="checkbox-inline"><input type="checkbox" name="feature_ids[]" value="<?php echo $feature['id'];?>"  <?php echo (in_array($feature['id'], $featurea_ids))?' checked':'' ?> ><?php echo $feature['name'];?></label>

                          <?php } ?>
                          
                          </div>
                        </div>

                        <div class="form-group">
                          <label class="col-md-2 control-label" for="transmission">Transmission</label>  
                          <div class="col-md-6">
                            <select id="transmission" name="transmission" class="form-control">
                              <option value=""> --Select-- </option>

                            <?php 
                            $transmission_data = Vehicle::getTransmissionData();
                            foreach($transmission_data as $key=>$val){ ?>
                             
                                  <option value="<?php echo $key;?>" <?php echo ($key == $data[0]['transmission'])?'selected':'' ?> ><?php echo $val;?></option>

                            <?php } ?>

                            </select>
                          </div>
                        </div>


                        <div class="form-group">
                          <label class="col-md-2 control-label" for="year">Year</label>  
                          <div class="col-md-6">
                            <select id="year" name="year" class="form-control">
                              <option value=""> --Select-- </option>
                            <?php
                            foreach (range(date('Y'), '1990') as $x) {
                            ?>
                            <option value="<?php echo $x;?>" <?php echo ($x == $data[0]['year'])?'selected':'' ?> ><?php echo $x;?></option>

                            <?php } ?>

                            </select>
                          </div>
                        </div>

                         <div class="form-group">
                          <label class="col-md-2 control-label" for="chassi_id">Chassis No</label>  
                          <div class="col-md-6">
                          <input id="chassi_id" name="chassi_id" type="text" placeholder="Chassis No" class="form-control input-md" value="<?php echo $data[0]['chassi_id']; ?>">
                          </div>
                        </div>

                        <div class="form-group">
                            <label class="col-md-2 control-label" for="conditions">Vehicle Condition</label>
                            <div class="col-md-6">
                            <select id="conditions" name="conditions" class="form-control">
                              <option value=""> --Select-- </option>

                            <?php 
                            $conditon = Vehicle::getCondition();
                            foreach($conditon as $key=>$val){ ?>
                             
                                  <option value="<?php echo $key;?>" <?php echo ($key == $data[0]['conditions'])?'selected':'' ?> ><?php echo $val;?></option>

                            <?php } ?>

                            </select>
                            </div>
                        </div>

                        <div class="form-group">
                          <label class="col-md-2 control-label" for="seats">No of Seats</label>  
                          <div class="col-md-6">
                            <select id="seats" name="seats" class="form-control">
                              <option value=""> --Select-- </option>
                            <?php
                            foreach (range('1', '10') as $x) {
                            ?>
                            <option value="<?php echo $x;?>" <?php echo ($x==$data[0]['seats'])?"selected":'' ?>><?php echo $x;?></option>

                            <?php } ?>

                            </select>
                          </div>
                        </div>

                        <div class="form-group">
                          <label class="col-md-2 control-label" for="doors">No of Doors</label>  
                          <div class="col-md-6">
                            <select id="doors" name="doors" class="form-control">
                              <option value=""> --Select-- </option>
                            <?php
                            foreach (range('1', '10') as $x) {
                            ?>
                            <option value="<?php echo $x;?>" <?php echo ($x==$data[0]['doors'])?"selected":'' ?>><?php echo $x;?></option>

                            <?php } ?>

                            </select>
                          </div>
                        </div>

                         <div class="form-group">
                          <label class="col-md-2 control-label" for="passengers">Passengers</label>  
                          <div class="col-md-6">
                            <select id="passengers" name="passengers" class="form-control">
                              <option value=""> -- Select -- </option>
                            <?php
                            foreach (range('1', '10') as $x) {
                            ?>
                            <option value="<?php echo $x;?>" <?php echo ($x==$data[0]['passengers'])?"selected":'' ?>><?php echo $x;?></option>

                            <?php } ?>

                            </select>
                          </div>
                        </div>

                         <div class="form-group">
                          <label class="col-md-2 control-label" for="engine_capacity">Engine Capacity</label>  
                          <div class="col-md-6">
                          <input id="engine_capacity" name="engine_capacity" type="text" placeholder="Engine Capacity" class="form-control input-md" value="<?php echo $data[0]['engine_capacity']; ?>">
                          </div>
                        </div>

                         <div class="form-group">
                          <label class="col-md-2 control-label" for="mileage">Mileage</label>  
                          <div class="col-md-6">
                          <input id="mileage" name="mileage" type="text" placeholder="Mileage" class="form-control input-md" value="<?php echo $data[0]['mileage']; ?>">
                          </div>
                        </div>

                        <div class="form-group">
                          <label class="col-md-2 control-label" for="fuel_type">Fuel Type</label>  
                          <div class="col-md-6">
                            <select id="fuel_type" name="fuel_type" class="form-control">
                              <option value=""> --Select-- </option>

                            <?php 
                            $fuel_types = Vehicle::getFuelType();
                            foreach($fuel_types as $key=>$val){ ?>
                             
                                  <option value="<?php echo $key;?>" <?php echo ($key == $data[0]['fuel_type'])?'selected':'' ?> ><?php echo $val;?></option>

                            <?php } ?>

                            </select>
                          </div>
                        </div>

                        

                         <div class="form-group">
                          <label class="col-md-2 control-label" for="drive_type">Drive Type</label>  
                          <div class="col-md-6">
                          
                          <select id="drive_type" name="drive_type" class="form-control">
                              <option value=""> -- Select -- </option>

                            <?php 
                            $drive_type = Vehicle::getDriveType();
                            foreach($drive_type as $key=>$val){ ?>
                             
                                  <option value="<?php echo $key;?>" <?php echo ($key==$data[0]['drive_type'])?"selected":'' ?>><?php echo $val;?></option>

                            <?php } ?>

                            </select>
                          </div>
                        </div>

                         <div class="form-group">
                          <label class="col-md-2 control-label" for="auction_grade">Auction Grade</label>  
                          <div class="col-md-6">
                          <input id="auction_grade" name="auction_grade" type="text" placeholder="Auction Grade" class="form-control input-md" value="<?php echo $data[0]['auction_grade']; ?>">
                          </div>
                        </div>

                        <div class="form-group">
                          <label class="col-md-2 control-label" for="grade">Interior Condition(Grade)</label>  
                          <div class="col-md-6">
                          <input id="grade" name="grade" type="text" placeholder="Interior Condition" value="<?php echo $data[0]['grade']; ?>" class="form-control input-md">
                          </div>
                        </div>

                        <div class="form-group">
                          <label class="col-md-2 control-label" for="description">Description</label>  
                          <div class="col-md-6">
                          <textarea id="description" name="description" rows="5" cols="80" placeholder="Description" class="form-control input-md"> <?php echo $data[0]['description']; ?></textarea>
                          </div>
                        </div>

                        <div class="form-group">
                          <label class="col-md-2 control-label" for="status">Status</label>  
                          <div class="col-md-6">
                          <select id="status" name="status" class="form-control">

                          <?php 
                          $status = Common::getStatus();
                          foreach($status as $key => $val) { ?>
                           
                                <option value="<?php echo $key;?>" <?php if($key==$data[0]['status']){ echo 'selected="selected"';} ?>><?php echo $val;?></option>

                           <?php  } ?>

                        </select>
                          </div>
                        </div>

                        <div class="form-group">
                          <label class="col-md-2 control-label" for="is_featured">Featured on Home Page</label>  
                          <div class="col-md-6">
                          <select id="is_featured" name="is_featured" class="form-control">

                          <?php 
                          $featured = Vehicle::getIsFeastured();
                          foreach($featured as $key => $val) { ?>
                           
                                <option value="<?php echo $key;?>" <?php if($key==$data[0]['is_featured']){ echo 'selected="selected"';} ?>><?php echo $val;?></option>

                           <?php  } ?>
                        </select>
                          </div>
                        </div>

                        <div class="form-group">
                          <label class="col-md-2 control-label" for="is_latest">Is Latest</label>  
                          <div class="col-md-6">
                          <select id="is_latest" name="is_latest" class="form-control">

                          <?php 
                          $latest = Vehicle::getIsLatest();
                          foreach($latest as $key => $val) { ?>
                           
                                <option value="<?php echo $key;?>" <?php if($key==$data[0]['is_latest']){ echo 'selected="selected"';} ?>><?php echo $val;?></option>

                           <?php  } ?>
                        </select>
                          </div>
                        </div>

                        <div class="form-group">
                          <label class="col-md-2 control-label" for="seo_url">SEO URL</label>  
                          <div class="col-md-6">
                          <input id="seo_url" name="seo_url" type="text" placeholder="SEO URL" class="form-control input-md" value="<?php echo $data[0]['seo_url']; ?>">
                          </div>
                        </div>

                        <!-- Text input-->
                        <div class="form-group">
                          <label class="col-md-2 control-label" for="images">Images</label>  
                          <div class="col-md-10">
                            <input id="images" name="images[]" type="file" class="input-md" multiple>
                            <p class="help-block">Only .jpg and .png</p>
                            <?php
                            $images_arr = explode(',', $data[0]['images']);
                            if(count($images_arr)>0){
                              foreach ($images_arr as $key=>$image) { ?>
                                <div class="col-md-2" id="img_<?php echo $key; ?>"><img width="110" height="60" class="img-responsive" src="<?php echo SITE_URL ?>uploads/vehicles/<?php echo $image ?>">
                                </div>
                              <?php  
                              }
                            }
                            ?>
                            
                          </div>
                        </div>

                        <input type="hidden" name="action" value="update">
                        <input type="hidden" name="id" value="<?php echo $data[0]['id'] ?>">
                       
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
                vehicle_type: {required: true},
                vehicle_manufacturer: {required: true},
                vehicle_model: {required: true},
                transmission: {required: true},
                year: {required: true},
                fuel_type: {required: true},
                engine_capacity: {required: true},
                mileage: {required: true},
                
            },
            messages: {
                vehicle_type: "<p class='text-danger'>Please select vehicle type</p>",
                vehicle_manufacturer: "<p class='text-danger'>Please select vehicle manufacturer</p>",
                vehicle_model: "<p class='text-danger'>Please select vehicle model</p>",
                transmission: "<p class='text-danger'>Please select transmission type</p>",
                year: "<p class='text-danger'>Please select vehicle's year</p>",
                fuel_type: "<p class='text-danger'>Please select fuel type</p>",
                engine_capacity: "<p class='text-danger'>Please enter engine capacity</p>",
                mileage: "<p class='text-danger'>Please enter vehicle mileage</p>",
                 
            },

            submitHandler: function () {             

               // Get form
                var form = $('#edit_form')[0]; 

               // Create an FormData object
                var data = new FormData(form);   console.log(data);            

              $.ajax({
                 type: "POST",
                  enctype: 'multipart/form-data',
                  url: '../../../system/controllers/vehicle_controller.php',
                  data: data,
                  processData: false,
                  contentType: false,
                  cache: false,
                  timeout: 600000,

                 
                 success: function(res) {

                  console.log(res);

                    $('#form_submit_msg').show(); console.log(res);
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
    <script>
     $(document).ready(function(){
        loadVehicleModel('<?php echo $data[0]['vehicle_manufacturer'] ?>','<?php echo $data[0]['vehicle_model'] ?>');
        //setSeo();
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

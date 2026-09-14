<?php 
require_once '../../../system/config.php';
Sessions::adminRedirectOnNotLoggedIn();

$value = Common::getPermissions("vehicle-model","view");

if ($value== 1) {

?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Car Auction | Vehicle Model</title>
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
        <li class="active">Vehicle Models</li>
      </ol>
    </section>

    <!-- Main content -->
    <section class="content">
      <div class="row">
        <div class="col-lg-2">
              <?php 
              $val = Common::getPermissions("vehicle-model","add");
              if ($val== 1) {  ?>


              <a class="btn btn-danger" href="<?php echo SITE_URL; ?>admin/modules/vehicle-model/add.php"><i class="fa fa-plus fa-fw"></i> Add Vehicle Model</a>

              <?php  } ?>

            <br><br>
        </div> 
        <div class="col-lg-12">
          <div class="box box-info">
  
            <div class="box">
              <div class="box-header">
                <h3 class="box-title">Vehicle Models</h3>
              </div>
              <!-- /.box-header -->
              <div class="box-body">
                <table id="example2" class="table table-bordered table-hover">
                  <thead>
                  <tr>
                   <th>#</th>
                      <th>Name</th>
                      <th>Manufacturer</th>
                      <th>Action</th>
                    </tr>
                  </thead>


                  <tbody id="content">
                  
                 
                
                  </tbody>
                  <tfoot>
                 
                  </tfoot>
                </table>
                <div id="form_submit_msg"></div>
                <div class="pull-right" id="pagination"></div>
                <div id="modal_content"></div>
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
<script>
    $( function() {
      <?php 
      $get = htmlentities($_GET['page']);
      if(isset($get)){
        $page = htmlentities($_GET['page']);
      }else{
        $page = 1;
      }

       ?>
        loadData(<?php echo $page; ?>);
    } );

    function loadData(page){
        $.ajax({
                 type: 'POST',
                 url: '../../../system/controllers/vehicle_model_controller.php',
                 data: "&action=index&page="+page,
                 success: function(res) {
                  var obj = jQuery.parseJSON(res);
                    $('#content').html(obj.table);
                    $('#modal_content').html(obj.modal);
                    $('#pagination').html(obj.pagination);
                 },
             });
    }

    function deleteUser(id){

      bootbox.confirm("Are you sure you want to Delete this vehicle model..?", function(result){ 
 

if (result==true) {  
      $.ajax({
           type: 'POST',
           url: '../../../system/controllers/vehicle_model_controller.php',
           data: "&id="+id+"&action=destroy",
           success: function(res) { console.log(res);

              $('#row'+id).fadeOut(1000,function(){
            showFrontFormMessage('#form_submit_msg','success',{message:"Deleted Successfully"});  
          });
           },
      });

}

})
    }
  </script>

 <?php include "../../includes/footerscript.php" ?>
</body>
</html>


<?php   
  
}else{

  header("Location: ".SITE_URL."admin/");
}

 ?>
<?php 

require_once '../../../system/config.php';
Sessions::adminRedirectOnNotLoggedIn();

$value = Common::getPermissions("users","edit");

if ($value== 1) {

$id = htmlentities($_GET['id']);

$users = new Users();
$data = $users->getById($id);

$userpermissions = new Userpermissions();
$userpermissionsdata = $userpermissions->selectAll();



?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Car Auction | Edit Users</title> 
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
        <li class="active">Add Users</li>
      </ol>
    </section>

    <!-- Main content -->
   <section class="content">
      <div class="row">
        <div class="col-lg-2">
              
            <a href="<?php echo SITE_URL; ?>admin/modules/users/" class="btn btn-primary"><i class="fa fa-eye fa-fw"></i> View Users</a>
            <br><br>
        </div> 
        <!-- /.col -->
        <div class="col-lg-12">
          <div class="box box-info">
            <!-- /.box -->
            <div class="box">
              <div class="box-header">
                <h3 class="box-title">Edit Users</h3>
              </div>
              <!-- /.box-header -->
              <div class="box-body">
                
                <div class="margin-top-10">
                  
                  <form class="form-horizontal" id="edit_form">

                  <div class="form-group">
                        <label class="col-md-2 control-label" for="first_name">User Type</label>  
                        <div class="col-md-10">

                        <select id="type" name="type" class="form-control">

                         

                        <?php foreach ($userpermissionsdata as $key) { ?>
                         
                             

                              <option value="<?php echo $key[id]; ?>"  <?php
                                 if ($key[id] == $data[0]['type']) {
                                      echo 'selected="selected"';
                                     }
                                     ?>>
                                       <?php echo $key[username]; ?>
                              </option>

                         <?php  } ?>



                      </select>

                        </div>
                      </div>

                    <!-- Text input-->
                    <div class="form-group">
                      <label class="col-md-2 control-label" for="first_name">First Name</label>  
                      <div class="col-md-10">
                      <input id="id" name="id" type="hidden" value="<?php echo $data[0]['id'] ?>">
                      <input id="first_name" name="first_name" type="text" placeholder="Enter User Name" class="form-control input-md" value="<?php echo $data[0]['first_name'] ?>">
                      </div>
                    </div>

                    <!-- Text input-->
                    <div class="form-group">
                      <label class="col-md-2 control-label" for="last_name">Last Name</label>  
                      <div class="col-md-10">
                      <input id="last_name" name="last_name" type="text" placeholder="Enter Last Name" class="form-control input-md" value="<?php echo $data[0]['last_name'] ?>">
                      </div>
                    </div>

                    <!-- Text input-->
                    <div class="form-group">
                      <label class="col-md-2 control-label" for="email">Email</label>  
                      <div class="col-md-10">
                      <input id="email" name="email" type="text" placeholder="Email" class="form-control input-md" value="<?php echo $data[0]['email'] ?>">
                      </div>
                    </div>

                    <!-- Text input-->
                    <div class="form-group">
                      <label class="col-md-2 control-label" for="username">Username</label>  
                      <div class="col-md-10">
                      <input id="username" name="username" type="text" placeholder="Enter Username" class="form-control input-md" value="<?php echo $data[0]['username'] ?>">
                      </div>
                    </div>

                   

                    <!-- Text input-->
                    <div class="form-group">
                      <label class="col-md-2 control-label" for="password">Password<br><small> (keep this field empty to use the existing password)</small></label>  
                      <div class="col-md-10">
                      <input id="password" name="password" type="password" placeholder="Enter Password" class="form-control input-md">
                      </div>
                    </div>                        

                    <button class="btn btn-danger pull-right" type="submit" id="submit_btn">Update</button>
                    

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
                first_name: {required: true},
                last_name: {required: true},
                username: {required: true},
                email: {required: true,email: true},
            },
            messages: {
                first_name: "<p class='text-danger'>Please enter first name</p>",
                last_name: "<p class='text-danger'>Please enter last name</p>",
                username: "<p class='text-danger'>Please enter username</p>",
                email: {
                  required: "<p class='text-danger'>Please enter a email address</p>",
                  email: "<p class='text-danger'>Please enter valid email address</p>"
                },               
                
            },
            submitHandler: function () {

              var url_data = $('#edit_form').serialize();
              url_data += "&action=update"; console.log(url_data);

              $.ajax({
                 type: 'POST',
                 url: '../../../system/controllers/users_controller.php',
                 data: url_data,
                 success: function(res) {
                    $('#form_submit_msg').show(); console.log(res);
                    if($.trim(res)==200){
                      showFrontFormMessage('#form_submit_msg','success',{message:'Successfully Updated'});
                      //$('#form_submit_msg').html('<p class="alert alert-success"> Successfully Updated</p>');
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

<?php 
require_once '../../../system/config.php';
Sessions::adminRedirectOnNotLoggedIn();


$value = Common::getPermissions("userpermissions","add");

if ($value== 1) {

$path = "../../modules/";
$dir = new DirectoryIterator($path);
$i = 0;
foreach ($dir as $fileinfo) {
    if ($fileinfo->isDir() && !$fileinfo->isDot()) {
        //echo $fileinfo->getFilename().'<br>';
        $arrayDir[$i] = $fileinfo->getFilename() ;
        $i++;
    }
}
//print_r($arrayDir);die();   

?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Car Auction | Add User Permissions</title>
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
        <li class="active">Add User Permissions</li>
      </ol>
    </section>

    <!-- Main content -->
   <section class="content">
      <div class="row">
            
          <!-- /.col-lg-10 -->
          <div class="col-lg-2">
              
              <a href="<?php echo SITE_URL; ?>admin/modules/userpermissions/" class="btn btn-primary"><i class="fa fa-eye" aria-hidden="true"></i> View User Permissions</a>
              <br><br>
          </div>
      
      
        <!-- /.col -->
       <div class="col-lg-12">
            <div class="box box-info">
          <!-- /.box -->
              <div class="box">
            
            
                    <div class="box-header with-border">
                      <h3 class="box-title">Add User Permissions</h3>
                    </div>
            <!-- /.box-header -->
                  <div class="box-body">
                    
                    <div class="margin-top-10">
                      <form class="form-horizontal" id="add_form">

                     
                    

                          <!-- Text input-->
                          <div class="form-group">
                            <label class="col-md-2 control-label" for="name">Permissions Group Name</label>  
                            <div class="col-md-10">
                            <input id="name" name="name" type="text" placeholder="Enter Permissions Group Name" class="form-control input-md">
                            </div>
                          </div>


                          <!--   module select -->
                          
                          <div style="padding-left: 15px" class="form-group">
                           <label class="col-md-2 control-label" for="permissions">Permissions</label>
                          <table style="width: 750px;" id="" class="table table-bordered table-hover">
                      <thead>
                     
                       <th>#Module &nbsp; &nbsp; &nbsp;  #Check All<input id="checkAll" type="checkbox"  value=""  >   </th>
                       <th><input id="add" type="checkbox"  value=""  >#Add</th>
                       <th><input id="edit" type="checkbox" value=""  >#Edit</th>
                       <th><input id="delete" type="checkbox" value="" >#Delete</th>
                       <th><input id="view" type="checkbox" value=""  >#View</th>
                       <th><input id="other" type="checkbox" value=""  >#Other</th>
                        
                       
                      </thead>


                      <tbody>


                    


                       <?php  for ($i=0; $i < count($arrayDir) ; $i++) {  ?>
                        

                          <tr id="<?php echo $arrayDir[$i]; ?>" class="module_name">
                          <th><?php echo $arrayDir[$i]; ?></th>


                          <th>
                          <div>
                          <label><input class="add"  type="checkbox" name="add" value=""> add</label>
                          </div>
                          </th>


                          <th> 
                          <div>
                          <label><input class="edit" type="checkbox" name="edit" value=""> edit</label>
                          </div>
                          </th>

                          <th> 
                          <div>
                          <label><input  class="delete" type="checkbox" name="delete" value=""> delete</label>
                          </div>
                          </th>

                          <th> 
                          <div>
                          <label><input class="view"  type="checkbox" name="view" value=""> View</label>
                          </div>
                          </th>

                          <th> 
                          <div>
                          <label><input class="other"  type="checkbox" name="other" value=""> Other</label>
                          </div>
                          </th>


                         
                          </tr>


                         <?php }  ?>



                    
                      </tbody>

                    <!--   ARRAY*********** -->

                      <input id="permissions" hidden="" type="" name="permissions" value="">

                    <!--   ARRAY*********** END-->
                     
                    </table>
                    </div>
                  


                    <div class="form-group">
                      <div class="col-md-12">
                      <button class="btn  btn-danger pull-right" type="submit" id="submit_btn" >Save</button>              
                      </div>
                    </div>




                </form>


            

              </div>
                  <div id="form_submit_msg"></div>
            </div>
            <!-- /.box-body -->
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

$("#checkAll").click(function(){
    $('input:checkbox').not(this).prop('checked', this.checked);
});

$('#add').click(function() { 
    if ($(this).is(':checked')) {       
        $('.add').prop('checked', true);        
      
    } else {        
        $('.add').prop('checked', false);         
    }
});

$('#edit').click(function() {
    if ($(this).is(':checked')) {
        $('.edit').prop('checked', true);
         
    } else {
        $('.edit').prop('checked', false);
         
    }
});

$('#delete').click(function() {
    if ($(this).is(':checked')) {
        $('.delete').prop('checked', true);
         
    } else {
        $('.delete').prop('checked', false);
         
    }
});

$('#view').click(function() {
    if ($(this).is(':checked')) {
        $('.view').prop('checked', true);
         
    } else {
        $('.view').prop('checked', false);
         
    }
});

$('#other').click(function() {
    if ($(this).is(':checked')) {
        $('.other').prop('checked', true);
         
    } else {
        $('.other').prop('checked', false);
         
    }
});




  function checkboxfun(){


        $('input[type="checkbox"]').each(function(){
            if($(this).is(":checked")){
                this.value = 1;
            }
            else if($(this).is(":not(:checked)")){
                this.value = 0;
            }
        }); 

      var permission_array = {};
  
  $('.module_name').each(function(){
     var values = {};
    
     $("input[type=checkbox]",this).each(function(){
      var key = $(this).val();

      var name = $(this).attr('name');

    
      values[name] = values[name] || []
      values[name].push(key)

      });
      var key = $(this).attr('id');
   
   if(typeof(values) !== 'undefined'){
     permission_array[key] = permission_array[key] || []
     permission_array[key].push(values);
   }
   });
   
   var string = JSON.stringify(permission_array);

  document.getElementById('permissions').value = string;
}
</script>




<script type="text/javascript">
    $(document).ready(function(){
        
        
        $("#add_form").validate({
            rules: {
            
                 name: {required: true}
                
               
            },
            messages: {
              
                name: "<p class='text-danger'>Please enter Permissions Group Name</p>",                            
                
            },
            submitHandler: function () {

              checkboxfun();

              var url_data = $('#add_form').serialize();
              url_data += "&action=store"; //console.log(url_data);

              $.ajax({
                 type: 'POST',
                 url: '../../../system/controllers/userpermissions_controller.php',
                 data: url_data,
                 success: function(res) {
                    $('#form_submit_msg').show(); //console.log(res);
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


<!-- // array Creat *************** -->






 <?php include "../../includes/footerscript.php" ?>
</body>
</html>

<?php   
  
}else{

  header("Location: ".SITE_URL."admin/");
}

  ?>
<?php 

require_once '../../../system/config.php';
Sessions::adminRedirectOnNotLoggedIn();

$value = Common::getPermissions("userpermissions","edit");

if ($value== 1) {

$id = htmlentities($_GET['id']);

$userpermissions = new Userpermissions();
$data = $userpermissions->getById($id);

//$editpermission = json_decode($data[0]['permissions'],TRUE);

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

?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Car Auction | Edit User Permission</title> 
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
        <li class="active">Edit User Permissions</li>
      </ol>
    </section>

    <!-- Main content -->
   <section class="content">
      <div class="row">
        <div class="col-lg-2">
              
            <a href="<?php echo SITE_URL; ?>admin/modules/userpermissions/" class="btn btn-primary"><i class="fa fa-eye fa-fw"></i> View User Permissions</a>
            <br><br>
        </div> 
        <!-- /.col -->
       
          <!-- /.box -->
        <div class="col-lg-12">
            <div class="box box-info">
              <div class="box">
                <div class="box-header with-border">
              <h3 class="box-title">Edit User Permissions</h3>
              <!-- <a class="btn btn-danger pull-right" href="<?php echo SITE_URL; ?>modules/userpermissions/"><i class="fa fa-eye fa-fw"></i> View User Permissions</a> -->
            </div>
            <!-- /.box-header -->
            <div class="box-body">
              
              <div class="margin-top-10">
                
                <form class="form-horizontal" id="edit_form">

                <div class="form-group">
                   
                    </div>

               

                  <!-- Text input-->
                  
                  <div class="form-group">
                    <label class="col-md-2 control-label" for="name">Permissions Group Name</label>  
                    <div class="col-md-10">
                    <input id="name" name="name" type="text" placeholder="Enter Permissions Group Name" class="form-control input-md" value="<?php echo $data[0]['name'] ?>">
                    <input id="id" name="id" type="hidden" value="<?php echo $data[0]['id'] ?>">

                    </div>
                  </div>                   


              
                <!--   module select -->

                  <div style="padding-left: 15px"  class="form-group">
                  <label class="col-md-2 control-label" for="username">Permissions</label>
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
                    <div class="checkbox">
                    <label><input class="add" id="add<?php echo $arrayDir[$i]; ?>"  name="add" class="val" type="checkbox" value=""> add</label>
                    </div>
                    </th>


                    <th> 
                    <div class="checkbox">
                    <label><input class="edit" id="edit<?php echo $arrayDir[$i]; ?>" name="edit" class="val" type="checkbox" value=""> edit</label>
                    </div>
                    </th>

                    <th> 
                    <div class="checkbox">
                    <label><input class="delete" id="delete<?php echo $arrayDir[$i]; ?>"  name="delete" class="val" type="checkbox" value=""> delete</label>
                    </div>
                    </th>

                     <th> 
                    <div class="checkbox">
                    <label><input class="view" id="view<?php echo $arrayDir[$i]; ?>"  name="view" class="val" type="checkbox" value=""> view</label>
                    </div>
                    </th>

                     <th> 
                    <div class="checkbox">
                    <label><input class="other" id="other<?php echo $arrayDir[$i]; ?>"  name="other" class="val" type="checkbox" value=""> other</label>
                    </div>
                    </th>


                   
                    </tr>


                   <?php }  ?>
              
                </tbody>
                 </tbody>

              <!--   ARRAY*********** -->

                <input id="permissions" hidden="" type="" name="permissions" value="">

              <!--   ARRAY*********** END-->
              </table>
              </div>                       

                  <button class="btn btn-danger pull-right" type="submit" id="submit_btn">Update</button>
                  

                </form>

              </div>
                  
            </div>
            <!-- /.box-body -->
          </div>
          <div id="form_submit_msg"></div>
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
                
                name: "<p class='text-danger'>Please enter Permissions Group Name</p>",
                             
                
            },
            submitHandler: function () {

              checkboxfun();

              var url_data = $('#edit_form').serialize();
              url_data += "&action=update"; console.log(url_data);

              $.ajax({
                 type: 'POST',
                 url: '../../../system/controllers/userpermissions_controller.php',
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

    <script type="text/javascript">


    $(document).ready(function(){

      var permissionOBJ = <?php echo json_encode($data[0]['permissions']); ?> ; // this is how you parse a php into js 

      var permissionJSON = JSON.parse(permissionOBJ);     // this is how you parse a string into JSON 
      
   
             
     
    for (var key in permissionJSON) {
      // console.log(key);                                        //user ,client
      // console.log(permissionJSON[key]);

       var data = permissionJSON[key];

       for (var i = 0; i < data.length; i++) {

         for (var key2 in data[i]) {                            //add ,edit, delete

            var chkboxid = key2 + key;                          //create add edit delete id        
            var data2 = data[i][key2];   
          //  console.log(chkboxid);



           if (data2==0) {

            // console.log(0);                                      //assign value 1 or 0
             document.getElementById(chkboxid).value = 0;
           
           }else{

             console.log(1);
             document.getElementById(chkboxid).value = 1;
             document.getElementById(chkboxid).checked = true;
           }




         }

       }
     
   }
    
    

  });


    </script>

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


 <?php include "../../includes/footerscript.php" ?>

</body>
</html>
<?php   
  
}else{

  header("Location: ".SITE_URL."admin/");
}

  ?>
<!DOCTYPE html>
<html>
<head>
	<title></title>
</head>
<body>

<form>
	<div class="input_fields_wrap">
    <button class="add_field_button">Add More Fields</button>
    <div><input type="text" name="mytext[]"></div>
</div>
</form>



</body>
</html>

<script type="text/javascript">
	
	$(document).ready(function() {
    var max_fields      = 10; //maximum input boxes allowed
    var wrapper         = $(".input_fields_wrap"); //Fields wrapper
    var add_button      = $(".add_field_button"); //Add button ID
    
    var x = 1; //initlal text box count
    $(add_button).click(function(e){ //on add input button click
        e.preventDefault();
        if(x < max_fields){ //max input box allowed
            x++; //text box increment
            $(wrapper).append('<div><input type="text" name="mytext[]"/><a href="#" class="remove_field">Remove</a></div>'); //add input box
        }
    });
    
    $(wrapper).on("click",".remove_field", function(e){ //user click on remove text
        e.preventDefault(); $(this).parent('div').remove(); x--;
    })
});
</script>


<div><input type="text" name="mytext[]"/><a href="#" class="remove_field">Remove</a></div>

 <div><select id="type" name="mytext[]" class="remove_field">

     <option selected="true" disabled="disabled">-- select developer-- </option> 

      <?php foreach ($developers_data as $key) { ?>
                       
     <option value="<?php echo $key[id];?>"><?php echo $key[first_name];?></option>

          <?php  } ?>                      

</select></div>


                  <div><select name="mytext[]" class="remove_field">
                      <option selected="true" value="0">Lead</option>                    

                       <option value="1">Client</option>                 

                    </select></div>
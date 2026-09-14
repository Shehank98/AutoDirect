
function loadVehicleModel(manufacturer_id,model_id){

  if(typeof model_id === 'undefined'){
    var model_id = '';
  }
  
  $('#vehicle_model').empty();
  
  var url_data = "&manufacturer_id="+manufacturer_id+"&action=loadVehicleModels";
  $.ajax({
     type: "POST",
     url: http_path+'system/controllers/vehicle_model_controller.php',
     data: url_data,
     
     success: function(res) {
        var dataArr = JSON.parse(res);

        if(dataArr.length>0){
          var out = '<option value=""> --Select-- </option>';
          for(var i=0; i<dataArr.length; i++){
            out += '<option value="'+dataArr[i].id+'" ';
            if(dataArr[i].id==model_id){
              out += 'selected ';
            }
            out += '>'+dataArr[i].name+'</option>';
          }
          $('#vehicle_model').html(out);
          
        }else{
          $('#vehicle_model').html('<option value=""> --Select-- </option>');
        }

        
     },
  });
}

function setSeo(){
  var url_data = {};
  var type = $("#vehicle_type option:selected").text();
  var manufacturer = $("#vehicle_manufacturer option:selected").text();
  var model = $("#vehicle_model option:selected").text(); 

  url_data += '&type='+type+'&manufacturer='+manufacturer+'&model='+model+"&action=setSeo"; console.log(url_data);
  
  $.ajax({
     type: "POST",
     url: http_path+'system/controllers/vehicle_controller.php',
     data: url_data,
     
     success: function(res) {
        console.log(res);
  
        $('#seo_url').val(res);

     },
  });
  
}

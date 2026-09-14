function loadModelsLocal(manufacturer_id,model_id){
  if(typeof model_id === 'undefined'){
    var model_id = '';
  }

  
  
  $('#model').empty();

  //load year dropdown
  loadYearLocal(manufacturer_id);
  //load color dropdown
  loadColoursLocal(manufacturer_id);
  
  var url_data = "&manufacturer_id="+manufacturer_id+"&action=loadVehicleModels";
  $.ajax({
     type: "POST",
     url: http_path+'system/controllers/vehicle_model_controller.php',
     data: url_data,
     
     success: function(res) {
        var dataArr = JSON.parse(res);

        if(dataArr.length>0){
          var out = '<option value="">Select Model</option>';
          for(var i=0; i<dataArr.length; i++){
            out += '<option value="'+dataArr[i].id+'" ';
            if(dataArr[i].id==model_id){
              out += 'selected ';
            }
            out += '>'+dataArr[i].name+'</option>';
          }
          $('#model').html(out);
          
        }else{
          $('#model').html('<option value="">Select Model</option>');
        }

        
     },
  });
}

function loadYearLocal(manufacturer_id,model_id){
	var manufacturer_id = $('#manufacturer option:selected').val();
	if(typeof model_id === 'undefined'){
	    var model_id = '';
	}else{
		loadColoursLocal(manufacturer_id,model_id);
	}
	
	$('#year').empty();
	$('#to_year').empty();

	//if(manufacturer_id === 'undedined'){
	    
	    //
	//}
	var url_data = "&manufacturer_id="+manufacturer_id+"&model_id="+model_id+"&action=loadYearLocal"; console.log(url_data);
	$.ajax({
	     type: "POST",
	     url: http_path+'system/controllers/vehicle_controller.php',
	     data: url_data,
	     
	     success: function(res) {
	        var obj = JSON.parse(res); console.log(res);
	        var years = obj.years;
	        //searchVehiclesLocal(1);

	        if(years.length>0){
	          var out = '<option value="">Select Year</option>';
	          for(var i=0; i<years.length; i++){
	            out += '<option value="'+years[i].year+'" ';
	            
	            out += '>'+years[i].year+'</option>';
	          }
	          $('#year').html(out);
	          $('#to_year').html(out);
	          
	        }else{
	          $('#year').html('<option value="">Select Year</option>');
	          $('#to_year').html('<option value="">Select Year</option>');
	        }

	        
	     },
	  });
}

function loadColoursLocal(manufacturer_id,model_id){

	
	$('#color').empty();
	var from_year = $('#year option:selected').val();
	var to_year = $('#to_year option:selected').val();
	//if(manufacturer_id === 'undedined'){
	var manufacturer_id = $('#manufacturer option:selected').val();
	var model_id = $('#model option:selected').val();

	if(typeof model_id === 'undefined'){
	     model_id = '';
	}
	if(typeof manufacturer_id === 'undefined'){
	     manufacturer_id = '';
	}

	if(typeof from_year === 'undefined'){
	     from_year = '';
	}
	if(typeof to_year === 'undefined'){
	     to_year = '';
	}
	//}
	var url_data = "&manufacturer_id="+manufacturer_id+"&model_id="+model_id+"&from_year="+from_year+"&to_year="+to_year+"&action=loadColoursLocal"; console.log(url_data);
	$.ajax({
	     type: "POST",
	     url: http_path+'system/controllers/vehicle_controller.php',
	     data: url_data,
	     
	     success: function(res) {
	        var obj = JSON.parse(res); console.log(res);
	        var colors = obj.colors;
	        searchVehiclesLocal(1);

	        if(colors.length>0){
	          var out = '<option value="">Select Colour</option>';
	          for(var i=0; i<colors.length; i++){
	            out += '<option value="'+colors[i].id+'" ';
	            
	            out += '>'+colors[i].color+'</option>';
	          }
	          $('#color').html(out);
	          
	          
	        }else{
	          $('#color').html('<option value="">Select Colour</option>');
	          
	        }

	        
	     },
	  });
}

function searchVehiclesLocal(page){ 
  $('#car_listing').empty();

  $("#loading").show();

  var type = $('input[name=type]:checked', '#filter_vehicles_local').val();//$('#filter_vehicles_local #type option:selected').val();
  var manufacturer = $('#search_vehicles_local #manufacturer option:selected').val();
  var model = $('#search_vehicles_local #model option:selected').val();
  var year = $('#search_vehicles_local #year option:selected').val();

  if (typeof type === "undefined") { type ='';}
  if (typeof manufacturer === "undefined") { manufacturer ='';}
  if (typeof model === "undefined") { model ='';}
  if (typeof year === "undefined") { year ='';}

  var url_data = "&type="+type;
  url_data += "&manufacturer="+manufacturer;
  url_data += "&model="+model;
  url_data += "&year="+year;
  url_data += "&page="+page+"&action=searchVehicles"; 
  url_data += '&current_url='+encodeURIComponent(window.location.href); console.log(url_data);
  
  $.ajax({
     type: "POST",
      url: http_path+'system/controllers/frontend_controller.php',
      data: url_data,

      success: function(res) { 
        $("#loading").hide();
        var obj = jQuery.parseJSON(res);
        $('#car_listing').html(obj.table); console.log(obj.count);
        $('#pagination').html(obj.pagination);
        $('#car_count').html(obj.count+' <span>vehicle(s) found.</span>');
     },
  });
}

function addToCompareLocal(vehicle_id,input_id){ console.log(input_id); console.log('added');

	var url_data = "&vehicle_id="+vehicle_id+"&action=addToCompareLocal"; console.log('checked='+$('#'+input_id).prop("checked"));
	
	if($('#'+input_id).prop("checked")){ 
		$('#'+input_id).attr('checked', "checked");
		$('head').append('<style>#label_'+input_id+':before{content: "\2713";font-size: 12px;text-align: center;line-height: 14px;}</style>');
		console.log(url_data);
		$.ajax({
		    type: "POST",
		    url: http_path+'system/controllers/frontend_controller.php',
		    data: url_data,

		    success: function(res) { 
		        var obj = jQuery.parseJSON(res);
		        if(obj.code==200){ console.log(obj.count);
		        	$('#compare_item_count').html(obj.count);	
		        }else{
		        	$('#'+input_id).removeAttr('checked');
		        }	        
		    },
		});
	}else{ 
		removeFromCompareLocal(vehicle_id);
		$('#'+input_id).removeAttr('checked');
	}
	
}

function addToCompareLocalInner(vehicle_id,input_id){ console.log(input_id); console.log('added');

	var url_data = "&vehicle_id="+vehicle_id+"&action=addToCompareLocal"; //console.log('checked='+$('#'+input_id).prop("checked"));
	
	if($('#'+input_id).prop("checked")==false){ 
		$('#'+input_id).attr('checked', "checked");
		$('head').append('<style>#label_'+input_id+':before{content: "2713";font-size: 12px;text-align: center;line-height: 14px;}</style>');
		console.log(url_data);
		$.ajax({
		    type: "POST",
		    url: http_path+'system/controllers/frontend_controller.php',
		    data: url_data,

		    success: function(res) { 
		        var obj = jQuery.parseJSON(res);
		        if(obj.code==200){ console.log(obj.count);
		        	$('#compare_item_count').html(obj.count);	
		        }else{
		        	$('#'+input_id).removeAttr('checked');
		        }	        
		    },
		});
	}else{ 
		removeFromCompareLocal(vehicle_id);
		$('#'+input_id).removeAttr('checked');
	}
	
}

function removeFromCompareLocal(vehicle_id){ console.log('removed');

	var url_data = "&vehicle_id="+vehicle_id+"&action=removeFromCompareLocal";
	$.ajax({
     	type: "POST",
    	url: http_path+'system/controllers/frontend_controller.php',
    	data: url_data,

    	success: function(res) { 
        	var obj = jQuery.parseJSON(res);
        	$('#compare_item_count').html(obj.count);
    	},
	});
}

function removeFromComparePageLocal(vehicle_id){
	removeFromCompareLocal(vehicle_id);
	window.setTimeout('location.reload()', 1000);
}

function logoutCustomer(){
	var url_data = "&action=logoutCustomer";
	$.ajax({
     	type: "POST",
    	url: http_path+'system/controllers/frontend_controller.php',
    	data: url_data,

    	success: function(res) { 
        	if($.trim(res)==200){
        		window.location.href = http_path+'my-account/login.php?logout=true';
        	}

    	},
	});
}

/**live auction functions**/
function loadManufacturerLive(manufacturer){
	if (typeof manufacturer === "undefined") { manufacturer ='';}
	var url_data = "&action=loadManufacturerLive";
	$.ajax({
     	type: "POST",
    	url: http_path+'system/controllers/frontend_controller.php',
    	data: url_data,

    	success: function(res) { 
    		var arr = $.parseJSON(res);
    		var dataarr = arr.data;
			var options = "";
			$("select#manufacturer_live").empty();

			options += '<option value="">Select Make </option>';
														
			for(var i=0; i<dataarr.length; i++){
				var selected = '';
				if(manufacturer==dataarr[i].MARKA_NAME){
					var selected = 'selected="selected"';
				}
													
				options += '<option value="' + dataarr[i].MARKA_NAME + '" ' +selected+'>' + dataarr[i].MARKA_NAME + '</option>';
			}

			$("select#manufacturer_live").html(options);
    		console.log(res);
    	},
	});
}

function loadAuctionDaysLive(){
	var url_data = "&action=loadAuctionDaysLive";
	$.ajax({
     	type: "POST",
    	url: http_path+'system/controllers/frontend_controller.php',
    	data: url_data,

    	success: function(res) { 
    		$("select#auction_date").html(res);
   //  		var arr = $.parseJSON(res);
   //  		var dataarr = arr.data;
			// var options = "";
			// $("select#auction_date").empty();

			// options += '<option value="">Select Auction Date </option>';
														
			// for(var i=0; i<dataarr.length; i++){
													
			// 	options += '<option value="' + dataarr[i].AUCTION_DATE + '">' + dataarr[i].AUCTION_DATE + '</option>';
			// }

			// $("select#auction_date").html(options);
   //  		console.log(res);
    	},
	});
}

function loadModelsLive(manufacturer,model){

	if (typeof model === "undefined") { model ='';}
	if (typeof manufacturer === "undefined") { manufacturer ='';}

	var url_data = "&action=loadModelsLive";
	url_data += '&manufacturer='+manufacturer;
	loadYearsLive(model,manufacturer);

	$.ajax({
     	type: "POST",
    	url: http_path+'system/controllers/frontend_controller.php',
    	data: url_data,

    	success: function(res) { 
    		var arr = $.parseJSON(res);
    		var dataarr = arr.data;
			var options = "";
			$("select#model_live").empty();

			options += '<option value="">Select Model </option>';
														
			for(var i=0; i<dataarr.length; i++){
				var selected = '';
				if(model==dataarr[i].MODEL_NAME){
					var selected = 'selected="selected"';
				}
													
				options += '<option value="' + dataarr[i].MODEL_NAME + '" '+selected+'>' + dataarr[i].MODEL_NAME + '</option>';
			}

			$("select#model_live").html(options);
    		console.log(res);
    	},
	});
}

function loadYearsLive(model,manufacturer,year){

	manufacturer =$('#manufacturer_live option:selected').val();
	if (typeof model === "undefined") { model ='';}
	if (typeof manufacturer === "undefined") { manufacturer=''; }
	if (typeof year === "undefined") { year ='';}
	//loadChassisNoLive(model); console.log('model-'+model);
	loadColoursLive();

	var url_data = "&action=loadYearsLive";
	url_data += '&manufacturer='+manufacturer;
	url_data += '&model='+model;
	$.ajax({
     	type: "POST",
    	url: http_path+'system/controllers/frontend_controller.php',
    	data: url_data,

    	success: function(res) { 
    		var arr = $.parseJSON(res);
    		var dataarr = arr.data;
			var options = "";
			$("select#year_live").empty();

			options += '<option value="">Select Model Year</option>';
														
			for(var i=0; i<dataarr.length; i++){
				var selected = '';
				if(year==dataarr[i].YEAR){
					var selected = 'selected="selected"';
				}
													
				options += '<option value="' + dataarr[i].YEAR + '" '+selected+'>' + dataarr[i].YEAR + '</option>';
			}

			$("select#year_live").html(options);
    		console.log(res);
    	},
	});
}

function loadChassisNoLive(model,manufacturer,chassis_no){

	if (typeof model === "undefined") { model ='';}
	if (typeof manufacturer === "undefined") { manufacturer =$('#manufacturer_live option:selected').val();}
	if (typeof chassis_no === "undefined") { chassis_no ='';}

	var url_data = "&action=loadChassisNoLive";
	url_data += '&manufacturer='+manufacturer;
	url_data += '&model='+model;
	$.ajax({
     	type: "POST",
    	url: http_path+'system/controllers/frontend_controller.php',
    	data: url_data,

    	success: function(res) { 
    		var arr = $.parseJSON(res);
    		var dataarr = arr.data;
			var options = "";
			$("select#chassis_no").empty();

			options += '<option value="">Select Chassis Code</option>';
														
			for(var i=0; i<dataarr.length; i++){
				var selected = '';
				if(chassis_no==dataarr[i].KUZOV){
					var selected = 'selected="selected"';
				}										
				options += '<option value="' + dataarr[i].KUZOV + '" '+selected+'>' + dataarr[i].KUZOV + '</option>';
			}

			$("select#chassis_no").html(options);
			if($('#loaded').length>0 && $('#loaded').val() != 1){
				$('#loaded').val('1');
				searchVehicle(1);
				
			}
			
    		console.log(res);
    	},
	});
}

function loadColoursLive(manufacturer_id,model_id){

	
	$('select#color_live').empty();
	var from_year = $('#year_live option:selected').val();
	var to_year = $('#to_year_live option:selected').val();
	//if(manufacturer_id === 'undedined'){
	var manufacturer_id = $('#manufacturer_live option:selected').val();
	var model_id = $('#model_live option:selected').val();

	if(typeof model_id === 'undefined'){
	     model_id = '';
	}
	if(typeof manufacturer_id === 'undefined'){
	     manufacturer_id = '';
	}

	if(typeof from_year === 'undefined'){
	     from_year = '';
	}
	if(typeof to_year === 'undefined'){
	     to_year = '';
	}
	//}
	var url_data = "&manufacturer_id="+manufacturer_id+"&model_id="+model_id+"&from_year="+from_year+"&to_year="+to_year+"&action=loadColoursLive"; console.log(url_data);
	$.ajax({
	     type: "POST",
	     url: http_path+'system/controllers/frontend_controller.php',
	     data: url_data,
	     
	     success: function(res) {
	        var obj = JSON.parse(res); console.log(res);
	        var colors = obj.colors;
	        searchVehiclesLocal(1);

	        if(colors.length>0){
	          var out = '<option value="">Select Colour</option>';
	          for(var i=0; i<colors.length; i++){
	            out += '<option value="'+colors[i].COLOR+'" ';
	            
	            out += '>'+colors[i].COLOR+'</option>';
	          }
	          $('#color_live').html(out);
	          
	          
	        }else{
	          $('#color_live').html('<option value="">Select Colour</option>');
	          
	        }

	        
	     },
	  });
}

function searchVehicle(page){

  $('#car_listing').empty();

  $("#loading").show();

  var chassis_no = $('#search_vehicles_live #chassis_no option:selected').val();
  var manufacturer = $('#search_vehicles_live #manufacturer_live option:selected').val();
  var model = $('#search_vehicles_live #model_live option:selected').val();
  var year = $('#search_vehicles_live #year_live option:selected').val();

  if (typeof chassis_no === "undefined") { chassis_no ='';}
  if (typeof manufacturer === "undefined") { manufacturer ='';}
  if (typeof model === "undefined") { model ='';}
  if (typeof year === "undefined") { year ='';}

  var url_data = "&manufacturer="+manufacturer;
  url_data += "&model="+model;
  url_data += "&year="+year;
  url_data += "&chassis_no="+chassis_no;
  url_data += "&enginecc=''";
  url_data += "&color=''";
  url_data += "&lotNo=''";
  url_data += "&available_days=''";
  url_data += "&page="+page;
  url_data += "&action=searchVehiclesLive";

   console.log(url_data);;
  
  $.ajax({
     type: "POST",
      url: http_path+'system/controllers/frontend_controller.php',
      data: url_data,

      success: function(res) { console.log(res);
        $("#loading").hide();
        var obj = jQuery.parseJSON(res);
        $('#car_listing').html(obj.table);
        $('#pagination').html(obj.pagination);
        
     },
  });
}

function setValues(manufacturer,model,chassis_no,year){


  loadManufacturerLive(manufacturer);
  loadModelsLive(manufacturer,model);
  loadYearsLive(model,manufacturer,year);
  loadChassisNoLive(model,manufacturer,chassis_no);
  loadAuctionDaysLive();

 
  	// $('#loaded').onchange(function(){
  	// 	searchVehicle(1);
  	// });
    
 
}

/* front alert messages */
function showFrontFormMessage(id,type,data){

	var icon = '';

	if(type=="success"){
		$(id).removeClass();
		$(id).addClass("alert alert-success");
		icon = '<i class="glyphicon glyphicon-ok-sign"></i> ';
	}

	if(type=="error"){
		$(id).removeClass();
		$(id).addClass("alert alert-danger");
		icon = '<i class="glyphicon glyphicon-remove-sign"></i> ';
	}

	$(id).html(data.message).prepend(icon).slideDown().on('click',function(){
		$(id).fadeOut();
	});

	setTimeout(function(){ $(id).fadeOut(); },3000);

}

function clearFormFieldsFront(id){

  	$(id).find('input:text, input:password, input:file, select, textarea').val('');
      	$(id).find('input:radio, input:checkbox')
           .removeAttr('checked').removeAttr('selected');

}

function clearSearchFields(id){
	clearFormFieldsFront(id);
	searchVehiclesLocal(1);
}
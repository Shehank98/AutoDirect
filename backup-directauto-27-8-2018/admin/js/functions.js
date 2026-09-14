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

function loadDashboardFunctions(){
	
}

function getTotalServers(){

}

function getFirstReminderSentCount(){

}

function getSecondReminderSentCount(){
	
}
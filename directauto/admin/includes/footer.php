<footer class="main-footer">
    <div class="pull-right hidden-xs">
      <b>Version</b> 1.0
    </div>
    <strong>Copyright &copy; <?php echo date('Y',time()); ?> <a href="">Car Auction</a>.</strong> All rights
    reserved.
  </footer>

  <script>var http_path = "<?php echo SITE_URL; ?>"</script>

  	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.0/jquery.min.js"></script>
	<script type="text/javascript" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
	<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
	<script src="<?php echo SITE_URL; ?>admin/js/functions.js"></script>	
	<script src="<?php echo SITE_URL; ?>admin/main.js"></script>

	<script type="text/javascript">
		
	function doLogout(){
		$.ajax({
	         type: 'POST',
	         url: '<?php echo SITE_URL;?>system/controllers/users_controller.php',
	         data: "&action=logout",
	         success: function(res) {
	            if($.trim(res)==200){
	              window.location.href= '<?php echo SITE_URL ?>/admin/';
	            }else{
	            }
	         },
	    });
	}	

	</script>
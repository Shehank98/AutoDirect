<?php
$manufactures = new vehicleManufacturer();
$manufacturer_data_footer_links = $manufactures->selectAllFeatured();
$manufacturer_data_footer = $manufactures->selectAllActive();
?>
<!--Brands-->
<section class="brand-section gray-bg">
  <div class="container">
    <div class="brand-hadding">
      <h5>Popular Brands</h5>
    </div>
    <div class="brand-logo-list">
      <div id="popular_brands">
        <?php foreach ($manufacturer_data_footer as $manufacturer) {?>
         
        
        <div><a href="<?php echo SITE_URL; ?>our-stock/?manufacturer=<?php echo $manufacturer['id']; ?>"><img src="<?php echo SITE_URL; ?>uploads/vehicle-manufacturer/<?php echo $manufacturer['image']; ?>" class="img-responsive" alt="<?php echo $manufacturer['name']; ?>"></a></div>
        <?php } ?>
        <!-- <div><a href="#"><img src="<?php echo SITE_URL; ?>images/logos/benz.png" class="img-responsive" alt="image"></a></div>
        <div><a href="#"><img src="<?php echo SITE_URL; ?>images/logos/honda.png" class="img-responsive" alt="image"></a></div>
        <div><a href="#"><img src="<?php echo SITE_URL; ?>images/logos/jaguar.png" class="img-responsive" alt="image"></a></div>
        <div><a href="#"><img src="<?php echo SITE_URL; ?>images/logos/mazda.png" class="img-responsive" alt="image"></a></div>
        <div><a href="#"><img src="<?php echo SITE_URL; ?>images/logos/suzuki.png" class="img-responsive" alt="image"></a></div>
        <div><a href="#"><img src="<?php echo SITE_URL; ?>images/logos/toyota.png" class="img-responsive" alt="image"></a></div> -->
      </div>
    </div>
  </div>
</section>
<!-- /Brands--> 

<!--Footer -->
<footer>
  <div class="footer-top">
    <div class="container">
      <div class="row">
        <div class="col-md-3 col-sm-6">
          <h6>Top Categores</h6>
          <ul>
            <?php foreach($manufacturer_data_footer_links as $manufacturer){ ?>
            <li><a href="<?php echo SITE_URL; ?>our-stock/?manufacturer=<?php echo $manufacturer['id']; ?>"><?php echo $manufacturer['name']; ?></a></li>
            <?php } ?>
          </ul>
        </div>
        <div class="col-md-3 col-sm-6">
          <h6>About Us</h6>
          <ul>
            <li><a href="<?php echo SITE_URL;?>about-us/">About Us</a></li>
            <li><a href="<?php echo SITE_URL;?>how-to-buy/">How To Buy</a></li>
            <li><a href="<?php echo SITE_URL;?>/how-to-read-auction-sheet/">How to Read Auction Sheet</a></li>
            <li><a href="<?php echo SITE_URL;?>vocabulary/">Vocabulary</a></li>
           
          </ul>
        </div>
        <div class="col-md-3 col-sm-6">
          <h6>My Account</h6>
          <ul>
             <li><a href="<?php echo SITE_URL;?>my-account/">My Account</a></li>
             <li><a href="<?php echo SITE_URL;?>my-account/live-auction-request.php?live_auction=true">Request A Quote</a></li>
            <li><a href="<?php echo SITE_URL;?>my-account/login.php">Login</a></li>
            <li><a href="<?php echo SITE_URL;?>my-account/register.php">Register</a></li>

          </ul>
        </div>
        <div class="col-md-3 col-sm-6">
          <h6>Subscribe Newsletter</h6>
          <div class="newsletter-form">
            <form name="newsletter" id="newsletter" method="post">
              <div class="form-group">
                <input type="text" class="form-control newsletter-input" name="newsletter_name" id="newsletter_name" required placeholder="Enter your Name" />
              </div>
              <div class="form-group">
                <input type="text" class="form-control newsletter-input" name="newsletter_email" id="newsletter_email" required placeholder="Enter Email Address" />
              </div>
              <button type="submit" id="newsletter_submit" class="btn btn-block">Subscribe <span class="angle_arrow"><i class="fa fa-angle-right" aria-hidden="true"></i></span></button>
              <div id="newsletter_submit_msg"></div>
            </form>
            
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container">
      <div class="row">
        <div class="col-md-6 col-md-push-6 text-right">
          
        </div>
        <div class="col-md-6 col-md-pull-6">
          <p class="copy-right">Copyrights <?php echo date('Y'); ?> directautoimport.lk. All Rights Reserved</p>
        </div>
      </div>
    </div>
  </div>
</footer>
<!-- /Footer--> 

<!--Back to top-->
<div id="back-top" class="back-top"> <a href="#top"><i class="fa fa-angle-up" aria-hidden="true"></i> </a> </div>
<!--/Back to top--> 


<!--Forgot-password-Form -->
<div class="modal fade" id="forgotpassword">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">

        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h3 class="modal-title">Password Recovery</h3>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="forgotpassword_wrap">
            <div class="col-md-12">
              <form action="#" method="get">
                <div class="form-group">
                  <input type="email" class="form-control" placeholder="Your Email address*">
                </div>
                <div class="form-group">
                  <input type="submit" value="Reset My Password" class="btn btn-block">
                </div>
              </form>
              <div class="text-center">
                <p class="gray_text">For security reasons we don't store your password. Your password will be reset and a new one will be send.</p>
                <p><a href="#loginform" data-toggle="modal" data-dismiss="modal"><i class="fa fa-angle-double-left" aria-hidden="true"></i> Back to Login</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<!--/Forgot-password-Form --> 
<!-- Scripts --> 
<script type="text/javascript">
  var http_path = '<?php echo SITE_URL; ?>';
</script>
<script src="<?php echo SITE_URL; ?>js/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js"></script>
<script src="<?php echo SITE_URL; ?>js/bootstrap.min.js"></script> 
<script src="<?php echo SITE_URL; ?>js/interface.js"></script>
<script src="<?php echo SITE_URL; ?>functions.js"></script>  
<!--bootstrap-slider-JS--> 
<script src="<?php echo SITE_URL; ?>js/bootstrap-slider.min.js"></script> 
<!--Slider-JS--> 
<script src="<?php echo SITE_URL; ?>js/slick.min.js"></script> 
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.16.0/jquery.validate.js"></script> 

<script src="<?php echo SITE_URL; ?>js/owl.carousel.min.js"></script>

<script>
    $(function () {

        var loc = window.location.href;

        $("#header-nav li a").each(function () {

            if (this.href == loc) {

                $(this).parents('#header-nav li').addClass('active');

            }

        });

        $(function () {
          $('[data-toggle="popover"]').popover()
        })

        $('.popover-dismiss').popover({
          trigger: 'focus'
        })

    });
</script>

<script type="text/javascript">
    $(document).ready(function(){
        
        
        $("#newsletter").validate({
            rules: {
                newsletter_name: {required: true},
                newsletter_email: {
                    required: true,
                    email: true,
                }
                
            },
            messages: {
                newsletter_name: "<span class='text-danger'>Please enter your name.</span>",
                newsletter_email:{
                    required: "<span class='text-danger'>Please enter email address.</span>",
                    email: "<span class='text-danger'>Please enter a valid email address.</span>",
                }
            },
            submitHandler: function () {

              var url_data = $('#newsletter').serialize(); console.log(url_data);

              $('#newsletter_submit').attr('disabled','disabled');
              $("#newsletter_submit").html('Please Wait...');

              $.ajax({
                 type: 'POST',
                 url: '<?php echo SITE_URL?>system/controllers/frontend_controller.php',
                 data: "&action=newsletterSubscribe&"+url_data,
                 success: function(res) {
                    var obj = jQuery.parseJSON(res);
                    if($.trim(res)==200){
                      clearFormFieldsFront("#newsletter");
                      showFrontFormMessage('#newsletter_submit_msg','success',{message:'Subscribeed successfully!'});
                      
                    }else{
                      showFrontFormMessage('#form_submit_msg','error',{message:'Something wrong. Please try again.'});
                    }

                    $('#newsletter_submit').removeAttr('disabled');
                    $("#newsletter_submit").html('Subscribe <span class="angle_arrow"><i class="fa fa-angle-right" aria-hidden="true"></i></span>');                 
                 },
              });
        
            }

        }); 

        jQuery.validator.addMethod("startwithzero", function (value, element) {
              return this.optional(element) || /(^[0a-zA-Z].{9})$/.test(value);
        }, "Your mobile number should start with 0.");
         
    });

    
        

</script>


<!--Start of Tawk.to Script-->
<script type="text/javascript">
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/5a81bf45d7591465c7079938/default';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();
</script>
<!--End of Tawk.to Script-->

</body>

</html>
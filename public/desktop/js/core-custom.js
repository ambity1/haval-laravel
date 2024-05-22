jQuery(document).ready(function($){
	$(".modal-form").submit(function(e){
		var $form 	= $(this),
			$msg    = $(this).prev('div.message'),
			$action = $form.attr('action');
		$.post($action,$form.serialize()+'&verify=true',function(data){
			$form.fadeOut("fast", function(){
				 $('.message').hide().html(data);
                    $('.message').show('fast');
			});
		});
		$(this).css("display", "none");
		e.preventDefault();
	});
});
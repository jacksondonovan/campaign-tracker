$(document).ready(function(){
	$('.sort-by-columns').on('click', function() {
		$('#sort-by').val($(this).attr('data-value'))
		$('#order-by').val('desc')

		$('#submit-query-builder').click()
	})
})

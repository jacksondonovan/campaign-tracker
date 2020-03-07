$(document).ready(function(){
	let url = new URL(window.location.href)
	let product_param = url.searchParams.get('product')
	let source_param = url.searchParams.get('source')
	let sort_param = url.searchParams.get('sort')
	let order_by_param = url.searchParams.get('order_by')
	let date_from_param = url.searchParams.get('date_from')
	let date_to_param = url.searchParams.get('date_to')
	let click_threshold = url.searchParams.get('click_threshold')
	let product_clicks = url.searchParams.get('product_clicks')
	let source_clicks = url.searchParams.get('source_clicks')

	$('input[name=date_from]').datepicker({ dateFormat: 'mm-dd-yy' })
	$('input[name=date_to]').datepicker({ dateFormat: 'mm-dd-yy' })

	$('input[name=product_clicks]').val((product_clicks == 'true') ? true : '')
	$('input[name=source_clicks]').val((source_clicks == 'true') ? true : '')
	$('#product-clicks').attr('checked', (product_clicks == 'true') ? true : false)
	$('#source-clicks').attr('checked', (source_clicks == 'true') ? true : false)

	$('input#product-clicks').on('click', function(e) {
		if($('input[name=product_clicks]').val() == 'true') {
			$('input[name=product_clicks]').val('')
		}
		else {
			$('input[name=product_clicks]').val('true')
		}
	})
	$('input#source-clicks').on('click', function(e) {
		if($('input[name=source_clicks]').val() == 'true') {
			$('input[name=source_clicks]').val('')
		}
		else {
			$('input[name=source_clicks]').val('true')
		}
	})



	if(sort_param) {
		$('#' + sort_param + '_header_icon').text( order_by_param == 'asc' ? 'expand_less' : 'expand_more')
	}

	if(click_threshold || product_clicks || source_clicks) {
		$('#advanced-filter-section').css('display', 'inherit')
		$('#advanced-filters').text('Hide Advanced Filters')
	}
	else {
		$('#advanced-filter-section').css('display', 'none')
	}

	if(product_clicks || source_clicks) {
		let $row_one = $('#product-campaign-table').children().first()

		$('#product-campaign-table').empty()
		$('#product-campaign-table').append($row_one)

		$row_one.children().eq(0).text((product_param == 'all') ? 'All Products' : $row_one.attr('id'))
		$row_one.children().eq(1).text((source_param == 'all') ? 'All Sources' : $row_one.attr('data-value'))
		$row_one.children().eq(2).text($('#total-click-count').val())
		$row_one.children().eq(3).text((date_from_param && date_to_param) ? date_from_param + '  to  ' + date_to_param : 'All Dates')
	}

	$('#advanced-filters').on('click', function() {
		if( $(this).text() == 'Advanced Filters') {
			$(this).text('Hide Advanced Filters')
			$('#advanced-filter-section').css('display', 'inherit')
		}
		else {
			$(this).text('Advanced Filters')
			$('#advanced-filter-section').css('display', 'none')
		}
	})

	$('.sort-by-columns').on('click', function() {
		let prev_sort_by = $('#sort-by').val()
		let prev_order_by = $('#order-by').val()

		if( $(this).attr('data-value') == prev_sort_by && prev_order_by == 'asc' ) {
			$('#order-by').val('desc')
		}
		else {
			$('#order-by').val('asc')
		}

		$('#sort-by').val($(this).attr('data-value'))
		resetPagination('form.filter-campaigns', 'campaigns')
	})

	$('#submit-query-builder').on('click', function() {
		resetPagination('form.filter-campaigns', 'campaigns')
	})

	function resetPagination(form_id, base_path) {
		$(form_id).attr('action', '/' + base_path + '/1')
		$(form_id).submit()
	}
})

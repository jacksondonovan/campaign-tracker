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

	if(sort_param) {
		$('#' + sort_param + '-header-icon').text( order_by_param == 'asc' ? 'expand_less' : 'expand_more')
	}

	if(product_clicks || source_clicks) {
		let date_text = ''
		if(date_from_param && date_to_param) {
			date_text = date_from_param + ' to ' + date_to_param
		}
		if(date_from_param && !date_to_param) {
			date_text = 'Since ' + date_from_param
		}
		if(!date_from_param && date_to_param) {
			date_text = date_to_param + ' and before'
		}
		if(!date_from_param && !date_to_param) {
			date_text = 'All Dates'
		}
		$('#product-campaign-table').children().first().children().last().text(date_text)
	}

	$('input[name=date_from]').datepicker({ dateFormat: 'mm-dd-yy' })
	$('input[name=date_to]').datepicker({ dateFormat: 'mm-dd-yy' })

	$('input[name=product_clicks]').val((product_clicks == 'true') ? true : '')
	$('input[name=source_clicks]').val((source_clicks == 'true') ? true : '')

	$('#product-clicks').attr('checked', (product_clicks == 'true') ? true : false)
	$('#source-clicks').attr('checked', (source_clicks == 'true') ? true : false)

	$('#advanced-filter-section').css('display', (click_threshold || product_clicks || source_clicks) ? 'inherit' : 'none')

	$('input#product-clicks').on('click', function(e) {
		$('input[name=product_clicks]').val( ($('input[name=product_clicks]').val() == 'true') ? '' : 'true')
	})

	$('input#source-clicks').on('click', function(e) {
		$('input[name=source_clicks]').val( ($('input[name=source_clicks]').val() == 'true') ? '' : 'true')
	})

	$('#advanced-filters').on('click', function() {
		$('#advanced-filter-section').css('display', ($(this).text() == 'Advanced Filters') ? 'inherit' : 'none')
		$(this).text( ($(this).text() == 'Advanced Filters') ? 'Hide Advanced Filters' : 'Advanced Filters' )
	})

	$('.sort-by-columns').on('click', function() {
		$('#sort-by').val($(this).attr('data-value'))
		$('#order-by').val(($(this).attr('data-value') == sort_param && order_by_param == 'asc') ? 'desc' : 'asc')
		resetPagination('form.filter-campaigns', 'campaigns')
	})

	$('#submit-query-builder').on('click', function() {
		resetPagination('form.filter-campaigns', 'campaigns')
	})

	$('.add-campaign-data-form button').on('click', function(e) {
		e.preventDefault()

		if($('input[name=csv-file]').val()) {
			$('.add-campaign-data-form').submit()
		}
	})

	function resetPagination(form_id, base_path) {
		$(form_id).attr('action', '/' + base_path + '/1')
		$(form_id).submit()
	}
})

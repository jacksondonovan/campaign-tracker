$(document).ready(function(){
	let url = new URL(window.location.href)
	let path = url.pathname.split('/')
	let current_pagination = path[path.length - 1]

	for(let i = 1; i <= $('#last-page').val(); i++) {
		if(i == current_pagination) {
			$('.button-container').append('<span style="border: 2px solid #F4F4F4; padding:2px 5px; cursor: pointer; margin-right:4px; background-color:#F4F4F4;">' + i + '</span>')
		}
		else {
			$('.button-container').append('<span style="border: 2px solid #F4F4F4; padding:2px 5px; cursor: pointer; margin-right:4px;">' + i + '</span>')
		}

	}

	$('.button-container span').on('click', function() {
		let pagination = Number($('.button-container span').index(this)) + 1

		$('.filter-campaigns').attr('action', '/campaigns/' + pagination)
		$('form.filter-campaigns').submit()
	})
})

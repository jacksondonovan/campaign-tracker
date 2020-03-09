$(document).ready(function(){
	let url = new URL(window.location.href)
	let path = url.pathname.split('/')
	let current_pagination = (path.length <= 2) ? 1 : path[path.length - 1]

	for(let i = 1; i <= $('#last-page').val(); i++) {
		if(i == current_pagination) {
			$('.button-container').append('<span class="pagination-button-active">' + i + '</span>')
		}
		else {
			$('.button-container').append('<span class="pagination-button">' + i + '</span>')
		}
	}

	$('.button-container span').on('click', function() {
		let pagination = Number($('.button-container span').index(this)) + 1

		$('.filter-campaigns').attr('action', '/campaigns/' + pagination)
		$('form.filter-campaigns').submit()
	})
})

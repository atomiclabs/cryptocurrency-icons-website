$(document).ready(() => {
	// ------------------------------
	// Settings
	// ------------------------------
	const iconsBaseUrl = 'https://rawgit.com/atomiclabs/cryptocurrency-icons/master';
	const dataJson = 'https://rawgit.com/atomiclabs/cryptocurrency-icons/master/manifest.json';
	const formats = ['svg', '128', '32', '32@2x'];
	const variants = ['color', 'black', 'icon', 'white'];
	const iconDefault = 'black';
	const iconHover = 'color';

	// ------------------------------
	// Init search
	// ------------------------------
	$('form .search').on('input', event => {
		search($(event.currentTarget));
	});

	$('form').submit(event => {
		event.preventDefault();
		search($('form .search'));
	});

	// ------------------------------
	// Get icons
	// ------------------------------

	// Get icons in manifest
	$.getJSON(dataJson, data => {
		let icons = '';
		let count = 0;

		for (const icon of data) {
			// Get name
			const name = icon.name;
			const nameAttr = name.split(' ').join('-').toLowerCase();
			const symbol = icon.symbol.toLowerCase();

			// Avoid duplicates
			if (icons.indexOf('data-icon="' + symbol + '"') === -1) {
				// Construct icon
				icons += '<div class="col-6 col-lg-4 col-xl-3 text-left icon">';
				icons += '<a href="#' + symbol + '" class="bg-light d-block pt-4 pr-3 pb-4 pl-3" data-toggle="modal" data-target="#infoIcon" data-icon="' + symbol + '" data-name="' + nameAttr + '">';
				icons += '<div class="row align-items-center">';
				icons += '<div class="col container-img">';
				icons += `<img class="mr-2" src="${iconsBaseUrl}/svg/` + iconDefault + '/' + symbol + '.svg" alt="' + symbol + '" onerror="error(this);">';
				icons += '</div>';
				icons += '<div class="col name text-dark">';
				icons += name + '<span class="symbol text-muted text-uppercase small">' + symbol + '</span></div>';
				icons += '</div>';
				icons += '</div>';
				icons += '</a>';
				icons += '</div>';
				count++;
			}
		}

		// Display
		$('.row.icons').html(icons);

		// Hover
		$('.icon').hover(event => {
			changeFolder($(event.currentTarget), iconDefault, iconHover);
		});

		// Mouseleave
		$('.icon').mouseleave(event => {
			changeFolder($(event.currentTarget), iconHover, iconDefault);
		});

		// Count icons
		$('.count-cryptos').text(count);
	});

	// ------------------------------
	// Functions
	// ------------------------------

	// Search and Replace in Image src
	function changeFolder(target, search, replace) {
		target = $(target).find('img');
		const srcInit = $(target).attr('src');
		const srcAfter = srcInit.replace(search, replace);
		$(target).attr('src', srcAfter);
	}

	// Display icon info in Modal
	$('#infoIcon').on('show.bs.modal', event => {
		// Modal settings
		const button = $(event.relatedTarget);
		const modal = $(event.currentTarget);
		const icon = button.data('icon');

		// Table settings
		let infos = '';
		let i = 0;
		let j = 0;

		// Construct table
		infos += '<table class="table info-icon mb-0">';

		// Construct titles
		infos += '<thead>';
		infos += '<tr>';
		infos += '<th class="text-center text-uppercase align-middle"><h5 class="mb-0">' + icon + '</h5></th>';
		while (variants[j]) {
			var formatCss = formats[i].replace('@', '-');
			infos += '<th class="variant-' + variants[j] + ' text-center font-weight-light text-muted align-middle">' + variants[j] + '</th>';
			j++;
		}

		j = 0;
		infos += '</tr>';
		infos += '</thead>';
		infos += '<tbody>';

		// Construct Row
		while (formats[i]) {
			var formatCss = formats[i].replace('@', '-');
			infos += '<tr>';

			// Construct titles of row
			infos += '<th class="format-' + formatCss + ' text-center font-weight-light text-muted align-middle" scope="row">' + formats[i] + '</th>';

			// File extension
			if (formats[i] == 'svg') {
				var extension = '.svg';
			} else if (formats[i] == '32@2x') {
				var extension = '@2x.png';
			} else {
				var extension = '.png';
			}

			// Construct icons cells
			while (variants[j]) {
				infos += '<td class="format-' + formatCss + ' variant-' + variants[j] + ' text-center">';
				infos += `<img src="${iconsBaseUrl}/` + formats[i] + '/' + variants[j] + '/' + icon + extension + '" alt="' + icon + '">';
				infos += '</td>';
				j++;
			}

			j = 0;
			i++;
			infos += '</tr>';
		}

		// Close table
		infos += '</tbody>';
		infos += '</table>';

		// Display
		modal.find('.modal-title').text(icon);
		modal.find('.modal-body').html(infos);
	});

	// Search
	function search(target) {
		if ($(target).val().length > 0) {
			// Filter icons
			$('.icon').css('display', 'none');
			$(`a[data-icon*="${$(target).val().toLowerCase()}"]`).parent().css('display', 'block');
			$(`a[data-name*="${$(target).val().toLowerCase()}"]`).parent().css('display', 'block');

			// Close
			$('<div class="close-search"></div>').insertAfter(target);
			$('.close-search').click(() => {
				closeSearch(target);
			});
		} else {
			closeSearch(target);
		}
	}

	// Close search
	function closeSearch(target) {
		$('.close-search').remove();
		$('.icon').css('display', 'block');
		$(target).val('');
	}
});

// Hide icons on error
function error(img) {
	$(img).parentsUntil('.icon').parent().remove();
}

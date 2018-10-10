// ------------------------------
// Settings
// ------------------------------
let iconsBaseUrl = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons';
const githubUrl = 'https://api.github.com/repos/atomiclabs/cryptocurrency-icons/commits';
const formats = ['svg', '128', '32', '32@2x'];
const variants = ['color', 'black', 'icon', 'white'];
const iconDefault = 'black';
const iconHover = 'color';

const preloadImages = (...urls) => {
	for (const url of urls) {
		const image = new Image();
		image.src = url;
	}
};

// Get the URLs for all the icon variant for a symbol
const imageUrlsForSymbol = symbol => {
	const urls = [];

	for (const format of formats) {
		const filename = format === '32@2x' ? `${symbol}@2x` : symbol;
		const extension = format === 'svg' ? 'svg' : 'png';

		for (const variant of variants) {
			urls.push(`${iconsBaseUrl}/${format}/${variant}/${filename}.${extension}`);
		}
	}

	return urls;
};

// Search and replace in image src
const changeFolder = (target, search, replace) => {
	target = $(target).find('img');
	const srcInit = $(target).attr('src');
	const srcAfter = srcInit.replace(search, replace);
	$(target).attr('src', srcAfter);
};

const closeSearch = target => {
	$('.close-search').remove();
	$('.icon')
		.removeClass('d-none')
		.addClass('d-block');
	$(target).val('');
};

const search = target => {
	if ($(target).val().length > 0) {
		// Filter icons
		$('.icon')
			.removeClass('d-block')
			.addClass('d-none');
		const searchQuery = $(target).val().toLowerCase();
		$(`a[data-icon*="${searchQuery}"]`).parent()
			.removeClass('d-none')
			.addClass('d-block');
		$(`a[data-name*="${searchQuery}"]`).parent()
			.removeClass('d-none')
			.addClass('d-block');

		// Close
		$('<div class="close-search"></div>').insertAfter(target);
		$('.close-search').on('click', () => {
			closeSearch(target);
		});
	} else {
		closeSearch(target);
	}
};

// Hide icons on error
window.iconLoadError = image => {
	$(image).parentsUntil('.icon').parent().remove();
};

// Init search
$('form .search')
	.on('input', event => {
		search($(event.currentTarget));
	})
	.on('keyup', event => {
		if (event.key === 'Escape') {
			closeSearch($(event.currentTarget));
		}
	});

$('form').on('submit', event => {
	event.preventDefault();
});

// Get icons
(async () => {
	const commitsResponse = await fetch(githubUrl);
	const [commit] = await commitsResponse.json();

	iconsBaseUrl += '@' + commit.sha;

	const dataJson = iconsBaseUrl + '/manifest.json';
	const response = await fetch(dataJson);
	const icons = await response.json();

	$('.count-cryptos').text(icons.length);

	let html = '';
	for (const icon of icons) {
		const {name} = icon;
		const nameDataAttribute = name.split(' ').join('-').toLowerCase();
		const symbol = icon.symbol.toLowerCase();
		const imageUrl = `${iconsBaseUrl}/svg/${iconDefault}/${symbol}.svg`;

		// Construct icon
		html += `
			<div class="col-6 col-lg-4 col-xl-3 text-left icon">
				<a href="#${symbol}" class="bg-light d-block pt-4 pr-3 pb-4 pl-3" data-toggle="modal" data-target="#infoIcon" data-icon="${symbol}" data-name="${nameDataAttribute}">
					<div class="row align-items-center">
						<div class="col container-img">
							<img class="mr-2" src="${imageUrl}" alt="${symbol}" onerror="iconLoadError(this)">
						</div>
						<div class="col name text-dark">${name}<span class="symbol text-muted text-uppercase small">${symbol}</span></div>
					</div>
				</a>
			</div>
		`;

		preloadImages(`${iconsBaseUrl}/svg/${iconHover}/${symbol}.svg`);
	}

	$('.row.icons').html(html);

	$('.icon')
		.on('mouseover', event => {
			changeFolder($(event.currentTarget), iconDefault, iconHover);

			const symbol = $('a', event.currentTarget).data('icon');
			preloadImages(...imageUrlsForSymbol(symbol));
		})
		.on('mouseleave', event => {
			changeFolder($(event.currentTarget), iconHover, iconDefault);
		});
})();

// Display icon info in a modal
$('#infoIcon').on('show.bs.modal', event => {
	// Modal settings
	const button = $(event.relatedTarget);
	const modal = $(event.currentTarget);
	const icon = button.data('icon');

	let formatCss;
	let extension;

	// Table settings
	let infos = '';
	let i = 0;
	let j = 0;

	// Construct table
	infos += '<table class="table info-icon mb-0">';

	// Construct titles
	infos += '<thead>';
	infos += '<tr>';
	infos += `<th class="text-center text-uppercase align-middle"><h5 class="mb-0">${icon}</h5></th>`;
	while (variants[j]) {
		formatCss = formats[i].replace('@', '-');
		infos += `<th class="variant-${variants[j]} text-center font-weight-light text-muted align-middle">${variants[j]}</th>`;
		j++;
	}

	j = 0;
	infos += '</tr>';
	infos += '</thead>';
	infos += '<tbody>';

	// Construct Row
	while (formats[i]) {
		formatCss = formats[i].replace('@', '-');
		infos += '<tr>';

		// Construct titles of row
		infos += `<th class="format-${formatCss} text-center font-weight-light text-muted align-middle" scope="row">${formats[i]}</th>`;

		// File extension
		if (formats[i] === 'svg') {
			extension = '.svg';
		} else if (formats[i] === '32@2x') {
			extension = '@2x.png';
		} else {
			extension = '.png';
		}

		// Construct icons cells
		while (variants[j]) {
			infos += `<td class="format-${formatCss} variant-${variants[j]} text-center">`;
			infos += `<img src="${iconsBaseUrl}/${formats[i]}/${variants[j]}/${icon}${extension}" alt="${icon}">`;
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

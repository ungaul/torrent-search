$(document).ready(function () {
    let currentPage = 1;
    let currentQuery = '';
    let currentSortBy = 'seeders';
    let currentOrder = 'desc';
    let currentCategory = '';
    let resultsPerPage = 20;
    let totalResultsFetched = 0;
    let isCancelled = false;

    function updateUrl(query, page, sortBy, order, category) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('query', query);
        newUrl.searchParams.set('page', page);
        newUrl.searchParams.set('sortBy', sortBy);
        newUrl.searchParams.set('order', order);
        if (category) {
            newUrl.searchParams.set('category', category);
        } else {
            newUrl.searchParams.delete('category');
        }
        window.history.pushState({}, '', newUrl);
    }

    function startLoadingBar() {
        $('#loading-bar-container').show();
        $('#loading-bar').removeClass('loading-bar-animate');
        setTimeout(function () {
            $('#loading-bar').addClass('loading-bar-animate');
        }, 10);
    }

    function resetLoadingBar() {
        $('#loading-bar').removeClass('loading-bar-animate');
        $('#loading-bar').css('width', '0');
        $('#loading-bar-container').hide();
    }

    function handleSearch(query, page, sortBy = 'seeders', order = 'desc', category = '', append = false, callback = null) {
        if (query) {
            if (!append) {
                $('#results .result-row').remove();
                currentPage = 1;
                totalResultsFetched = 0;
                isCancelled = false;
                startLoadingBar(); // Start the loading bar when clearing the list
            }

            $('#load-more-button').hide();

            updateUrl(query, page, sortBy, order, category);

            $.getJSON('/search', { query: query, page: page, sortBy: sortBy, order: order, category: category }, function (data) {
                if (isCancelled) return;

                if (data.error) {
                    $('#results').html('<p>Error: ' + data.error + '</p>');
                } else {
                    $('#results-container').removeClass('home-toggled');
                    $('#app').removeClass('home-toggled');
                    $('#loading-results').remove();
                    generateResults(data.items);
                    resetLoadingBar();

                    totalResultsFetched += data.items.length;

                    if (totalResultsFetched < 100 && page < data.pageCount) {
                        handleSearch(query, page + 1, sortBy, order, category, true, callback);
                    } else if (page < data.pageCount) {
                        $('#load-more-button').show();
                    }
                }

                if (callback) {
                    callback();
                }
            }).fail(function (error) {
                if (!isCancelled) {
                    $('#results').html('<p>Error: ' + error.responseText + '</p>');
                    resetLoadingBar();
                }

                if (callback) {
                    callback();
                }
            });
        } else {
            $('#results').html('<p>Please enter a search query.</p>');
        }
    }

    function newSearch(query) {
        isCancelled = true;
        currentQuery = query;
        currentCategory = $('#category-select').val();
        currentPage = 1;
        totalResultsFetched = 0;
        handleSearch(currentQuery, currentPage, currentSortBy, currentOrder, currentCategory);
    }

    $('#search-button').on('click', function () {
        const query = $('#search-bar').val();
        newSearch(query);
    });

    $('#search-bar').on('keypress', function (e) {
        if (e.which === 13) {
            const query = $('#search-bar').val();
            newSearch(query);
        }
    });

    $('#load-more-button').on('click', function () {
        currentPage += 1;
        handleSearch(currentQuery, currentPage, currentSortBy, currentOrder, currentCategory, true);
    });

    function generateResults(torrents) {
        let resultsHtml = '';
        torrents.forEach(item => {
            const time = item.uploadDate || 'Unknown';
            const magnetLink = item.magnetLink || '#';
            const fileSize = item.size || 'Unknown';
            resultsHtml += `
                <div class="result-row">
                    <div class="result-cell name">
                        <a href="${magnetLink}" class="download-link">${item.name}</a>
                    </div>
                    <div class="result-cell seeders">${item.seeders}</div>
                    <div class="result-cell leechers">${item.leechers}</div>
                    <div class="result-cell time">${time}</div>
                    <div class="result-cell size">${fileSize}</div>
                    <div class="result-cell magnet-link">
                        <a href="${magnetLink}" target="_blank">Download</a>
                    </div>
                </div>
            `;
        });

        $('#results').append(resultsHtml);

        $('.result-row').each(function (index) {
            const row = $(this);
            setTimeout(function () {
                row.addClass('visible');
            }, index * 100);
        });
    }

    function toggleSorting(column) {
        const headerCell = $(`.header-cell.${column}`);

        if (currentSortBy === column) {
            currentOrder = currentOrder === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortBy = column;
            currentOrder = 'desc';
        }

        $('.header-cell').each(function () {
            $(this).find('ion-icon').attr('name', 'chevron-down-outline');
            $(this).removeClass('sortedBy');
        });

        headerCell.addClass('sortedBy');

        const icon = headerCell.find('ion-icon');
        if (currentOrder === 'asc') {
            icon.attr('name', 'chevron-up-outline');
        } else {
            icon.attr('name', 'chevron-down-outline');
        }

        newSearch(currentQuery);
    }

    $('.header-cell.seeders').on('click', function () {
        toggleSorting('seeders');
    });

    $('.header-cell.leechers').on('click', function () {
        toggleSorting('leechers');
    });

    $('.header-cell.time').on('click', function () {
        toggleSorting('time');
    });

    $('.header-cell.size').on('click', function () {
        toggleSorting('size');
    });

    const params = new URLSearchParams(window.location.search);
    const query = params.get('query');
    const sortBy = params.get('sortBy') || 'seeders';
    const order = params.get('order') || 'desc';
    const category = params.get('category') || '';

    if (query) {
        $('#search-bar').val(query);
        $('#category-select').val(category);
        currentQuery = query;
        currentSortBy = sortBy;
        currentOrder = order;
        currentCategory = category;
        currentPage = 1;

        const headerCell = $(`.header-cell.${currentSortBy}`);
        headerCell.addClass('sortedBy');
        const icon = headerCell.find('ion-icon');
        if (currentOrder === 'asc') {
            icon.attr('name', 'chevron-up-outline');
        } else {
            icon.attr('name', 'chevron-down-outline');
        }

        handleSearch(currentQuery, currentPage, currentSortBy, currentOrder, currentCategory);
    }
});

window.addEventListener('message', function (event) {
    if (event.data.type === 'updateParams') {
        const params = event.data.params;
        if (params) {
            const searchParams = new URLSearchParams(params);
            const query = searchParams.get('query');
            const sortBy = searchParams.get('sortBy');
            const order = searchParams.get('order');
            const category = searchParams.get('category');
            if (query) {
                window.history.pushState({}, '', `?${params}`);
                handleSearch(query, 1, sortBy, order, category);
            }
        }
    }
});
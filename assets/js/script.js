$(document).ready(function () {
    let currentPage = 1;
    let currentQuery = '';
    let currentSortBy = 'seeders';  // Default sort column is 'seeders'
    let currentOrder = 'desc';  // Default sort order is 'desc'
    let currentCategory = '';  // Default category (none)
    let resultsPerPage = 20;  // Default results per page

    // Function to handle updating the URL with current search parameters
    function updateUrl(query, page, sortBy, order, category, resultsPerPage) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('query', query);
        newUrl.searchParams.set('page', page);
        newUrl.searchParams.set('sortBy', sortBy);
        newUrl.searchParams.set('order', order);
        newUrl.searchParams.set('resultsPerPage', resultsPerPage);
        if (category) {
            newUrl.searchParams.set('category', category);
        } else {
            newUrl.searchParams.delete('category');  // Remove the category if it's empty
        }
        window.history.pushState({}, '', newUrl);  // Update the URL without refreshing the page
    }

    // Function to handle searching
    function handleSearch(query, page, sortBy = 'seeders', order = 'desc', category = '', append = false) {
        if (query) {
            if (!append) {
                $('#results .result-row').remove();  // Clear previous results only if append is false
            }
            $('#loading-indicator').show();  // Show loading indicator
            $('#load-more-button').hide();  // Hide Load More button while loading

            // Update URL with current search parameters
            updateUrl(query, page, sortBy, order, category, resultsPerPage);

            // Fetch results from the server
            $.getJSON('https://ungaul-torrent-search.netlify.app/search', { query: query, page: page, sortBy: sortBy, order: order, category: category, resultsPerPage: resultsPerPage }, function (data) {
                if (data.error) {
                    $('#results').html('<p>Error: ' + data.error + '</p>');
                } else {
                    generateResults(data.items);
                    $('#loading-indicator').hide();  // Hide loading indicator
                    if (page < data.pageCount) {
                        $('#load-more-button').show();  // Show Load More button if more pages are available
                    }
                }
            }).fail(function (error) {
                $('#results').html('<p>Error: ' + error.responseText + '</p>');
                $('#loading-indicator').hide();  // Hide loading indicator
            });
        } else {
            $('#results').html('<p>Please enter a search query.</p>');
        }
    }

    // Event listener for the search button
    $('#search-button').on('click', function () {
        currentQuery = $('#search-bar').val();
        currentCategory = $('#category-select').val();  // Get the selected category
        resultsPerPage = $('#results-per-page').val();  // Get selected number of results per page
        currentPage = 1;  // Reset to first page on new search
        handleSearch(currentQuery, currentPage, currentSortBy, currentOrder, currentCategory);  // Call search without appending
    });

    // Event listener for changing results per page
    $('#results-per-page').on('change', function () {
        resultsPerPage = $(this).val();  // Update the number of results per page
        currentPage = 1;  // Reset to first page
        handleSearch(currentQuery, currentPage, currentSortBy, currentOrder, currentCategory);  // Re-fetch results with updated resultsPerPage
    });

    // Function to handle loading more results
    $('#load-more-button').on('click', function () {
        currentPage += 1;  // Increment page number
        handleSearch(currentQuery, currentPage, currentSortBy, currentOrder, currentCategory, true);  // Load more results and append them
    });

    // Function to generate the results using the specified structure
    function generateResults(torrents) {
        let resultsHtml = '';
        torrents.forEach(item => {
            const time = item.uploadDate || 'Unknown';  // Default value for time if undefined
            const magnetLink = item.magnetLink || '#';  // Default value for magnet link if undefined
            const fileSize = item.size || 'Unknown';  // Default value for file size if undefined
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
        $('#results').append(resultsHtml);  // Append new results instead of replacing them
    }

    // Function to toggle sorting when clicking on a header
    function toggleSorting(column) {
        if (currentSortBy === column) {
            // If the column is already sorted, toggle the order
            currentOrder = currentOrder === 'asc' ? 'desc' : 'asc';
        } else {
            // If the column is different, set to default descending order
            currentSortBy = column;
            currentOrder = 'desc';  // Default to descending when switching columns
        }
        currentPage = 1;  // Reset to first page when sorting
        handleSearch(currentQuery, currentPage, currentSortBy, currentOrder, currentCategory);  // Perform search with new sorting
    }

    // Add event listeners for each sortable header
    $('.header-cell.seeders').on('click', function () {
        toggleSorting('seeders');
    });

    $('.header-cell.leechers').on('click', function () {
        toggleSorting('leechers');
    });

    $('.header-cell.time').on('click', function () {
        toggleSorting('time');  // Using 'time' for upload date sorting
    });

    $('.header-cell.size').on('click', function () {
        toggleSorting('size');
    });

    // Automatically search if a query and page parameters are present in the URL
    const params = new URLSearchParams(window.location.search);
    const query = params.get('query');
    const page = params.get('page') || 1;  // If no page is provided, default to 1
    const sortBy = params.get('sortBy') || 'seeders';
    const order = params.get('order') || 'desc';
    const category = params.get('category') || '';
    const resultsPerPageParam = params.get('resultsPerPage') || 20;

    if (query) {
        $('#search-bar').val(query);  // Set the query in the search bar
        currentQuery = query;
        currentPage = parseInt(page);  // Set the current page from the URL
        currentSortBy = sortBy;
        currentOrder = order;
        currentCategory = category;
        resultsPerPage = resultsPerPageParam;
        handleSearch(currentQuery, currentPage, currentSortBy, currentOrder, currentCategory);  // Trigger search with the page number
    }
});

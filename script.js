document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded. Initializing script...');

    const movieListDiv = document.getElementById('movie-list');
    const movieSearchInput = document.getElementById('movie-search');
    let allMovies = []; // To store the original list of movie objects {title, plot, posterUrl}

    // Modal elements
    const movieModal = document.getElementById('movie-modal');
    const modalMovieTitle = document.getElementById('modal-movie-title');
    const modalMoviePlot = document.getElementById('modal-movie-plot');
    const modalMoviePoster = document.getElementById('modal-movie-poster');
    const modalMoviePrice = document.getElementById('modal-movie-price');
    const closeButton = document.querySelector('.close-button');

    // Define the movie price
    const MOVIE_PRICE = '$5.00';

    // Define the path to your default unavailable poster
    const UNAVAILABLE_POSTER_PATH = 'movie_posters/unavailable.jpg';
    console.log(`Unavailable poster path: ${UNAVAILABLE_POSTER_PATH}`);

    // Helper function to create a clean filename from a movie title
    const getPosterFilename = (title) => {
        let cleanedTitle = title.replace(/['":!?]/g, '');
        cleanedTitle = cleanedTitle.replace(/\s+|-+/g, '_');
        cleanedTitle = cleanedTitle.replace(/^_|_$/g, '');
        const filePath = `movie_posters/${cleanedTitle.toLowerCase()}.jpg`; // Ensure filename is lowercase
        console.log(`Generated filename for "${title}": ${filePath}`);
        return filePath;
    };

    // Function to render movies
    const renderMovies = (moviesToDisplay) => {
        console.log(`Rendering ${moviesToDisplay.length} movies...`);
        movieListDiv.innerHTML = ''; // Clear existing movies

        if (moviesToDisplay.length === 0) {
            const noMoviesFound = document.createElement('p');
            noMoviesFound.classList.add('no-movies-found');
            noMoviesFound.textContent = 'No movies found matching your search.';
            movieListDiv.appendChild(noMoviesFound);
            return;
        }

        moviesToDisplay.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');

            // NEW: Create a container for text elements (title and price)
            const movieTextContainer = document.createElement('div');
            movieTextContainer.classList.add('movie-card-text');

            const movieTitleElem = document.createElement('p');
            movieTitleElem.textContent = movie.title.trim();
            movieTextContainer.appendChild(movieTitleElem); // Append title first

            const moviePriceElem = document.createElement('p');
            moviePriceElem.classList.add('movie-price');
            moviePriceElem.textContent = MOVIE_PRICE;
            movieTextContainer.appendChild(moviePriceElem); // Append price second, so it goes under the title

            movieCard.appendChild(movieTextContainer); // Append the text container first to the card

            const thumbnailImg = document.createElement('img');
            thumbnailImg.src = movie.posterUrl;
            thumbnailImg.alt = `${movie.title} Poster`;

            thumbnailImg.onerror = () => {
                console.warn(`Failed to load poster for "${movie.title}" (${movie.posterUrl}). Using unavailable.jpg.`);
                thumbnailImg.src = UNAVAILABLE_POSTER_PATH;
                thumbnailImg.alt = 'Poster not available';
                thumbnailImg.onerror = null; // Prevent infinite loop if unavailable.jpg also fails
            };
            movieCard.appendChild(thumbnailImg); // Append the image second (will be on the right)

            // Store data attributes on the card for modal population
            movieCard.dataset.title = movie.title.trim();
            movieCard.dataset.plot = movie.plot.trim();
            movieCard.dataset.poster = movie.posterUrl;

            movieListDiv.appendChild(movieCard);
        });
        console.log('Finished rendering movies.');
    };

    // Fetch movies from Movies.txt
    fetch('Movies.txt')
        .then(response => {
            console.log('Fetched Movies.txt response:', response);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} - Could not load Movies.txt`);
            }
            return response.text();
        })
        .then(text => {
            console.log('Movies.txt content (first 200 chars):', text.substring(0, 200) + '...');
            allMovies = text.split('\n')
                            .filter(line => line.trim() !== '') // Remove empty lines
                            .map(line => {
                                const parts = line.split('\t'); // Split by tab
                                if (parts.length >= 2) {
                                    const title = parts[0].trim();
                                    const plot = parts.slice(1).join('\t').trim(); // Join remaining parts as plot
                                    const posterUrl = getPosterFilename(title);

                                    return {
                                        title: title,
                                        plot: plot,
                                        posterUrl: posterUrl
                                    };
                                } else {
                                    console.warn(`Skipping malformed line in Movies.txt: "${line}"`);
                                    return null; // Return null for malformed lines
                                }
                            })
                            .filter(movie => movie !== null); // Remove null entries

            console.log('Parsed movie data:', allMovies);

            if (allMovies.length === 0) {
                movieListDiv.innerHTML = '<p class="no-movies-found">No movies found. Please add titles and plots to Movies.txt and ensure correct formatting (Title\\tPlot).</p>';
                return;
            }

            renderMovies(allMovies); // Display all movies initially
        })
        .catch(error => {
            console.error('CRITICAL ERROR: Failed to fetch or parse movie list:', error);
            movieListDiv.innerHTML = `<p class="error-message">Error loading movies: ${error.message}<br>Please ensure 'Movies.txt' is correctly formatted and your server is running.</p>`;
        });

    // Add event listener for the search input
    movieSearchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        console.log(`Search term: "${searchTerm}"`);
        const filteredMovies = allMovies.filter(movie =>
            movie.title.toLowerCase().includes(searchTerm)
        );
        renderMovies(filteredMovies); // Re-render movies based on search
    });

    // Event delegation for clicking movie cards (to open modal)
    movieListDiv.addEventListener('click', (event) => {
        const clickedCard = event.target.closest('.movie-card');
        if (clickedCard) {
            const title = clickedCard.dataset.title;
            const plot = clickedCard.dataset.plot;
            let posterUrl = clickedCard.dataset.poster; // Use let as we might change it if loading fails

            console.log(`Card clicked: ${title}. Plot: ${plot ? 'Yes' : 'No'}. Poster: ${posterUrl}`);

            if (title && plot && posterUrl) {
                modalMovieTitle.textContent = title;
                modalMoviePlot.textContent = plot;
                modalMoviePoster.src = posterUrl;
                modalMoviePoster.alt = `${title} Poster`;

                // Show price in modal
                modalMoviePrice.textContent = `Price: ${MOVIE_PRICE}`;

                // Handle modal poster load errors
                modalMoviePoster.onerror = () => {
                    console.warn(`Failed to load modal poster for "${title}" (${posterUrl}). Using unavailable.jpg.`);
                    modalMoviePoster.src = UNAVAILABLE_POSTER_PATH;
                    modalMoviePoster.alt = 'Poster not available';
                    modalMoviePoster.onerror = null; // Prevent infinite loop if unavailable.jpg also fails
                };

                movieModal.style.display = 'block'; // Show the modal
            } else {
                console.error("Missing data attributes on clicked card:", clickedCard.dataset);
            }
        }
    });

    // Close the modal when the close button is clicked
    closeButton.addEventListener('click', () => {
        console.log('Closing modal...');
        movieModal.style.display = 'none';
        modalMoviePoster.src = ''; // Clear image src to reset for next open
    });

    // Close the modal when clicking outside of the modal content
    window.addEventListener('click', (event) => {
        if (event.target === movieModal) {
            console.log('Clicked outside modal. Closing...');
            movieModal.style.display = 'none';
            modalMoviePoster.src = ''; // Clear image src
        }
    });

    // Close the modal when the Escape key is pressed
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && movieModal.style.display === 'block') {
            console.log('Escape key pressed. Closing modal...');
            movieModal.style.display = 'none';
            modalMoviePoster.src = ''; // Clear image src
        }
    });
});
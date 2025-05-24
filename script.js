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
    // NEW: Modal Price Element
    const modalMoviePrice = document.getElementById('modal-movie-price');
    // END NEW
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
        const filePath = `movie_posters/${cleanedTitle}.jpg`;
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

            // NEW: Movie Title and Price
            const movieTitleElem = document.createElement('p');
            movieTitleElem.textContent = movie.title.trim();
            movieCard.appendChild(movieTitleElem);

            const moviePriceElem = document.createElement('p');
            moviePriceElem.classList.add('movie-price');
            moviePriceElem.textContent = MOVIE_PRICE;
            movieCard.appendChild(moviePriceElem);
            // END NEW

            const thumbnailImg = document.createElement('img');
            thumbnailImg.src = movie.posterUrl;
            thumbnailImg.alt = `${movie.title} Poster`;

            thumbnailImg.onerror = () => {
                console.warn(`Failed to load poster for "${movie.title}" (${movie.posterUrl}). Using unavailable.jpg.`);
                thumbnailImg.src = UNAVAILABLE_POSTER_PATH;
                thumbnailImg.alt = 'Poster not available';
                thumbnailImg.onerror = null;
            };
            movieCard.appendChild(thumbnailImg);

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
            console.log('Movies.txt content:', text.substring(0, 200) + '...');
            allMovies = text.split('\n')
                            .filter(line => line.trim() !== '')
                            .map(line => {
                                const parts = line.split('\t');
                                if (parts.length >= 2) {
                                    const title = parts[0].trim();
                                    const plot = parts.slice(1).join('\t').trim();
                                    const posterUrl = getPosterFilename(title);

                                    return {
                                        title: title,
                                        plot: plot,
                                        posterUrl: posterUrl
                                    };
                                } else {
                                    console.warn(`Skipping malformed line in Movies.txt: "${line}"`);
                                    return null;
                                }
                            })
                            .filter(movie => movie !== null);

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

    // Event delegation for clicking movie cards
    movieListDiv.addEventListener('click', (event) => {
        const clickedCard = event.target.closest('.movie-card');
        if (clickedCard) {
            const title = clickedCard.dataset.title;
            const plot = clickedCard.dataset.plot;
            const posterUrl = clickedCard.dataset.poster;

            console.log(`Card clicked: ${title}. Plot: ${plot ? 'Yes' : 'No'}. Poster: ${posterUrl}`);

            if (title && plot && posterUrl) {
                modalMovieTitle.textContent = title;
                modalMoviePlot.textContent = plot;
                modalMoviePoster.src = posterUrl;
                modalMoviePoster.alt = `${title} Poster`;

                // NEW: Show price in modal
                modalMoviePrice.textContent = `Price: ${MOVIE_PRICE}`;
                // END NEW

                modalMoviePoster.onerror = () => {
                    console.warn(`Failed to load modal poster for "${title}" (${posterUrl}). Using unavailable.jpg.`);
                    modalMoviePoster.src = UNAVAILABLE_POSTER_PATH;
                    modalMoviePoster.alt = 'Poster not available';
                    modalMoviePoster.onerror = null;
                };

                movieModal.style.display = 'block';
            } else {
                console.error("Missing data attributes on clicked card:", clickedCard.dataset);
            }
        }
    });

    // Close the modal when the close button is clicked
    closeButton.addEventListener('click', () => {
        console.log('Closing modal...');
        movieModal.style.display = 'none';
        modalMoviePoster.src = '';
    });

    // Close the modal when clicking outside of the modal content
    window.addEventListener('click', (event) => {
        if (event.target === movieModal) {
            console.log('Clicked outside modal. Closing...');
            movieModal.style.display = 'none';
            modalMoviePoster.src = '';
        }
    });
});
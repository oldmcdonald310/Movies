document.addEventListener('DOMContentLoaded', () => {
    const movieListDiv = document.getElementById('movie-list');
    const movieSearchInput = document.getElementById('movie-search');
    let allMovies = []; // To store the original list of movie objects {title, plot}

    // Modal elements
    const movieModal = document.getElementById('movie-modal');
    const modalMovieTitle = document.getElementById('modal-movie-title');
    const modalMoviePlot = document.getElementById('modal-movie-plot');
    const closeButton = document.querySelector('.close-button');

    // Function to render movies
    const renderMovies = (moviesToDisplay) => {
        movieListDiv.innerHTML = ''; // Clear existing movies

        if (moviesToDisplay.length === 0) {
            const noMoviesFound = document.createElement('p');
            noMoviesFound.classList.add('no-movies-found');
            noMoviesFound.textContent = 'No movies found matching your search.';
            movieListDiv.appendChild(noMoviesFound);
            return;
        }

        moviesToDisplay.forEach(movie => { // 'movie' is now an object {title, plot}
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            
            const movieTitleElem = document.createElement('p');
            movieTitleElem.textContent = movie.title.trim();
            movieCard.appendChild(movieTitleElem);

            // Store plot data directly on the card for easy access (optional, but convenient)
            movieCard.dataset.plot = movie.plot.trim();
            movieCard.dataset.title = movie.title.trim();

            movieListDiv.appendChild(movieCard);
        });
    };

    // Fetch movies from Movies.txt
    fetch('Movies.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(text => {
            // Parse each line: title \t plot
            allMovies = text.split('\n').filter(line => line.trim() !== '').map(line => {
                const parts = line.split('\t'); // Split by tab
                if (parts.length >= 2) {
                    return {
                        title: parts[0].trim(),
                        plot: parts.slice(1).join('\t').trim() // Re-join if plot contains tabs
                    };
                }
                return null; // Handle malformed lines
            }).filter(movie => movie !== null); // Remove any null entries

            if (allMovies.length === 0) {
                movieListDiv.innerHTML = '<p class="no-movies-found">No movies found. Please add titles and plots to Movies.txt</p>';
                return;
            }

            renderMovies(allMovies); // Display all movies initially
        })
        .catch(error => {
            console.error('Error fetching or parsing movie list:', error);
            movieListDiv.innerHTML = '<p class="error-message">Failed to load movies. Please check Movies.txt and your server setup.</p>';
        });

    // Add event listener for the search input
    movieSearchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const filteredMovies = allMovies.filter(movie =>
            movie.title.toLowerCase().includes(searchTerm)
        );
        renderMovies(filteredMovies); // Re-render movies based on search
    });

    // Event delegation for clicking movie cards
    movieListDiv.addEventListener('click', (event) => {
        const clickedCard = event.target.closest('.movie-card'); // Find the closest parent with .movie-card
        if (clickedCard) {
            const title = clickedCard.dataset.title;
            const plot = clickedCard.dataset.plot;

            if (title && plot) {
                modalMovieTitle.textContent = title;
                modalMoviePlot.textContent = plot;
                movieModal.style.display = 'block'; // Show the modal
            }
        }
    });

    // Close the modal when the close button is clicked
    closeButton.addEventListener('click', () => {
        movieModal.style.display = 'none';
    });

    // Close the modal when clicking outside of the modal content
    window.addEventListener('click', (event) => {
        if (event.target === movieModal) {
            movieModal.style.display = 'none';
        }
    });
});

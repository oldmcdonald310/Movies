document.addEventListener('DOMContentLoaded', () => {
    const movieListDiv = document.getElementById('movie-list');
    const movieSearchInput = document.getElementById('movie-search');
    let allMovies = []; // To store the original list of movie objects {title, plot, posterUrl}

    // Modal elements
    const movieModal = document.getElementById('movie-modal');
    const modalMovieTitle = document.getElementById('modal-movie-title');
    const modalMoviePlot = document.getElementById('modal-movie-plot');
    const modalMoviePoster = document.getElementById('modal-movie-poster');
    const closeButton = document.querySelector('.close-button');

    // Define the path to your default unavailable poster
    const UNAVAILABLE_POSTER_PATH = 'movie_posters/unavailable.jpg';

    // Helper function to create a clean filename from a movie title
    const getPosterFilename = (title) => {
        const cleanedTitle = title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
        return `movie_posters/${cleanedTitle}.jpg`;
    };

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

        moviesToDisplay.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');

            const movieTitleElem = document.createElement('p');
            movieTitleElem.textContent = movie.title.trim();
            movieCard.appendChild(movieTitleElem);

            // Add thumbnail image to the card
            const thumbnailImg = document.createElement('img');
            thumbnailImg.src = movie.posterUrl;
            thumbnailImg.alt = `${movie.title} Poster`;
            // If the specific poster is not found, use the unavailable one
            thumbnailImg.onerror = () => {
                thumbnailImg.src = UNAVAILABLE_POSTER_PATH;
                thumbnailImg.alt = 'Poster not available';
            };
            movieCard.appendChild(thumbnailImg);

            // Store all relevant data on the card for easy access when clicked
            movieCard.dataset.title = movie.title.trim();
            movieCard.dataset.plot = movie.plot.trim();
            movieCard.dataset.poster = movie.posterUrl;

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
            allMovies = text.split('\n')
                            .filter(line => line.trim() !== '')
                            .map(line => {
                                const parts = line.split('\t'); // Split by tab
                                if (parts.length >= 2) {
                                    const title = parts[0].trim();
                                    return {
                                        title: title,
                                        plot: parts.slice(1).join('\t').trim(),
                                        posterUrl: getPosterFilename(title) // Generate poster URL
                                    };
                                }
                                return null; // Handle malformed lines
                            })
                            .filter(movie => movie !== null); // Remove any null entries

            if (allMovies.length === 0) {
                movieListDiv.innerHTML = '<p class="no-movies-found">No movies found. Please add titles and plots to Movies.txt</p>';
                return;
            }

            renderMovies(allMovies); // Display all movies initially
        })
        .catch(error => {
            console.error('Error fetching or parsing movie list:', error);
            movieListDiv.innerHTML = '<p class="error-message">Failed to load movies. Please check Movies.txt, poster folder, and your server setup.</p>';
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
            const posterUrl = clickedCard.dataset.poster;

            if (title && plot && posterUrl) {
                modalMovieTitle.textContent = title;
                modalMoviePlot.textContent = plot;
                modalMoviePoster.src = posterUrl;
                modalMoviePoster.alt = `${title} Poster`;

                // If the specific poster for the modal is not found, use the unavailable one
                modalMoviePoster.onerror = () => {
                    modalMoviePoster.src = UNAVAILABLE_POSTER_PATH;
                    modalMoviePoster.alt = 'Poster not available';
                };

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

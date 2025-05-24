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
    const closeButton = document.querySelector('.close-button');

    // Define the path to your default unavailable poster
    const UNAVAILABLE_POSTER_PATH = 'movie_posters/unavailable.jpg';
    console.log(`Unavailable poster path: ${UNAVAILABLE_POSTER_PATH}`);

    // Helper function to create a clean filename from a movie title
    // This function needs to EXACTLY match how your files are named.
    const getPosterFilename = (title) => {
        // Step 1: Remove special characters that are definitely not in filenames (e.g., colons, quotes)
        // Keep spaces and hyphens if your filenames use them for separation.
        let cleanedTitle = title.replace(/['":!?]/g, '');

        // Step 2: Replace any sequence of whitespace or multiple hyphens with a single underscore
        // This is a common way to sanitize for filenames.
        cleanedTitle = cleanedTitle.replace(/\s+|-+/g, '_');

        // Ensure no leading/trailing underscores if not desired (e.g., from trimmed spaces)
        cleanedTitle = cleanedTitle.replace(/^_|_$/g, '');

        // Handle specific edge cases if you know them.
        // For example, if "Star Wars: Episode IV - A New Hope" becomes "Star_Wars_Episode_IV_A_New_Hope.jpg" (no hyphen)
        // you might need: cleanedTitle = cleanedTitle.replace('_-', '_');
        // Or, if your files use hyphens for "Star-Wars" instead of "Star_Wars", adjust accordingly.

        const filePath = `movie_posters/${cleanedTitle}.jpg`;
        console.log(`Generated filename for "${title}": ${filePath}`); // Debugging line
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

            const movieTitleElem = document.createElement('p');
            movieTitleElem.textContent = movie.title.trim();
            movieCard.appendChild(movieTitleElem);

            // Add thumbnail image to the card
            const thumbnailImg = document.createElement('img');
            thumbnailImg.src = movie.posterUrl;
            thumbnailImg.alt = `${movie.title} Poster`;

            // IMPORTANT: Assign onError *before* setting src if possible, though after is usually fine.
            // This onError handler should trigger if the specific movie poster fails.
            thumbnailImg.onerror = () => {
                console.warn(`Failed to load poster for "${movie.title}" (${movie.posterUrl}). Using unavailable.jpg.`);
                thumbnailImg.src = UNAVAILABLE_POSTER_PATH;
                thumbnailImg.alt = 'Poster not available';

                // Prevent infinite loop if UNAVAILABLE_POSTER_PATH also fails
                // By removing the onerror after it uses the fallback.
                thumbnailImg.onerror = null;
            };
            movieCard.appendChild(thumbnailImg);

            // Store all relevant data on the card for easy access when clicked
            movieCard.dataset.title = movie.title.trim();
            movieCard.dataset.plot = movie.plot.trim();
            movieCard.dataset.poster = movie.posterUrl; // Original intended poster URL

            movieListDiv.appendChild(movieCard);
        });
        console.log('Finished rendering movies.');
    };

    // Fetch movies from Movies.txt
    fetch('Movies.txt')
        .then(response => {
            console.log('Fetched Movies.txt response:', response);
            if (!response.ok) {
                // If the response is not OK (e.g., 404, 500), throw an error
                throw new Error(`HTTP error! Status: ${response.status} - Could not load Movies.txt`);
            }
            return response.text();
        })
        .then(text => {
            console.log('Movies.txt content:', text.substring(0, 200) + '...'); // Log first 200 chars
            allMovies = text.split('\n')
                            .filter(line => line.trim() !== '') // Remove empty lines
                            .map(line => {
                                const parts = line.split('\t'); // Split by tab
                                if (parts.length >= 2) {
                                    const title = parts[0].trim();
                                    const plot = parts.slice(1).join('\t').trim();
                                    const posterUrl = getPosterFilename(title); // Generate poster URL

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
                            .filter(movie => movie !== null); // Remove any null entries from the map

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
        const clickedCard = event.target.closest('.movie-card'); // Find the closest parent with .movie-card
        if (clickedCard) {
            const title = clickedCard.dataset.title;
            const plot = clickedCard.dataset.plot;
            const posterUrl = clickedCard.dataset.poster; // This is the original intended poster URL

            console.log(`Card clicked: ${title}. Plot: ${plot ? 'Yes' : 'No'}. Poster: ${posterUrl}`);

            if (title && plot && posterUrl) {
                modalMovieTitle.textContent = title;
                modalMoviePlot.textContent = plot;

                // Set the src for the modal poster
                modalMoviePoster.src = posterUrl;
                modalMoviePoster.alt = `${title} Poster`;

                // This onError handler should trigger if the specific movie poster for the MODAL fails.
                modalMoviePoster.onerror = () => {
                    console.warn(`Failed to load modal poster for "${title}" (${posterUrl}). Using unavailable.jpg.`);
                    modalMoviePoster.src = UNAVAILABLE_POSTER_PATH;
                    modalMoviePoster.alt = 'Poster not available';

                    // Prevent infinite loop if UNAVAILABLE_POSTER_PATH also fails
                    modalMoviePoster.onerror = null; // Remove the onerror after using the fallback
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
        // Reset modal poster src to prevent old image from flashing
        modalMoviePoster.src = '';
    });

    // Close the modal when clicking outside of the modal content
    window.addEventListener('click', (event) => {
        if (event.target === movieModal) {
            console.log('Clicked outside modal. Closing...');
            movieModal.style.display = 'none';
            modalMoviePoster.src = ''; // Reset modal poster src
        }
    });
});

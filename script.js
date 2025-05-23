document.addEventListener('DOMContentLoaded', () => {
    const movieListDiv = document.getElementById('movie-list');
    const movieSearchInput = document.getElementById('movie-search');
    let allMovies = []; // To store the original list of movies

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

        moviesToDisplay.forEach(title => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            const movieTitle = document.createElement('p');
            movieTitle.textContent = title.trim();
            movieCard.appendChild(movieTitle);
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
            allMovies = text.split('\n').filter(line => line.trim() !== ''); // Store all movies

            if (allMovies.length === 0) {
                movieListDiv.innerHTML = '<p class="no-movies-found">No movies found. Please add titles to Movies.txt</p>';
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
            movie.toLowerCase().includes(searchTerm)
        );
        renderMovies(filteredMovies); // Re-render movies based on search
    });
});

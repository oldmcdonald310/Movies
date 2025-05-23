document.addEventListener('DOMContentLoaded', () => {
    fetch('Movies.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(text => {
            const movieTitles = text.split('\n').filter(line => line.trim() !== '');
            const movieListDiv = document.getElementById('movie-list');

            if (movieTitles.length === 0) {
                movieListDiv.innerHTML = '<p class="no-movies">No movies found. Please add titles to Movies.txt</p>';
                return;
            }

            movieTitles.forEach(title => {
                const movieCard = document.createElement('div');
                movieCard.classList.add('movie-card');
                const movieTitle = document.createElement('p');
                movieTitle.textContent = title.trim();
                movieCard.appendChild(movieTitle);
                movieListDiv.appendChild(movieCard);
            });
        })
        .catch(error => {
            console.error('Error fetching or parsing movie list:', error);
            const movieListDiv = document.getElementById('movie-list');
            movieListDiv.innerHTML = '<p class="error-message">Failed to load movies. Please check Movies.txt and your server setup.</p>';
        });
});
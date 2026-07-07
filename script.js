const TMDB_API_KEY = 'f421e087b2a1e1d906830ecd2b2aa527';

let movies = JSON.parse(localStorage.getItem('lemonTrackerMovies')) || [];

const form = document.getElementById('movie-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const movieList = document.getElementById('movie-list');
const watchlistSection = document.getElementById('watchlist-section');
const watchlistContainer = document.getElementById('watchlist-container');
const notificationBox = document.getElementById('notification-box');

const idInput = document.getElementById('movie-id');
const titleInput = document.getElementById('title');
const descInput = document.getElementById('description');
const genreInput = document.getElementById('genre');
const ratingInput = document.getElementById('rating');
const ratingGroup = document.getElementById('rating-group'); // Nowy element do ukrywania
const watchedInput = document.getElementById('watched');
const isWatchlistInput = document.getElementById('is-watchlist');

const reviewModal = document.getElementById('review-modal');
const closeReviewBtn = document.getElementById('close-modal');
const saveReviewBtn = document.getElementById('save-review-btn');
const modalMovieId = document.getElementById('modal-movie-id');
const modalReviewText = document.getElementById('modal-review');
const modalPoster = document.getElementById('modal-poster');
const modalTitle = document.getElementById('modal-title');
const modalGenre = document.getElementById('modal-genre');

const infoModal = document.getElementById('info-modal');
const closeInfoBtn = document.getElementById('close-info-modal');
const infoModalMovieId = document.getElementById('info-modal-movie-id');
const infoModalPoster = document.getElementById('info-modal-poster');
const infoModalTitle = document.getElementById('info-modal-title');
const infoModalGenre = document.getElementById('info-modal-genre');
const infoModalDesc = document.getElementById('info-modal-desc');
const infoModalRating = document.getElementById('info-modal-rating');
const moveToMainBtn = document.getElementById('move-to-main-btn');
const deleteWatchlistBtn = document.getElementById('delete-watchlist-btn');

function saveToLocalStorage() {
    localStorage.setItem('lemonTrackerMovies', JSON.stringify(movies));
}

function showNotification(message, type = 'success') {
    notificationBox.textContent = message;
    notificationBox.className = `notification ${type}`;
    setTimeout(() => { notificationBox.classList.add('hidden'); }, 3000);
}

function toggleFormFields() {
    if (isWatchlistInput.checked) {
        ratingGroup.classList.add('hidden');
        ratingInput.required = false;
        ratingInput.value = '';
    } else {
        ratingGroup.classList.remove('hidden');
        ratingInput.required = true;
    }
}

watchedInput.addEventListener('change', (e) => {
    if (e.target.checked) {
        isWatchlistInput.checked = false;
    }
    toggleFormFields();
});

isWatchlistInput.addEventListener('change', (e) => {
    if (e.target.checked) {
        watchedInput.checked = false;
    }
    toggleFormFields();
});

async function fetchMoviePoster(title) {
    if (TMDB_API_KEY === 'WSTAW_TUTAJ_SWOJ_KLUCZ_API') return null;
    try {
        const query = encodeURIComponent(title);
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}&language=pl-PL`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.results && data.results.length > 0 && data.results[0].poster_path) {
            return `https://image.tmdb.org/t/p/w500${data.results[0].poster_path}`;
        }
    } catch (error) { console.error(error); }
    return null;
}

function renderMovies() {
    movieList.innerHTML = '';
    watchlistContainer.innerHTML = '';

    const mainMovies = movies.filter(m => !m.isWatchlist);
    const watchlistMovies = movies.filter(m => m.isWatchlist);

    if (watchlistMovies.length === 0) {
        watchlistSection.classList.add('hidden');
    } else {
        watchlistSection.classList.remove('hidden');
        watchlistMovies.forEach(movie => {
            const item = document.createElement('div');
            item.className = 'watchlist-item';
            item.onclick = () => openInfoModal(movie.id);

            const posterHtml = movie.posterUrl
                ? `<img src="${movie.posterUrl}" alt="${movie.title}">`
                : `<div class="fallback-poster">Brak okładki</div>`;

            item.innerHTML = posterHtml;
            watchlistContainer.appendChild(item);
        });
    }

    if (mainMovies.length === 0) {
        movieList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Lista jest pusta.</p>';
    } else {
        mainMovies.forEach(movie => {
            const displayRating = movie.rating || 0;
            const isSweet = displayRating >= 60;
            const icon = isSweet ? '🍋' : '🍋‍🟩';
            const ratingClass = isSweet ? 'sweet' : 'sour';

            const posterHtml = movie.posterUrl
                ? `<img src="${movie.posterUrl}" alt="${movie.title}" class="movie-poster" onclick="openReviewModal('${movie.id}')" style="cursor: pointer;">`
                : `<div class="movie-poster fallback-poster" onclick="openReviewModal('${movie.id}')" style="cursor: pointer;">Brak okładki</div>`;

            const card = document.createElement('div');
            card.className = `movie-card ${movie.watched ? 'watched' : ''}`;

            card.innerHTML = `
                ${posterHtml}
                <div class="lemonmeter ${ratingClass}">
                    ${icon} ${displayRating}%
                </div>
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-genre">${movie.genre}</div>
                <p class="movie-desc">${movie.description || 'Brak krótkiego opisu.'}</p>
                <div class="card-actions">
                    <button class="btn-secondary" onclick="openReviewModal('${movie.id}')" style="border-color: var(--primary); color: var(--primary);">📝 Opinia</button>
                    <button class="btn-secondary" onclick="editMovie('${movie.id}')">Edytuj</button>
                    <button class="btn-delete" onclick="deleteMovie('${movie.id}')">Usuń</button>
                </div>
            `;
            movieList.appendChild(card);
        });
    }
}

form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const id = idInput.value;
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const genre = genreInput.value;
    const isWatchlist = isWatchlistInput.checked;
    const watched = watchedInput.checked;
    const rating = isWatchlist ? 0 : parseInt(ratingInput.value);

    if (!title || !genre || (!isWatchlist && (isNaN(rating) || rating < 1 || rating > 100))) {
        showNotification('Uzupełnij poprawnie wszystkie wymagane pola.', 'error');
        return;
    }

    submitBtn.textContent = "Przetwarzanie...";
    submitBtn.disabled = true;

    if (id) {
        const index = movies.findIndex(m => m.id === id);
        if (index !== -1) {
            let updatedPosterUrl = movies[index].posterUrl;
            if (movies[index].title !== title) {
                updatedPosterUrl = await fetchMoviePoster(title);
            }
            const existingReview = movies[index].review || '';
            movies[index] = { id, title, description, genre, rating, watched, isWatchlist, posterUrl: updatedPosterUrl, review: existingReview };
            showNotification('Zaktualizowano pomyślnie.', 'info');
        }
    } else {
        const posterUrl = await fetchMoviePoster(title);
        const newMovie = {
            id: Date.now().toString(),
            title,
            description,
            genre,
            rating,
            watched,
            isWatchlist,
            posterUrl,
            review: ''
        };
        movies.push(newMovie);
        showNotification('Dodano nową pozycję.', 'success');
    }

    saveToLocalStorage();
    renderMovies();
    resetForm();
});

window.openReviewModal = function(id) {
    const movie = movies.find(m => m.id === id);
    if (!movie) return;

    modalMovieId.value = movie.id;
    modalTitle.textContent = movie.title;
    modalGenre.textContent = movie.genre;
    modalReviewText.value = movie.review || '';

    if (movie.posterUrl) {
        modalPoster.src = movie.posterUrl;
        modalPoster.style.display = 'block';
    } else {
        modalPoster.style.display = 'none';
    }

    reviewModal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

closeReviewBtn.addEventListener('click', () => {
    reviewModal.classList.remove('active');
    document.body.style.overflow = '';
});

saveReviewBtn.addEventListener('click', function() {
    const id = modalMovieId.value;
    const index = movies.findIndex(m => m.id === id);
    if (index !== -1) {
        movies[index].review = modalReviewText.value.trim();
        saveToLocalStorage();
        showNotification('Recenzja została zapisana!', 'success');
        reviewModal.classList.remove('active');
        document.body.style.overflow = '';
    }
});

window.openInfoModal = function(id) {
    const movie = movies.find(m => m.id === id);
    if (!movie) return;

    infoModalMovieId.value = movie.id;
    infoModalTitle.textContent = movie.title;
    infoModalGenre.textContent = movie.genre;
    infoModalDesc.textContent = movie.description || 'Brak opisu.';

    infoModalRating.innerHTML = `<span class="sour" style="font-size: 0.9rem;">Czeka na ocenę</span>`;

    if (movie.posterUrl) {
        infoModalPoster.src = movie.posterUrl;
        infoModalPoster.style.display = 'block';
    } else {
        infoModalPoster.style.display = 'none';
    }

    infoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

closeInfoBtn.addEventListener('click', () => {
    infoModal.classList.remove('active');
    document.body.style.overflow = '';
});

moveToMainBtn.addEventListener('click', function() {
    const id = infoModalMovieId.value;
    const index = movies.findIndex(m => m.id === id);
    if (index !== -1) {
        movies[index].isWatchlist = false;
        movies[index].watched = true;

        saveToLocalStorage();
        renderMovies();
        infoModal.classList.remove('active');
        document.body.style.overflow = '';
        showNotification('Przeniesiono. Pamiętaj, aby dodać ocenę (przycisk Edytuj)!', 'success');
    }
});

deleteWatchlistBtn.addEventListener('click', function() {
    const id = infoModalMovieId.value;
    if (confirm('Usunąć ten film z Watchlisty?')) {
        movies = movies.filter(m => m.id !== id);
        saveToLocalStorage();
        renderMovies();
        infoModal.classList.remove('active');
        document.body.style.overflow = '';
        showNotification('Usunięto.', 'error');
    }
});

[reviewModal, infoModal].forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

window.deleteMovie = function(id) {
    if (confirm('Usunąć tę pozycję z listy?')) {
        movies = movies.filter(movie => movie.id !== id);
        saveToLocalStorage();
        renderMovies();
        showNotification('Pozycja usunięta.', 'error');
    }
}

window.editMovie = function(id) {
    const movie = movies.find(m => m.id === id);
    if (movie) {
        idInput.value = movie.id;
        titleInput.value = movie.title;
        descInput.value = movie.description;
        genreInput.value = movie.genre;
        watchedInput.checked = movie.watched;
        isWatchlistInput.checked = movie.isWatchlist;
        ratingInput.value = movie.rating > 0 ? movie.rating : '';
        toggleFormFields();

        formTitle.textContent = 'Edytuj pozycję';
        submitBtn.textContent = 'Zapisz zmiany';
        cancelBtn.classList.remove('hidden');
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    }
};

function resetForm() {
    form.reset();
    idInput.value = '';
    formTitle.textContent = 'Dodaj pozycję';
    submitBtn.textContent = 'Zapisz pozycję';
    submitBtn.disabled = false;
    cancelBtn.classList.add('hidden');
    toggleFormFields();
}

cancelBtn.addEventListener('click', resetForm);
renderMovies();
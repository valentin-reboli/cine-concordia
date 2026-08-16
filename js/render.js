// Renders the home page: filters, movie grid, próximamente, promociones
const state = {
  searchQuery: "",
  filterGenre: "Todos",
  filterFormat: "Todos",
};

function langBadgesFor(movie) {
  return Array.from(new Set(movie.todayTimes.map((t) => t.lang))).map(
    (l) => LANG_LABELS[l],
  );
}

function populateFilterOptions() {
  const genreSelect = document.getElementById("genre-select");
  const formatSelect = document.getElementById("format-select");

  const genres = ["Todos", ...new Set(MOVIES.flatMap((m) => m.genres))];
  genreSelect.innerHTML = genres
    .map((g) => `<option value="${g}">${g}</option>`)
    .join("");

  const formats = ["Todos", "2D", "3D", "ATMOS"];
  formatSelect.innerHTML = formats
    .map((f) => `<option value="${f}">${f}</option>`)
    .join("");
}

function getFilteredMovies() {
  return MOVIES.filter(
    (m) =>
      (state.filterGenre === "Todos" || m.genres.includes(state.filterGenre)) &&
      (state.filterFormat === "Todos" ||
        m.formats.includes(state.filterFormat)) &&
      (state.searchQuery === "" ||
        m.title.toLowerCase().includes(state.searchQuery.toLowerCase())),
  );
}

function renderMovieGrid() {
  const grid = document.getElementById("movie-grid");
  const noResults = document.getElementById("no-results");
  const movies = getFilteredMovies();

  noResults.hidden = movies.length > 0;
  grid.innerHTML = movies
    .map(
      (movie, i) => `
    <div class="movie-card" id="movie-${movie.id}" data-movie-id="${movie.id}" style="animation-delay:${Math.min(i * 0.06, 0.4)}s">
      <div class="movie-poster${movie.poster ? "" : " cc-shimmer"}" data-placeholder="${movie.title}"${movie.poster ? ` style="background-image:url('${movie.poster}');background-size:cover;background-position:center;"` : ""}></div>
      <div class="movie-body">
        <h3 class="movie-title">${movie.title}</h3>
        <div class="movie-meta">
          <span>${movie.genre}</span><span class="dot">·</span><span>${movie.duration} min</span><span class="dot">·</span><span>${movie.rating}</span>
        </div>
        <div class="movie-langs">
          ${langBadgesFor(movie)
            .map((l) => `<span class="lang-badge">${l}</span>`)
            .join("")}
        </div>
      </div>
    </div>
  `,
    )
    .join("");

  grid.querySelectorAll(".movie-card").forEach((card) => {
    card.addEventListener("click", () => {
      const movie = MOVIES.find((m) => m.id === card.dataset.movieId);
      openBooking(movie, movie.todayTimes[0]);
    });
  });
}

function renderComingSoon() {
  const grid = document.getElementById("coming-soon-grid");
  grid.innerHTML = COMING_SOON.map(
    (movie) => `
    <div class="coming-soon-card">
      <div class="coming-soon-poster${movie.poster ? "" : " cc-shimmer"}" data-placeholder="${movie.title}"${movie.poster ? ` style="background-image:url('${movie.poster}');background-size:cover;background-position:center;"` : ""}>
        <span class="release-badge">${movie.releaseDate}</span>
      </div>
      <div>
        <h3>${movie.title}</h3>
        <div class="coming-soon-genre">${movie.genre}</div>
      </div>
    </div>
  `,
  ).join("");
}

function renderPromotions() {
  const grid = document.getElementById("promo-grid");
  grid.innerHTML = PROMOTIONS.map(
    (promo) => `
    <div class="promo-card">
      <div class="promo-tag">${promo.tag}</div>
      <h3>${promo.title}</h3>
      <p class="promo-desc">${promo.description}</p>
    </div>
  `,
  ).join("");
}

function initHomeFilters() {
  populateFilterOptions();

  document.getElementById("search-input").addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    renderMovieGrid();
  });
  document.getElementById("genre-select").addEventListener("change", (e) => {
    state.filterGenre = e.target.value;
    renderMovieGrid();
  });
  document.getElementById("format-select").addEventListener("change", (e) => {
    state.filterFormat = e.target.value;
    renderMovieGrid();
  });
}

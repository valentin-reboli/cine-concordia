# Cine Concordia

A front-end design concept for a movie theater website, built as a portfolio piece. **This is a static UI/UX exercise, not a functional booking system** — there's no backend, no real payment processing, and no persistence; all movie data is hardcoded in [`js/data.js`](js/data.js).

## What it includes

- **Hero** — featured movie (Spider-Man: Un Nuevo Día) with backdrop and quick actions.
- **Cartelera** — the now-showing grid, with search and filters by genre/format.
- **Próximamente** — upcoming releases.
- **Promociones** — promo cards (2x1, student combo, private events).
- **Información** — location (with an embedded Google Map), hours, contact, and amenities.
- **Booking flow** — a click-through mock of picking a showtime, choosing seats, and a payment step, for demonstration purposes only.

## Stack

Plain HTML, CSS, and vanilla JavaScript — no frameworks, no build step, no dependencies.

```
├── index.html
├── css/
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   └── booking.css
├── js/
│   ├── data.js       # movie catalog & static content
│   ├── render.js      # home page rendering (grid, filters, sections)
│   ├── booking.js      # booking flow UI logic
│   └── app.js        # entry point / view routing
└── img/            # posters & backdrops
```

## Running it locally

No build tools needed — just open [`index.html`](index.html) in a browser, or serve the folder with any static server:

```bash
npx serve .
```

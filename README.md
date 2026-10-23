# Traveling Raven

A static site inspired by messenger ravens: you write a note, get a 4-character code (`0–9` and `A–Z`), and someone else uses that code to read the scroll. Upper and lower case are the same code. After it is read, the message disappears.

Pages are titled **Raven Traveler**.

- GitHub Pages: https://lukec3x.github.io/Traveling-Raven/
- Site: http://travelingraven.com.br

## What it does

The home screen has two actions:

- **Send** — write on the scroll. The raven refuses an empty scroll. If there is text, the note is stored and the site shows a 4-character code.
- **Receive** — enter that code. If the note exists, the scroll opens; if not, you get a not-found warning. The note is deleted after it is read.

Portrait and landscape are the same page. The portrait layout lives in `css/style.css` inside `@media (orientation: portrait)`.

## Run locally

```bash
npx supabase start
docker compose up
```

Site: http://localhost:8080. The local database API is on port 54321. On `localhost`, send/receive use that API, not production.

With both already running, the send/receive checks use `http://127.0.0.1:8080` and the local API:

```bash
npm ci
npx playwright install chromium
npx playwright test
```

GitHub Actions runs the same suite on pushes to `master` and on pull requests into `master`. The workflow is `.github/workflows/test.yml`: it starts the local Supabase stack and Compose, then installs Chromium with its system libraries (`--with-deps`, only on the runner).

Without Docker, open `index.html` (or any static server). Send and receive on a public host use the production URL and publishable key in `js/script.js`. Do not copy those values into this file.

## Layout

```
index.html, send.html, receive.html
css/style.css
js/script.js
img/
```

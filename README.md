# Traveling Raven

A static site inspired by messenger ravens: you write a note, get a 4-digit code, and someone else uses that code to read the scroll. After it is read, the message disappears.

Pages are titled **Raven Traveler**.

- GitHub Pages: https://lukec3x.github.io/Traveling-Raven/
- Site: http://travelingraven.com.br

## What it does

The home screen has two actions:

- **Send** — write on the scroll. The raven refuses an empty scroll. If there is text, the note is stored and the site shows a 4-digit code.
- **Receive** — enter that code. If the note exists, the scroll opens; if not, you get a not-found warning. The note is deleted after it is read.

Portrait screens use the `*-mobile.html` pages; landscape uses the desktop pages.

## Run locally

```bash
docker compose up --build
```

Site: http://localhost:8080 — emulator UI: http://localhost:4000. On `localhost`, send/receive use the Realtime Database emulator, not production.

With Compose already running, the send/receive checks use `http://127.0.0.1:8080` and the emulator on port 9000:

```bash
npm ci
npx playwright install chromium
npx playwright test
```

Without Docker, open `index.html` (or any static server). Production hosts keep using the live Firebase project in `js/script.js`.

## Layout

```
index.html, enviar.html, receber.html          # desktop
index-mobile.html, enviar-mobile.html, …
css/                                          # styles
js/script.js                                  # send, code, Firebase
img/                                          # ravens, scroll, icons
```

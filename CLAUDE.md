# CLAUDE.md — Traveling Raven

Agent-facing doc. `README.md` is for people using the site.

Static site (HTML/CSS/JS, no bundler, no backend). GitHub/domain name: **Traveling Raven**. Page title: **Raven Traveler**. One-shot note: sending creates a 4-digit code; receiving reads the note and deletes it from Firebase Realtime Database.

Language: on-screen copy is Portuguese. HTML comments and JS comments are English. The Latin block on the home page is intentional. Database field names stay `dados`, `ID`, and `Mensagem`.

## Invariants

- No login, sessions, queues, or history. The code is the only “address” of a message.
- Realtime Database folder: `dados` (`dbName` in `js/script.js`). Record: `{ ID, Mensagem }`. Field names in the database stay as they are unless a migration is requested.
- `ID` is a 4-digit string (0–9), generated on the client. Collisions are possible; current code does not check uniqueness.
- Receive runs `orderByKey()` + `forEach` over **all** records in `dados`. When `ID` matches, the node is removed. A code works once.
- Shared behavior lives only in `js/script.js`. Each screen is one HTML file. Portrait and landscape are CSS, not a second page.
- Portrait rules are the `@media (orientation: portrait)` block at the end of `css/style.css`. There is no orientation redirect and no WURFL script.
- Firebase is only on send/receive pages (CDN: `firebase-app` + `firebase-database` 8.10.1). Home does not need the SDK, but still includes `script.js`. On `localhost` / `127.0.0.1`, `useEmulator('127.0.0.1', 9000)` points at the Docker Realtime Database emulator.
- Firebase credentials are in the client (`firebaseConfig` in `js/script.js`). Do not copy the key into other docs; do not treat it as a server secret.

## Where to change things

| Area | Files |
| --- | --- |
| Home | `index.html` |
| Send | `send.html` |
| Receive | `receive.html` |
| Behavior | `js/script.js` |
| Look | `css/style.css` (portrait block at the end) |
| Assets | `img/` |

Send and receive use `main#sendReceive`. The home `main` has no id. Back and the end of send go to `index.html`. A missing code reloads `receive.html`. CSS class names stay as they are. A rename of an id has to land in the HTML, in `js/script.js` (including nodes it creates), and in the CSS selectors together.

## JS flows

**Send** — `checkSend()` → empty textarea shows a popup (`#popup` / `#backdrop`); otherwise `send()`: generate 4 digits, clear main, animate `ravenToLeft.gif` right to left, `push` to Firebase, show the digits, then redirect to `index.html`.

**Receive** — `#i0` + `formatCode()` formats with spaces (`1 2 3 4`, `maxlength="7"`). At 4 digits it calls `receiveCode()`: input becomes `readOnly`, animates `ravenToRight`, queries Firebase. Success builds `#received` + a readonly textarea. Failure: popup. Clicking the overlay reloads `receive.html`.

Popups: `closePopup()` only hides `#popup` and `#backdrop`. Popup copy lives in the HTML (send: empty scroll; receive: not found). Check all three pages if that copy changes.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) from now on. Do not copy the old informal history (`add icons`, `Ajustes`).

```
type(optional-scope): short description
```

- Types: `feat` (user-facing change), `fix`, `docs`, `refactor`, `style` (formatting only), `chore` (tooling, ignore files), `perf`, `test`, `ci`.
- Description: imperative, lowercase, no trailing period, ~72 characters. English.
- Body only if the why is not obvious from the subject.
- Examples: `docs: add README and agent guide` · `feat: show not-found popup on receive` · `fix: keep mobile redirect on orientation`

## Editing conventions

- Do not add a build step, framework, or backend unless asked.
- Do not log the user’s message. Avoid extra `console.log` of codes.
- Animation uses `setInterval` + `style.left` in `%`. Constants: send `frames = 100`; receive `frames = 60`. Send starts at `i = 88` when `innerHeight > innerWidth`, and at `84` otherwise. The reset while the write has not returned stays `i = 88`.
- DB field names (`dados`, `ID`, `Mensagem`) stay unless a migration is requested. CSS class names stay unless a rename is requested.

## Deploy

Static. GitHub Pages: `https://lukec3x.github.io/Traveling-Raven/`. Domain: `http://travelingraven.com.br`. Edits to HTML/CSS/JS at the repo root are what ships. There is no Pages deploy workflow.

Local: `docker compose up --build` — nginx on `:8080`, Realtime Database emulator on `:9000`, emulator UI on `:4000`.

Send/receive checks run on the host, after Compose is up: `npm ci`, `npx playwright install chromium`, `npx playwright test`. The suite opens `http://127.0.0.1:8080` only and reads `dados` from the emulator. Screens are found by `data-testid` in the HTML and on the nodes `js/script.js` creates after send and receive.

`.github/workflows/test.yml` runs that suite on `ubuntu-latest` for pushes to `master` and for pull requests into `master`. It starts Compose in the background, waits until `http://127.0.0.1:8080/index.html` and a `DELETE` of `http://127.0.0.1:9000/dados.json?ns=raven-traveler` both succeed, then runs `npm ci`, `npx playwright install --with-deps chromium`, and `npx playwright test`. `--with-deps` is only for the runner. A failed job prints Compose logs and uploads `playwright-report` and `test-results`.

There is no `ai/INDEX.md` and no `*.skills.md`. This file is the canonical agent doc.

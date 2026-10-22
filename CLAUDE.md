# CLAUDE.md — Traveling Raven

Agent-facing doc. `README.md` is for people using the site.

Static site (HTML/CSS/JS, no bundler, no backend). GitHub/domain name: **Traveling Raven**. Page title: **Raven Traveler**. One-shot note: sending creates a 4-digit code; receiving reads the note and deletes it from Firebase Realtime Database.

Language: product copy is moving to English. These markdown files are already English. HTML, JS comments, and on-screen strings are still Portuguese until that pass. New UI copy should be English. The Latin block on the home page is intentional.

## Invariants

- No login, sessions, queues, or history. The code is the only “address” of a message.
- Realtime Database folder: `dados` (`dbName` in `js/script.js`). Record: `{ ID, Mensagem }`. Field names in the database stay as they are unless a migration is requested.
- `ID` is a 4-digit string (0–9), generated on the client. Collisions are possible; current code does not check uniqueness.
- Receive runs `orderByKey()` + `forEach` over **all** records in `dados`. When `ID` matches, the node is removed. A code works once.
- Shared behavior lives only in `js/script.js`. Desktop and mobile do not have separate JS.
- Desktop/mobile redirect is by **orientation** (`innerHeight` vs `innerWidth`), not user-agent. Home also loads WURFL, but each page’s redirect is the `if` in `<head>`.
- Firebase is only on send/receive pages (CDN: `firebase-app` + `firebase-database` 8.10.1). Home does not need the SDK, but still includes `script.js`. On `localhost` / `127.0.0.1`, `useEmulator('127.0.0.1', 9000)` points at the Docker Realtime Database emulator.
- Firebase credentials are in the client (`firebaseConfig` in `js/script.js`). Do not copy the key into other docs; do not treat it as a server secret.

## Where to change things

| Area | Files |
| --- | --- |
| Home | `index.html`, `index-mobile.html` |
| Send | `enviar.html`, `enviar-mobile.html` |
| Receive | `receber.html`, `receber-mobile.html` |
| Behavior | `js/script.js` |
| Desktop look | `css/style.css` |
| Mobile look | `css/style.mobile.css` (on top of desktop CSS) |
| Assets | `img/` |

Mobile pages use `main#main-mobile` (home) or `main#main-mobile-2` (send/receive). Desktop send/receive uses `main#envRec`. JS switches between those with `try/catch` on `getElementById`. Changing one id without the other breaks send/receive.

Mobile home links to `enviar-mobile.html` / `receber-mobile.html`. The back button on mobile goes to `index-mobile.html`; on desktop, to `index.html`. Filenames stay Portuguese until a rename pass.

## JS flows

**Send** — `verificarEnv()` → empty textarea shows a popup (`#frente` / `#fundo`); otherwise `enviar()`: generate 4 digits, clear main, animate `ravenToLeft.gif` right to left, `push` to Firebase, show the digits, then redirect to `index.html` (including the mobile flow).

**Receive** — `#i0` + `veriCod()` formats with spaces (`1 2 3 4`, `maxlength="7"`). At 4 digits it calls `recInputCod()`: input becomes `readOnly`, animates `ravenToRight`, queries Firebase. Success builds `#recMsg` + a readonly textarea. Failure: popup. On desktop, clicking the overlay reloads `receber.html` (not the mobile variant).

Popups: `fecharPopup()` only hides `#frente` and `#fundo`. Popup copy lives in the HTML (send: empty scroll; receive desktop: not found). Check all three pages if that copy changes.

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

- Keep the desktop/mobile pair in sync when the change is shared flow or markup.
- Do not add a build step, framework, or backend unless asked.
- Do not log the user’s message. Avoid extra `console.log` of codes.
- Animation uses `setInterval` + `style.left` in `%`. Constants: send `frames = 100`; receive `frames = 60`. Send starting position desktop vs mobile: `i = 84` vs `88`.
- Function names, DOM ids, and DB field names (`verificarEnv`, `envRec`, `Mensagem`, …) stay as in the code unless a rename is requested.

## Deploy

Static. GitHub Pages: `https://lukec3x.github.io/Traveling-Raven/`. Domain: `http://travelingraven.com.br`. Edits to HTML/CSS/JS at the repo root are what ships; there is no pipeline in this repo.

Local: `docker compose up --build` — nginx on `:8080`, Realtime Database emulator on `:9000`, emulator UI on `:4000`.

Send/receive checks run on the host, after Compose is up: `npm ci`, `npx playwright install chromium`, `npx playwright test`. The suite opens `http://127.0.0.1:8080` only and reads `dados` from the emulator. Screens are found by `data-testid` in the HTML and on the nodes `js/script.js` creates after send and receive.

There is no `ai/INDEX.md` and no `*.skills.md`. This file is the canonical agent doc.

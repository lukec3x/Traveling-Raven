# CLAUDE.md — Traveling Raven

Agent-facing doc. `README.md` is for people using the site.

Static site (HTML/CSS/JS, no bundler, no backend). GitHub/domain name: **Traveling Raven**. Page title: **Raven Traveler**. One-shot note: sending creates a 4-character code; receiving reads the note and deletes it from Supabase.

Language: on-screen copy is Portuguese. HTML comments and JS comments are English. The Latin block on the home page is intentional. Database field names stay `dados`, `ID`, and `Mensagem`.

## Invariants

- No login, sessions, queues, or history. The code is the only “address” of a message.
- Table `public.dados`. Record: `{ ID, Mensagem }`. Field names stay as they are unless a migration is requested.
- `ID` is four characters from `0–9` and `A–Z`, generated on the client and stored in uppercase. A collision makes `enviar` return false; the client draws another code, up to 20 times.
- Receive calls `receber`, which deletes only the matching row and returns its `Mensagem`. A code works once. `anon` cannot read or list the table. The publishable key may only execute `enviar` and `receber`.
- Shared behavior lives only in `js/script.js`. Each screen is one HTML file. Portrait and landscape are CSS, not a second page.
- Portrait rules are the `@media (orientation: portrait)` block at the end of `css/style.css`. There is no orientation redirect and no WURFL script.
- The browser calls PostgREST with `fetch`. There is no database SDK. Home still includes `script.js`. On `localhost` / `127.0.0.1`, the client uses `http://127.0.0.1:54321` and the local anon key. Any other host uses the production URL and publishable key in `js/script.js`. An empty pair fails the send onto the slate.
- Do not copy the publishable key, the production URL, or the local demo JWTs into other docs. The service role is not a client credential.

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

**Send** — `checkSend()` → empty textarea shows a popup (`#popup` / `#backdrop`); otherwise `send()`: draw 4 characters, clear main, animate `ravenToLeft.gif` right to left, call `enviar`, show the characters that were stored, then redirect to `index.html`.

**Receive** — `#i0` + `formatCode()` keeps letters and digits, uppercases, and formats with spaces (`A B 1 2`, `maxlength="7"`). At 4 characters it calls `receiveCode()`: input becomes `readOnly`, animates `ravenToRight`, calls `receber`. Success builds `#received` + a readonly textarea. Failure: popup. Clicking the overlay reloads `receive.html`. `ab12` matches `AB12`.

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

`.github/workflows/deploy.yml` publishes `index.html`, `send.html`, `receive.html`, `robots.txt`, `css/`, `js/`, and `img/` after `test` succeeds on a push to `master`. FTP login lands in `www/`; files go to `www/travelingraven.com.br/`. The login is the `FTP_USER` and `FTP_PASSWORD` repository secrets.

Local: `npx supabase start` (API on `:54321`), then `docker compose up` — nginx on `:8080`. Schema lives in `supabase/migrations`.

Send/receive checks run on the host, after both are up: `npm ci`, `npx playwright install chromium`, `npx playwright test`. The suite opens `http://127.0.0.1:8080` only and reads `dados` from `http://127.0.0.1:54321/rest/v1/dados` with the local service role. Screens are found by `data-testid` in the HTML and on the nodes `js/script.js` creates after send and receive.

`.github/workflows/test.yml` runs that suite on `ubuntu-latest` for pushes to `master` and for pull requests into `master`. It starts Supabase, then Compose, waits until `http://127.0.0.1:8080/index.html` and the API on `:54321` both respond, then runs `npm ci`, `npx playwright install --with-deps chromium`, and `npx playwright test`. `--with-deps` is only for the runner. A failed job prints Compose logs and uploads `playwright-report` and `test-results`.

There is no `ai/INDEX.md` and no `*.skills.md`. This file is the canonical agent doc.

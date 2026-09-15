# MPL Event Platform — Frontend (MPL-FE)

Plain HTML + CSS + JS. **No build step, no Node, no framework.** Every page
references `./assets/…` relatively, so this folder works identically served
from the API at `/ui`, from Live Server, or even from `file://`.

Pairs with the **MPL-BE** repo, which provides the `/api` these pages call.
The API must run on **port 8000** — the pages assume it (see §6).

---

## 1. Features

**Pages (flow: landing → hub → arenas)**

| File | Purpose |
|---|---|
| `landing.html` | Entry page: crest hero, starfield + parallax, tech-font switcher (choice persisted). Log In goes straight to the hub — the landing has **no login of its own** |
| `index.html` | Arena hub: cards for console / boost / challenge. Challenge card stays **locked with a toast** until an admin starts a session |
| `main.html` | MAIN round coding console ← the editor (details below) |
| `boost.html` | Time-boost bidding page (legacy round) |
| `challenge.html` | Head-to-head challenge page (legacy round) |
| `admin.html` | Admin panel behind the passcode: teams, questions, test cases, submissions, rejudge, leaderboard, judge health |

**The console (`main.html` + `assets/js/main.js`)**

- Team login; session token kept in `sessionStorage` (survives reloads).
- Question tabs with sub-type, points, attempts, best score; per-language
  starter code served by the API.
- Monaco editor (pinned `monaco-editor@0.52.2` via jsDelivr) with syntax
  highlighting per language — and an automatic plain-textarea fallback if
  the CDN is unreachable or slow. Coding never blocks on the CDN.
- **Run Samples** (visible tests only, never scores) and **Submit** (all
  tests, awards partial credit); language switcher (Python / C / C++ / Java).
- Per-test results: pass/fail + judge status for every test; sample tests
  additionally show input / expected / your output; hidden tests show
  pass-or-fail only (their data never leaves the server).
- Live countdown (server-synced every 15 s, ticked locally each second),
  points and best-score pills.
- **Drafts persist per question *and* per language** in `localStorage` —
  switching tabs or languages never loses code.

**Platform**

- One stylesheet + one script per page + two shared files
  (`shared-theme.css`, `cosmic-interaction.js`) — add a page by copying
  the pattern, no registry to update.
- Zero absolute paths: page links are bare filenames, assets are
  `assets/…` — the folder is portable across all three serving layouts.

---

## 2. Limitations & known issues

- **The API must be on port 8000.** Four pages hardcode
  `http://localhost:8000`; only the console detects same-origin. In a
  *remote* preview (someone else's machine/URL) those four pages' logins
  fail — locally everything works. Event day is unaffected (single
  origin).
- **Internet is assumed for cosmetics + editor.** Google Fonts and the
  Monaco CDN need connectivity; offline you get system fonts and the
  textarea fallback. Scoring is unaffected.
- **Sessions are per tab.** Tokens live in `sessionStorage` — a second
  tab means logging in again. (Related backend rule: one live session
  per team — a second device logging in invalidates the first.)
- **Desktop layout.** Not designed for phones.
- **No auto-submit at 0:00.** When the clock expires the API rejects new
  submits (403) — nothing is submitted on the team's behalf.
- **Boost/challenge are legacy flows** depending on backend legacy
  endpoints (some unauthenticated by design, for now).
- Cosmetic: `@font-face` rules reference local `woff2` files that are not
  shipped; browsers silently use the Google Fonts webfonts instead.
  Invisible in practice.

---

## 3. Run on Windows

You need: the backend running (§3.1) plus **one** of the two options below.
Only tool required here: a browser (+ optionally VS Code Live Server).

### 3.1 The backend (once per machine)

Follow MPL-BE README §3: venv → install → `.env` (SQLite!) → `reset_db.py` →
`uvicorn app.main:app --port 8000` → `seed.py` in a second window.

**Logins:** Team Alpha / `alpha123`, Team Beta / `beta123`,
Team Gamma / `gamma123`. Admin: `admin123`.

### 3.2 Option A — served by the API (recommended, event-day layout)

```powershell
cd D:\projects
git clone <backend-repo-url> MPL-BE
git clone <frontend-repo-url> MPL-FE
notepad MPL-BE\.env        # set:  FRONTEND_DIR=../MPL-FE
```

Start the API, open `http://localhost:8000/ui/landing.html`.
One process, one URL, no CORS.

### 3.3 Option B — Live Server (for editing HTML/CSS)

Serve this folder (or its parent) with VS Code Live Server /
`python -m http.server`:

| Server root | Open |
|---|---|
| this folder (`MPL-FE`) | `http://127.0.0.1:5500/landing.html` |
| parent (`D:\projects`) | `http://127.0.0.1:5500/MPL-FE/landing.html` |

The API must still run on port 8000 — the pages call it across origins.

### 3.4 After any edit

Hard-refresh: **Ctrl+Shift+R**. No server restart is ever needed for
frontend changes. If a page misbehaves, press **F12 → Console** first —
red lines name the exact missing file or failing API call. Fix what it
says, nothing else.

| Symptom | Likely cause |
|---|---|
| Unstyled / dead page | `assets/` folder missing or misplaced next to the HTML |
| Login spins then "cannot reach server" | API not running on `:8000` |
| Old version after editing | Cached bundle — hard-refresh |
| `Cannot GET /ui/…` | You're on Live Server but followed a `/ui/` link — use the §3.3 URLs |

---

## 4. How judging works — from the screen

Exactly what happens when a team presses the buttons (engine detail: §5;
full spec: MPL-BE README §5):

- **Run Samples** → `POST /api/main/run`: only the question's **visible**
  samples execute, the response shows input / expected / your output per
  sample, and **score is always 0**. If a question has no samples the API
  answers 400 ("no sample tests to run").
- **Submit** → every test (visible + hidden) executes. The response shows
  per-test pass/fail + judge status; hidden rows show **pass-or-fail
  only** — no input, no expected answer, no stdout. Points come from the
  hidden pool only (`round(points × passed_weight / total_weight)`).
- **Verdicts you can see:** `PASSED` (all green) · `PARTIAL` (some green,
  still scores!) · `FAILED` (none) · `ERROR` (judge-side failure —
  **score untouched**, retry or ask an admin to rejudge) · `JUDGING`
  (transient, while the request runs).
- **Judge statuses per test:** Accepted / Wrong Answer (both can still
  pass via tolerant compare) · Time Limit Exceeded · Compilation Error
  (shown once, applies to all tests) · Runtime errors · Internal Error
  (→ whole submission becomes `ERROR`, §5).
- **Cooldown:** submitting twice within 5 s on one question → `429`
  "slow down" (serial submits; also protects the judge queue).
- **Clock:** the console syncs remaining time with the server every 15 s
  and ticks locally each second; at 0:00 the API answers 403 on new
  run/submits. Server time always wins — never the laptop clock.
- **Drafts:** every keystroke area is saved per question+language
  (`localStorage`); switching tabs/languages restores instantly.

---

## 5. Judge0 engine & current state

(One-paragraph-accurate summary for frontend folks; the normative spec is
MPL-BE README §5–§6.)

**How the engine works.** The backend runs one pipeline for Run/Submit:
guards (login, clock, language, 64 KB cap, cooldown) → build one job per
test → send to the configured judge → map outcomes to pass/fail → score →
strip hidden IO → respond, all inside the HTTP request. Two judge
backends exist behind one interface: **`mock`** (executes Python locally
in a subprocess — dev only, not a sandbox) and **`judge0`** (real
sandbox). The Judge0 client submits all tests in one base64 batch, polls
for completion (0.4 s interval, 30 s cap), resolves language IDs by name
from `/languages`, and authenticates with `X-Auth-Token`. Correctness is
decided by our comparators (`EXACT`/`TRIM`/`TOKENS`/`FLOAT`, rel-tol
1e-6); Judge0 only decides errors. Any Internal Error → `ERROR` verdict,
score frozen.

**Current state — the honest table.**

| Piece | State |
|---|---|
| Mock judging end-to-end (what you exercise locally) | ✅ Proven |
| Comparators, partial credit, best-score, hidden-IO stripping | ✅ Proven |
| Real Judge0 wire code | ⚠️ Written, **never executed** |
| C / C++ / Java execution | ❌ Never ran anywhere |
| Judge0 compose stack | ❌ Untested + version-skewed config (see BE §6) |
| Sandbox hardening | ❌ Not configured |

**What this means for frontend work:** everything you can click locally
runs the mock and behaves as §4 describes. Before the event someone must
prove the real stack (BE README §6 lists the 5 proofs, incl. known-good
submits in all four languages). If real-Judge0 statuses ever surface
differently in the console, that is a backend-mapping issue, not a page
bug — report the raw `judge_status`/`judge_status_id` from the response.

---

## 6. API contract (what the backend must provide)

**Base URL:** `hub/boost/challenge/admin.js` hardcode
`http://localhost:8000`. `main.js` (console) uses same-origin when served
from `:8000`, else falls back to `http://localhost:8000`.
`landing.js` calls no API.

**Endpoints used, by page:**

| Page | Calls |
|---|---|
| `main.html` | `POST /api/auth/login` → `X-Team-Token` · `GET /api/main/questions` · `POST /api/main/run` · `POST /api/main/submit` · `GET /api/main/clock` · `GET /api/teams/{id}/status` |
| `boost.html` | login · `GET /api/teams/{id}/status` · `GET /api/questions/{id}` · `GET …/sample-tests` |
| `challenge.html` | login · `GET /api/teams/{id}/status` · `GET /api/questions/{id}` · `GET …/sample-tests` |
| `admin.html` | `admin-passcode` header + `/api/admin/*` (teams, questions, test-cases, challenge/create, assign-boost, mark-solved, leaderboard, judge/health) |
| `index.html`, `landing.html` | none |

**Browser storage:** sessions in `sessionStorage` (`mpl_team`,
`mpl_boost_team`, `mpl_challenge_team`, `mpl_admin_pass`) — per tab.
Drafts (`mpl_drafts`), landing font (`mpl_math_font`) and the admin
question cache in `localStorage`. Full endpoint semantics: MPL-BE
README §7.

---

## 7. Structure & editing

```
landing.html index.html main.html boost.html challenge.html admin.html
assets/
  css/   shared-theme.css (tokens/glass/cosmic system, every page)
         + landing · hub · main · boost · challenge · admin
  js/    cosmic-interaction.js (cursor stars/parallax)
         + landing · hub · main · boost · challenge · admin
  images/  mpl-crest.png · cosmic-background.jpg
```

Rules: one stylesheet + one script per page; keep every reference
relative (`assets/…`, bare page filenames) — never `/ui/…`, never an
absolute path, or the page breaks under the other serving layouts. If
you touch the console, re-verify against a live API: login → questions
load → Run shows samples → Submit scores → clock ticks.

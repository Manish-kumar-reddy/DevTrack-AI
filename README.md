# DevTrack AI

[![CI](https://github.com/Manish-kumar-reddy/DevTrack-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/Manish-kumar-reddy/DevTrack-AI/actions/workflows/ci.yml)

**AI-Powered Developer Productivity Platform** -- track coding practice, contest history, and interview prep goals; get a personalized DSA roadmap from a rule-based AI planner; visualize progress with real analytics; and auto-generate a portfolio summary from your own tracked data.

Full-stack: **React 19 + Vite + Tailwind** frontend, **Node.js + Express + Sequelize + MySQL** backend, **JWT** auth.

> Screenshots: see [`screenshots/README.md`](screenshots/README.md) -- the app is fully built and verified (details below), but screenshots need to be captured by hand since this was built in an environment without a browser tool.

---

## Features

- **Auth** -- register/login/logout, JWT, bcrypt password hashing, protected routes, editable profile, change password.
- **Smart Dashboard** -- total solved, Easy/Medium/Hard breakdown, current streak, weekly consistency, goal completion, active days, platform ranking. Animated stat cards (Framer Motion).
- **AI Study Assistant** -- give it a weak topic, target company, and days remaining; get back a phased roadmap, a day-by-day schedule, and a difficulty progression. 100% rule-based (a static topic-progression graph + company interview profiles) -- **no external/paid API, no API key, no network dependency.**
- **Problem Tracker** -- full CRUD, search, filter (platform/difficulty/status/topic), sort, pagination, favorites.
- **Contest Tracker** -- log contests with rating/rank/problems solved; rating progression chart.
- **Goals** -- daily/weekly/monthly targets, with completion % and remaining count computed live from your actual solved problems (never a stale stored counter).
- **Analytics** -- monthly solving trend, topic distribution, difficulty breakdown, platform comparison, rating progression, and a GitHub-style activity heatmap.
- **Resume Mode** -- auto-generated portfolio summary ("17 LeetCode, 1 GeeksforGeeks, strongest in Arrays & Two Pointers...") exportable as a PDF, client-side, from your own data.
- **Premium UI** -- glassmorphism, full dark mode, mobile-responsive, sidebar nav, loading skeletons, toasts, empty/error states.

---

## Tech Stack

| | |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router 7, Axios, Recharts, Framer Motion, jsPDF |
| **Backend** | Node.js, Express, Sequelize ORM, MySQL 8, JWT, bcrypt, express-validator |
| **Infra** | Docker Compose (local), Render (backend), Vercel (frontend) |

---

## CI/CD

[![CI](https://github.com/Manish-kumar-reddy/DevTrack-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/Manish-kumar-reddy/DevTrack-AI/actions/workflows/ci.yml)

A GitHub Actions workflow ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs on every push and every pull request targeting `main`:

| Job | What it does |
|---|---|
| `backend` | Node.js 20 · `npm ci` in `backend/` |
| `frontend` | Node.js 20 · `npm ci` in `frontend/` · `npm run build` |

Both jobs run in parallel and fail the workflow the moment any step exits non-zero -- GitHub Actions' default behavior, no extra configuration needed. This catches a broken dependency install or a broken production build (`vite build`) before it reaches `main`.

There is no backend test step yet -- `jest`/`supertest` are already installed as devDependencies, but no test files exist in `backend/` yet. Adding real tests there is the natural next step to extend this pipeline.

---

## Project Structure

```
devtrack-ai/
  frontend/       # React 19 + Vite + Tailwind SPA
  backend/        # Express + Sequelize API
  database/       # schema.sql (reference DDL, matches what Sequelize creates)
  docs/           # architecture, ER diagram, API reference, deployment guide
  screenshots/    # portfolio screenshots (see screenshots/README.md)
  docker-compose.yml
  .env.example
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the layering/design rationale and [`docs/ER_DIAGRAM.md`](docs/ER_DIAGRAM.md) for the full schema diagram.

---

## Quick Start

### Option A -- Docker Compose (fastest)

```bash
git clone <this-repo>
cd devtrack-ai
cp .env.example .env        # edit if you want non-default passwords/secrets
docker compose up --build
```

Frontend: http://localhost:5173 · Backend: http://localhost:5000/api/health

### Option B -- manual (local Node + MySQL)

```bash
# 1. Database -- point at any MySQL 8 instance you have running locally
mysql -u root -e "CREATE DATABASE devtrack_ai; CREATE USER 'devtrack_user'@'localhost' IDENTIFIED BY 'devtrack_password'; GRANT ALL ON devtrack_ai.* TO 'devtrack_user'@'localhost';"

# 2. Backend
cd backend
cp .env.example .env        # fill in DB_HOST/DB_USER/DB_PASSWORD/JWT_SECRET
npm install
npm run dev                 # http://localhost:5000 -- creates all tables on first boot
npm run seed                 # optional: demo account with realistic sample data

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # http://localhost:5173
```

Demo login after `npm run seed`: **demo@devtrack.ai** / **Demo@12345**

> **macOS note:** port `5000` is used by AirPlay Receiver (Control Center) on modern macOS, and the backend's default `PORT=5000` will fail to bind if it's enabled. Either turn off AirPlay Receiver in System Settings → General → AirDrop & Handoff, or set a different `PORT` in `backend/.env` and update `VITE_API_URL` in `frontend/.env` to match.

---

## API

Full reference with request/response examples: [`docs/API.md`](docs/API.md).

| Resource | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET/PUT /auth/profile`, `PUT /auth/change-password` |
| Problems | `GET/POST /problems`, `GET/PUT/DELETE /problems/:id`, `POST /problems/:id/favorite` |
| Contests | `GET/POST /contests`, `GET /contests/rating-history`, `PUT/DELETE /contests/:id` |
| Goals | `GET/POST /goals`, `PUT/DELETE /goals/:id` |
| Analytics | `GET /analytics/summary`, `GET /analytics/charts`, `GET /analytics/heatmap` |
| AI | `POST /ai/study-plan` |
| Resume | `GET /resume/summary` |

---

## What's actually been verified

Everything below was tested live against a real (throwaway, disposable) MySQL instance and a running Express server/Vite dev server on this machine -- not just written and assumed correct:

- **Auth**: register, duplicate-email rejection, weak-password/invalid-email validation, login success/failure, missing/invalid-token rejection, profile fetch/update, password change (confirmed the old password stops working and the new one works).
- **Problems**: create, list, search, filter (platform/difficulty/status), sort (asc/desc), pagination, favorite toggle + filter, update, delete, 404 on missing/foreign records.
- **Contests**: CRUD, rating history ordering, validation rejection on invalid platform.
- **Goals**: progress/completion percent computed and cross-checked by hand against seeded data (100% and 80% cases), `endDate < startDate` rejected.
- **Analytics**: every number in `summary`, `charts`, and `heatmap` was independently hand-calculated from the seeded test data and matched exactly, including a 3-day streak computed from consecutive activity dates ending "today."
- **AI Study Planner**: tested a 14-day Google/Graphs plan and a 5-day generic sprint; confirmed phase-day sums equal `daysRemaining`, daily schedule length matches, and invalid `daysRemaining` is rejected.
- **Resume Mode**: generated summary text and stats cross-checked against the same seeded data.
- **Security**: a second registered user was confirmed unable to read, update, or delete the first user's problems/contests (404, not 403 -- existence isn't leaked), and their own analytics/list views were confirmed empty/isolated.
- **Seed script**: runs cleanly against a fresh database, is idempotent (a second run is a safe no-op), and produces a demo account whose dashboard numbers (streak, weekly consistency, goal completion) were manually verified against the seed data.
- **Frontend**: production build (`vite build`) compiles cleanly through the full page tree, dev server serves all routes, and every API call in the frontend was cross-checked field-by-field against its backend contract. CORS was verified with real preflight (`OPTIONS`) and request headers, not assumed.
- **Dependency security**: `npm audit` was run on both `frontend/` and `backend/` after every dependency change; both currently report **0 known vulnerabilities** (bcrypt was bumped off a vulnerable transitive dependency chain; jsPDF, Vite, and React Router were bumped to patched majors and the app was rebuilt/retested after each bump).

What I could **not** verify in this environment: actual browser rendering/interaction (no browser automation tool available), and a live Docker build (Docker isn't installed on this machine) -- the `Dockerfile`s and `docker-compose.yml` follow standard, widely-used patterns (multi-stage Node build, Nginx static serving with SPA fallback) but haven't been executed here. Please run `docker compose up --build` yourself before relying on it for a demo.

---

## Deployment

[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) -- Vercel (frontend) + Render (backend), including an honest note that **Render does not offer managed MySQL** and what to do about it (external managed MySQL host, or self-hosted via the included `docker-compose.yml` service definition).

---

## License

MIT

## Latest Update

- Fixed PostgreSQL compatibility for the Analytics dashboard.
- Replaced MySQL `DATE_FORMAT()` with PostgreSQL `TO_CHAR()`.
- Monthly trend charts are now fully compatible with Neon PostgreSQL.


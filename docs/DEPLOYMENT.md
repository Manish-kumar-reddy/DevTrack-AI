# Deployment Guide -- Vercel (frontend) + Render (backend)

## A note on MySQL specifically

Render's own managed database offerings are **PostgreSQL and Redis -- Render does not offer a managed MySQL instance.** You have two real options; pick one:

- **Option A -- MySQL on a Render Private Service.** Deploy `mysql:8.0` as a private web service with a persistent disk attached, using `docker-compose.yml`'s `mysql` service definition as the reference. Simplest if you want everything on one platform, but you're responsible for backups.
- **Option B (recommended) -- an external managed MySQL host.** [PlanetScale](https://planetscale.com), [Railway](https://railway.app), or [Aiven](https://aiven.io) all have MySQL-compatible free/low-cost tiers you can provision in a few minutes. Render's backend service then just points at that host via environment variables -- nothing else changes. This is generally less operational overhead than self-hosting MySQL on a platform that doesn't natively support it.

Whichever you choose, you end up with five values: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`. Everything below assumes you have them.

---

## 1. Backend → Render

1. Push this repo to GitHub.
2. In the Render dashboard: **New → Web Service**, connect the repo, set **Root Directory** to `backend`.
3. **Build Command:** `npm ci`
   **Start Command:** `node src/server.js`
   (Render's Node runtime handles this without needing the Dockerfile, though `backend/Dockerfile` also works if you'd rather deploy as a Docker service.)
4. Environment variables (Render dashboard → Environment):

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` (or leave unset -- Render injects its own `PORT`, and `server.js` reads `process.env.PORT`) |
   | `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | from your MySQL provider (see above) |
   | `JWT_SECRET` | a long random string -- generate one with `openssl rand -base64 48`, never reuse the one from `.env.example` |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CORS_ORIGIN` | your deployed frontend's exact origin, e.g. `https://devtrack-ai.vercel.app` (no trailing slash) |

5. Deploy. On first boot, `sequelize.sync()` creates all six tables automatically -- no manual migration step needed. Confirm with `curl https://<your-service>.onrender.com/api/health` → `{"status":"ok"}`.
6. Optional: run `npm run seed` once (Render Shell, or locally with `DB_HOST` etc. pointed at the production DB) to create the demo account for a live portfolio link.

**⚠️ Free-tier cold starts:** Render's free web services spin down after inactivity and take 30-60s to wake on the next request. If you're linking this from a resume, either upgrade off the free tier or mention the cold-start delay so a first-time visitor doesn't think it's broken.

---

## 2. Frontend → Vercel

1. In the Vercel dashboard: **New Project**, import the same repo, set **Root Directory** to `frontend`.
2. Framework preset: **Vite**. Build command `npm run build`, output directory `dist` (Vercel detects both automatically for a Vite project).
3. Environment variable:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://<your-render-service>.onrender.com/api` |

   Vite bakes `VITE_*` variables in at **build time**, so set this before the first deploy -- changing it later requires a redeploy, not just a restart.
4. Deploy. Vercel serves the SPA with a catch-all rewrite to `index.html` by default, so React Router's client-side routes (`/problems`, `/analytics`, etc.) work on hard refresh without extra config.
5. Once deployed, go back to Render and set `CORS_ORIGIN` to this exact Vercel URL (step 1.4 above), then redeploy the backend -- until you do, the deployed frontend's requests will be blocked by CORS even though everything looks fine in `curl`.

---

## 3. Verifying the deployed stack

```bash
# Backend health
curl https://<your-render-service>.onrender.com/api/health

# Register a real account through the deployed frontend, then confirm
# a matching row exists via a login:
curl -X POST https://<your-render-service>.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"yourpassword"}'
```

Open the Vercel URL in a browser, open DevTools → Network, and confirm `POST /api/auth/login` returns `200` with no CORS error in the console. A red CORS error here almost always means `CORS_ORIGIN` on Render doesn't exactly match the Vercel URL (protocol + host, no trailing slash).

---

## 4. Running everything locally with Docker Compose (alternative to steps 1-2)

```bash
cp .env.example .env   # fill in real values
docker compose up --build
```

This brings up MySQL, the backend (port 5000), and the frontend served by Nginx (port 5173) exactly as described in `docker-compose.yml`. Useful for a fully self-contained local demo, or as a starting point for deploying all three services to a single VM/container host instead of Vercel+Render.

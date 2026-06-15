# Backend Design — portfolio.gupa.dev

**Date:** 2026-06-15  
**Status:** Ready for implementation  
**Scope:** Replace static `photos.js` with a real Go API backed by SQLite. Keep the single-binary, single-service deployment.

---

## Context

The frontend is a React + Vite SPA served by a Go static file server on port 8003 via systemd. Photos are currently hardcoded in `src/data/photos.js`. An Admin UI (`/admin`) was built this session but its form currently only generates a JS config snippet to paste manually — there is no persistence layer.

**Goals of this work:**
- Add a REST API to the existing Go binary (no new processes, no nginx)
- Store photo metadata in SQLite
- Store photo files on the local filesystem (unchanged from current `/public/photos/`)
- Wire the Admin form to actually POST/PUT to the API
- Move auth to the server (JWT in HTTP-only cookie, credentials in env vars)
- Remove the "Generated Config" section from the Admin page — it was always temporary

---

## Architecture Decision

**Single binary, proper Go packages.** The current `cmd/portfolio-app/main.go` is 30 lines — a static file server. We expand it by adding `internal/` packages and a `chi` router. Same systemd service, same `deploy.sh`, same port 8003.

```
cmd/
  portfolio-app/
    main.go              ← entry point: init DB, build router, start server

internal/
  db/
    db.go                ← SQLite open + migrate (CREATE TABLE IF NOT EXISTS)
    photos.go            ← CRUD queries for photos table
  auth/
    auth.go              ← JWT sign/verify + HTTP middleware
  api/
    router.go            ← chi router: mounts public + protected routes
    photos.go            ← handlers: list, create, update, delete
    auth.go              ← handlers: login, logout
  store/
    photos.go            ← file save/delete on local filesystem
```

---

## Database Schema

One table. `genres` is stored as a JSON string (`'["landscape","travel"]'`).

```sql
CREATE TABLE IF NOT EXISTS photos (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  year         INTEGER NOT NULL,
  genres       TEXT NOT NULL,
  src          TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL,
  shutter      TEXT,
  aperture     TEXT,
  iso          INTEGER,
  focal        TEXT,
  camera       TEXT,
  lens         TEXT,
  location     TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
```

DB file lives at `./portfolio.db` (configurable via env var). On first startup with an empty DB, seed from the 12 existing photos automatically (see Migration section).

---

## API Routes

### Public

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/photos` | List all photos, ordered by `sort_order ASC, created_at DESC` |

### Protected (JWT cookie required)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/photos` | Upload photo — `multipart/form-data` with `file` + metadata fields |
| `PUT` | `/api/photos/:slug` | Update metadata only (no file re-upload) — JSON body |
| `DELETE` | `/api/photos/:slug` | Delete record + file from disk |

### Auth

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/login` | `{ "email": "...", "password": "..." }` → sets `admin_session` cookie |
| `POST` | `/api/auth/logout` | Clears `admin_session` cookie |

---

## Photo JSON Shape

The API response must match what the frontend currently expects from `photos.js`, so no frontend data-mapping is needed beyond the fetch call itself.

```json
{
  "slug": "golden-hour-patagonia",
  "title": "Golden Hour, Patagonia",
  "year": 2025,
  "genres": ["landscape", "travel"],
  "src": "/photos/golden-hour-patagonia.jpg",
  "aspectRatio": "3/2",
  "exif": {
    "shutter": "1/500s",
    "aperture": "f/2.8",
    "iso": 400,
    "focal": "35mm",
    "camera": "Sony A7IV",
    "lens": "24–70 f/2.8",
    "location": "Patagonia, AR"
  }
}
```

Omit null/empty EXIF fields from the response (same as the current static data behaviour).

---

## Auth

- Credentials stored in env vars: `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- On successful login: sign a JWT (24h expiry) with `JWT_SECRET` env var, set as `admin_session` HTTP-only, `SameSite=Lax` cookie
- Protected routes: middleware extracts and verifies the cookie JWT before passing to handler; returns 401 if missing or invalid
- No refresh tokens — 24h is fine for a solo admin; re-login is cheap

---

## File Storage

- Upload target: `./public/photos/{original-filename}` (same directory already served as static files)
- If a file with the same name exists, reject with 409 — do not silently overwrite
- `src` field stored in DB as `/photos/{filename}` (the URL path, not the filesystem path)
- On `DELETE /api/photos/:slug`: remove the DB record first, then delete the file. If file deletion fails, log but don't error — the record is already gone

---

## Go Dependencies to Add

```
go get github.com/go-chi/chi/v5
go get modernc.org/sqlite          # pure-Go SQLite, no CGO required
go get github.com/golang-jwt/jwt/v5
```

`modernc.org/sqlite` is preferred over `mattn/go-sqlite3` because it requires no C compiler — the existing `go build` in `deploy.sh` continues to work unchanged.

---

## Migration: Seed Existing Photos

On startup, if `SELECT COUNT(*) FROM photos` returns 0, insert the 12 existing photos from a hardcoded Go slice (derived from the current `src/data/photos.js`). This runs once and is idempotent after that.

The 12 existing photo files are already in `./public/photos/` — no file movement needed.

---

## Frontend Changes Required

These are the changes needed in the React app after the API exists. They are **not** part of the backend implementation task — they are the follow-up frontend wiring task.

### 1. `src/data/photos.js`
Keep as-is during backend development. Remove only after the API is live and verified.

### 2. `src/pages/Gallery.jsx`
Replace static import with a fetch call:
```js
// Before
import { photos } from '../data/photos'

// After
const [photos, setPhotos] = useState([])
useEffect(() => {
  fetch('/api/photos').then(r => r.json()).then(setPhotos)
}, [])
```
Add loading and error states.

### 3. `src/pages/PhotoDetail.jsx`
Same — replace static import. Can receive photos via Router state from Gallery (already navigated from there) to avoid a second fetch.

### 4. `src/context/AuthContext.jsx`
Replace hardcoded credential check with a real POST:
```js
// Before
if (email === CREDENTIALS.email && password === CREDENTIALS.password) { ... }

// After
const res = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
  credentials: 'include',
})
return res.ok
```
Auth state can be inferred from `GET /api/photos` response or a `GET /api/auth/me` endpoint (optional — keep it simple, just track login state in sessionStorage as currently done, but backed by the real cookie).

### 5. `src/pages/Admin.jsx`
- On submit (new photo): `POST /api/photos` with `FormData` (file + fields)
- On submit (edit existing): `PUT /api/photos/:slug` with JSON body
- On delete: `DELETE /api/photos/:slug`
- Remove the "Generated Config" section entirely
- Remove the `generateConfig` function

### 6. `vite.config.js` — Dev Proxy
Add proxy so the React dev server forwards API calls to the Go server:
```js
server: {
  proxy: {
    '/api': 'http://localhost:8003'
  }
}
```

---

## Environment Variables

```env
ADMIN_EMAIL=admin@gupa.dev
ADMIN_PASSWORD=<strong-password>
JWT_SECRET=<random-32+-char-string>
DB_PATH=./portfolio.db
PHOTOS_DIR=./public/photos
PORT=:8003
```

For the systemd service, add these to `/etc/systemd/system/portfolio.service` or a `portfolio.env` file referenced by `EnvironmentFile=` in the service unit.

---

## What Does NOT Change

- `deploy.sh` — `npm run build` + `go build` + `systemctl restart` remains unchanged
- `portfolio.service` systemd unit — same binary, same port, same user
- `/public/photos/` — existing files stay in place
- The React routing (`/`, `/photo/:slug`, `/login`, `/admin`) — unchanged
- The visual design of all pages — unchanged

---

## Implementation Order

1. Add Go dependencies (`chi`, `modernc/sqlite`, `jwt`)
2. `internal/db` — schema + CRUD
3. `internal/auth` — JWT sign/verify + middleware
4. `internal/store` — file save/delete
5. `internal/api` — router + handlers
6. `cmd/portfolio-app/main.go` — wire everything, seed on empty DB
7. Test all endpoints manually (curl or httpie)
8. Frontend wiring (separate task — keep `photos.js` until API confirmed working)

---

## Out of Scope (this iteration)

- Image resizing / WebP conversion — photos are portfolio quality, serve as-is
- Multiple admin users — single credential pair in env vars is sufficient
- Drag-to-reorder in the Admin UI — `sort_order` column exists in the schema, feature deferred
- S3 / object storage — local filesystem only for now
- HTTPS / TLS — assumed handled at the reverse proxy / hosting layer already

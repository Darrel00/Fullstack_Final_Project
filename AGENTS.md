## Cursor Cloud specific instructions

### Project overview

Fullstack drawing/gallery application with two components:

- **Frontend** (`Fullstack-Project-vite/`): React 19 + Vite 8 canvas drawing app. This is the main runnable product.
- **Backend** (root `database.js`): PostgreSQL connection pool using `pg`. No HTTP server exists yet — only a DB pool export.

### Running services

| Service | Command | Notes |
|---------|---------|-------|
| Frontend dev server | `cd Fullstack-Project-vite && npm run dev` | Runs on http://localhost:5173 |
| Lint | `cd Fullstack-Project-vite && npm run lint` | Pre-existing lint errors in `App.jsx` (unused vars) — these are in the original code |
| Build | `cd Fullstack-Project-vite && npm run build` | Produces `dist/` |

### PostgreSQL

- PostgreSQL 16 is installed. Start with: `sudo pg_ctlcluster 16 main start`
- Database `gallery` exists with a `drawings` table (3 seed rows).
- Connect: `sudo -u postgres psql -d gallery`
- The root `database.js` uses CommonJS `require()` but root `package.json` has `"type": "module"` — this is a known mismatch in the original code. To test the DB connection, use `node --input-type=commonjs` or construct the Pool directly.

### Caveats

- Root `package.json` has no meaningful `test` script (just echoes an error).
- The `.env` file at root contains a template `DATABASE_URL` — update it to `postgres://postgres:postgres@localhost:5432/gallery` for local development.

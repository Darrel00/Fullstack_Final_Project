# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

This is a fullstack drawing/gallery application (student final project). It has two npm packages:

- **Root** (`/workspace`): Backend scaffolding with `pg` and `dotenv` — only a database connection pool (`database.js`) and SQL schema (`gallery.sql`). No backend server/API exists yet.
- **Frontend** (`/workspace/Fullstack-Project-vite`): React + Vite drawing canvas app. This is the main working product.

### Running the frontend

```sh
cd Fullstack-Project-vite
npm run dev          # Vite dev server on http://localhost:5173
npm run build        # Production build to dist/
npm run lint         # ESLint (note: 6 pre-existing unused-var errors in App.jsx)
npm run preview      # Preview the production build
```

### Notes

- The root `package.json` declares `"type": "module"` but `database.js` uses CommonJS `require()` — this is a known incompatibility in the existing code.
- The `.env` file at root contains a DATABASE_URL placeholder; no PostgreSQL database is needed to run the frontend.
- There are no automated tests configured (`npm test` at root just echoes an error message).
- The frontend has no `package-lock.json` merge conflicts risk — it uses npm with a standard lockfile.
- ESLint is configured only inside `Fullstack-Project-vite/`; the root has no lint setup.

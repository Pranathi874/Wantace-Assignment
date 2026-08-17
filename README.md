# Wantace — Roof Estimator (Local Dev)

This repo is a starter implementation for the Wantace assignment: a configuration-driven estimator (public) and an owner admin API.

Quick start (after cloning):

1. Install dependencies in both packages (use Node 18+):

```bash
cd server
npm install
npx prisma generate
cd ..\client
npm install
```

2. Initialize database and seed config:

```bash
cd server
cp .env.example .env
npx prisma migrate deploy || true
npm run seed
```

3. Start the server and client:

Server:
```bash
cd server
npm run dev
```

Client (in another terminal):
```bash
cd client
npm run dev
```

Admin endpoints:
- `POST /api/auth/login` (body: `{ username, password }`)
- Protected endpoints require Basic auth header: `Authorization: Basic base64(admin:roofing2026!)`

Notes:
- The frontend fetches `/api/config` and renders the form dynamically—there are no hardcoded rates in the client.
- For production use swap SQLite for PostgreSQL and secure admin auth.

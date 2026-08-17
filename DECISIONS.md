# DECISIONS

- **Stack:** Chose Node.js + Express for the API and Vite + React for the client for fast iteration and easy deployment. Used Prisma + SQLite for local persistence and simple schema migrations. SQLite is acceptable for local development and demo; a production deployment should use PostgreSQL.
- **Pricing Formula:** Implemented exactly as requested (documented in code and `server/src/services/calculator.js`). Waste factor, permit fee, and spread percentage are stored in `modifiers` in the `Config` record.
- **Auth:** Simple Basic Auth for admin endpoints to satisfy requirement that Owner Panel is protected. This is intentionally minimal; production should use sessions/hashed tokens.
- **Config Storage:** `Config.questions` stored as JSON in the database; frontend fetches `/api/config` and renders dynamically—no front-end hardcoded rates/questions.
- **Seed Data Handling:** Seed JSON may contain numeric strings; seed script parses them and stores as numbers where appropriate.
- **Out of scope:** Advanced role permissions, audit logging, and deployment scripts to cloud providers.

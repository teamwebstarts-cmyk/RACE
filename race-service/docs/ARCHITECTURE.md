# RACE Service Admin Platform

## Monorepo layout

```
race-service/
├── apps/
│   ├── api-server/     → Express API (implementation: `backend/`)
│   └── admin-web/      → React admin UI (implementation: `race-admin/apps/admin-web/`)
├── packages/
│   ├── shared-types/   → TypeScript contracts
│   └── shared-utils/   → Shared helpers
└── docs/
```

## Database

- **MongoDB:** `mongodb://localhost:27017/race-service`
- All admin data is persisted in MongoDB collections.
- **No mock data** in the frontend — only `npm run seed` for local development.

## API base URL

- Development: `http://localhost:3000/api/v1`
- Admin routes: `/api/v1/admin/*`

## Commands

```bash
# From race-service/
npm install
npm run seed      # Seed MongoDB (dev only)
npm run dev       # API + admin web

# Or separately
npm run dev:api   # port 3000
npm run dev:web   # port 3001
```

## Default super admin (after seed)

- Email: `admin@raceservice.com`
- Password: `Admin@123`

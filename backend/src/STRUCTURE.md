# Backend source layout

All application code lives under `src/`. Entry point: `src/server.ts` → `src/app.ts`.

```
src/
├── server.ts              # Bootstrap: DB, cache, HTTP server
├── app.ts                 # Express app factory & global middleware
│
├── config/                # Environment & infrastructure config
│   ├── env.ts             # Validated env vars (Zod)
│   ├── cache.ts           # Redis / in-memory cache
│   ├── database.ts        # Re-exports database connection helpers
│   └── gcs.ts             # Google Cloud Storage
│
├── database/              # Persistence bootstrap & seeds
│   ├── connection.ts      # Mongoose connect/disconnect
│   ├── indexes.ts         # Index definitions
│   ├── seed.ts            # `npm run seed`
│   └── admin-seed.ts
│
├── middleware/            # Shared Express middleware
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── ...
│
├── routes/                # HTTP route mounting (no business logic)
│   ├── index.ts           # Re-exports v1 router
│   ├── health.routes.ts   # GET /health
│   └── v1/
│       └── index.ts       # All /api/v1/* mounts
│
├── modules/               # Feature domains (routes → controllers → services)
│   ├── auth/
│   ├── users/
│   ├── bookings/
│   ├── vendors/
│   └── admin/
│       ├── routes/        # One file per domain (customers, vendors, …)
│       ├── controllers/   # Request/response handlers
│       ├── services/      # Business logic (in domain subfolders)
│       ├── models/        # Admin-specific Mongoose models
│       ├── middleware/    # Admin auth & RBAC
│       └── shared/        # Admin-only utilities (RBAC, mappers, …)
│
├── shared/                # Cross-cutting code used by multiple modules
│   ├── utils/             # apiResponse, asyncHandler, errors, jwt, logger
│   ├── services/          # storage, event notifications
│   └── types/             # Express type augmentation
│
└── scripts/               # One-off maintenance scripts
```

## Conventions

| Layer | Responsibility |
|-------|----------------|
| **routes** | Wire HTTP method + path → middleware → controller |
| **controllers** | Parse request, call service, send response |
| **services** | Business logic, DB access, validation orchestration |
| **models** | Mongoose schemas |
| **validators** | Zod schemas for request bodies/params |

## API prefixes

| Mount | Audience |
|-------|----------|
| `/health` | Ops / load balancers |
| `/api/v1/*` | Mobile app & customer API |
| `/api/v1/admin/*` | Admin panel |

## Admin module

Split from a single monolithic routes file into:

- `routes/` — domain route files (`customers.routes.ts`, `vendors.routes.ts`, …)
- `controllers/` — thin handlers delegating to services
- Domain `services/` remain in subfolders (`customers/`, `vendors/`, …)

## Adding a new customer API feature

1. Create `modules/<feature>/` with `*.routes.ts`, `*.controller.ts`, `*.service.ts`, `*.model.ts`
2. Register in `routes/v1/index.ts`

## Adding a new admin feature

1. Add `modules/admin/services/<feature>/` or extend existing service
2. Add `modules/admin/controllers/<feature>.controller.ts`
3. Add `modules/admin/routes/<feature>.routes.ts`
4. Register in `modules/admin/routes/index.ts`

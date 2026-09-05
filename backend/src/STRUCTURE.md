# Backend source layout

Layered structure (aligned with `service-backend` conventions). Entry: `src/index.ts` → `src/app.ts`.

```
src/
├── index.ts                 # Bootstrap: DB, cache, HTTP, Socket.IO
├── app.ts                   # Express app factory & global middleware
├── config/                  # Env, Redis cache, GCS
│
├── auth/src/                # JWT re-exports + role constants
├── controller/src/          # HTTP routers + controllers (incl. admin/)
├── database/src/            # Connection, indexes, seeds
├── database/seed-data/      # JSON seed fixtures
├── middleware/src/          # auth.ts, role.ts, adminAuth.ts, …
├── models/src/              # Mongoose schemas (user.ts, booking.ts, …)
├── services/src/            # Business logic (+ admin/, bookings/)
├── storage/src/             # File / GCS storage
├── utils/src/               # Shared helpers (jwt, errors, logger, …)
├── types/                   # Express request augmentation
└── scripts/                 # One-off maintenance scripts
```

## Naming

| Layer | File name |
|-------|-----------|
| `models/src/` | `user.ts` — not `user.model.ts` |
| `middleware/src/` | `auth.ts` — not `auth.middleware.ts` |
| `controller/src/` | `auth.ts` + `authRoutes.ts` |
| `services/src/` | `auth.ts`, `authRepository.ts`, `authValidator.ts` |

No `modules/` folder — code is split by layer, not by feature package.

## Roles

| Kind | Values |
|------|--------|
| App user (`models/src/user.ts`) | `customer` \| `vendor` \| `driver` |
| Admin (`auth/src/roles.ts` + Admin model) | `SUPER_ADMIN`, `OPERATIONS_ADMIN`, … |

## API prefixes

| Mount | Audience |
|-------|----------|
| `/health` | Ops |
| `/api/v1/*` | Mobile / customer / vendor / driver |
| `/api/v1/admin/*` | Admin panel |

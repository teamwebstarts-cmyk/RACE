# RACE Backend API

Production-ready Node.js + Express + TypeScript backend for the RACE roadside assistance platform.

## Stack

- **Runtime:** Node.js 20+
- **Framework:** Express 5 + TypeScript
- **Database:** MongoDB Atlas (Mongoose)
- **Cache:** Redis (OTP + refresh tokens)
- **Auth:** JWT access + refresh tokens
- **Validation:** Zod
- **Security:** Helmet, CORS, rate limiting, compression, Morgan

## Quick Start

```bash
cd backend
cp .env.example .env
# Edit .env with MongoDB Atlas URI, Redis URL, JWT secrets

npm install
npm run seed
npm run dev
```

API: `http://localhost:3000`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm run seed` | Seed services + brand data |
| `npm run lint` | Type check |

## Environment

See `.env.example` for all variables.

**Required:**
- `MONGODB_URI` — MongoDB Atlas connection string
- `REDIS_URL` — Redis connection (local or cloud)
- `JWT_ACCESS_SECRET` — min 32 characters
- `JWT_REFRESH_SECRET` — min 32 characters

## Phase 1 APIs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| GET | `/api/v1/services` | No | Service catalog (19 services) |
| GET | `/api/v1/brand` | No | Branding data |
| POST | `/api/v1/auth/send-otp` | No | Send 6-digit OTP |
| POST | `/api/v1/auth/verify-otp` | No | Verify OTP + JWT login |
| GET | `/api/v1/profile` | Yes | Get customer profile |
| PUT | `/api/v1/profile` | Yes | Update customer profile |
| POST | `/api/v1/vehicles` | Yes | Add vehicle + QR |
| GET | `/api/v1/vehicles` | Yes | List vehicles |
| GET | `/api/v1/vehicles/:id` | Yes | Get vehicle |
| PUT | `/api/v1/vehicles/:id` | Yes | Update vehicle |
| DELETE | `/api/v1/vehicles/:id` | Yes | Delete vehicle |
| GET | `/api/v1/vehicles/:id/verify` | No | Verify vehicle QR |

## Architecture

```
Controller → Service → Repository → Model
                ↓
            Validator (Zod DTO)
```

## Jira Readiness

| Ticket | Status |
|--------|--------|
| RACE-2 OTP Login | API ready |
| RACE-3 Customer Profile | API ready |
| RACE-4 Vehicle Management | API ready |
| RACE-5 Booking System | Not started (Phase 2) |

## Docs

- [API Documentation](./docs/API.md)
- [Postman Collection](./postman/RACE-Backend.postman_collection.json)

## Production Notes

1. Use strong JWT secrets (32+ chars) via secrets manager
2. Enable MongoDB Atlas IP allowlist + TLS
3. Use managed Redis (Upstash / Elasticache)
4. Set `NODE_ENV=production` and restrict `CORS_ORIGIN`
5. Wire SMS provider for OTP (currently logged in dev)
6. GCS config ready in `src/configs/gcs.ts` for future uploads

# RACE Admin Backend — Integration Handoff

Document for merging or connecting the **admin web app** (`race-admin`) with the **admin API**.

---

## Quick reference

| Item | Value |
|------|--------|
| **Backend repo path** | `backend/` |
| **Admin web app** | `race-admin/apps/admin-web` (port 3001) |
| **Base URL (local)** | `http://localhost:3000` |
| **Admin API prefix** | `/api/v1/admin` |
| **Full admin base** | `http://localhost:3000/api/v1/admin` |
| **Health check** | `GET http://localhost:3000/health` |
| **Structure doc** | `backend/src/STRUCTURE.md` |

---

## 1. Admin backend code structure

All admin code lives under `backend/src/modules/admin/`.

```
modules/admin/
├── routes/                    # HTTP routes (one file per domain)
│   ├── index.ts               # Mounts all admin routers
│   ├── customers.routes.ts
│   ├── vendors.routes.ts
│   ├── drivers.routes.ts
│   ├── bookings.routes.ts
│   ├── finance.routes.ts
│   ├── reports.routes.ts
│   ├── settings.routes.ts
│   ├── notifications.routes.ts
│   ├── subscriptions.routes.ts
│   ├── documents.routes.ts
│   └── admins.routes.ts
│
├── controllers/               # Parse request → call service → respond
│   ├── customers.controller.ts
│   ├── vendors.controller.ts
│   ├── drivers.controller.ts
│   └── ...
│
├── services/                  # Business logic (by domain)
│   ├── customers/admin-customers.service.ts
│   ├── vendors/admin-vendors.service.ts
│   ├── drivers/admin-drivers.service.ts
│   ├── bookings/admin-bookings.service.ts
│   └── ...
│
├── auth/                      # Admin login & tokens
│   ├── admin-auth.routes.ts
│   ├── admin-auth.controller.ts
│   ├── admin-auth.service.ts
│   └── admin-auth.validator.ts
│
├── dashboard/                 # Dashboard metrics
├── models/                    # Admin-specific Mongoose models
│   ├── admin.model.ts
│   ├── driver.model.ts
│   ├── transaction.model.ts
│   ├── vendor-vehicle.model.ts
│   └── ...
│
├── middleware/
│   ├── admin-auth.middleware.ts      # Validates admin JWT
│   └── require-permission.middleware.ts  # RBAC check
│
├── shared/
│   ├── rbac.ts                # Roles & permissions
│   ├── admin-jwt.ts             # Admin token issue/verify
│   ├── pagination.ts
│   ├── response-mappers.ts
│   └── activity-logger.ts
│
└── utils/
    └── request.utils.ts       # getAdminActor, sendPdfResponse
```

**Request flow**

```
HTTP request
  → routes/*.routes.ts
  → adminAuthMiddleware (except login/refresh)
  → requireAdminPermission (RBAC)
  → controllers/*.controller.ts
  → services/*.service.ts
  → MongoDB models
```

**Mounted from:** `backend/src/routes/v1/index.ts` → `router.use('/api/v1/admin', adminRoutes)`

---

## 2. Response format

Every admin endpoint returns JSON in this shape.

**Success (2xx)**

```json
{
  "success": true,
  "data": { }
}
```

**Error (4xx / 5xx)**

```json
{
  "success": false,
  "message": "Human-readable error"
}
```

**List endpoints** return paginated data inside `data`:

```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 48,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5
  }
}
```

Common query params for lists: `page`, `pageSize`, `sortBy`, `sortOrder`, plus domain filters (e.g. `status`, `search`, `city`).

---

## 3. Authentication

Admin uses a **separate JWT** from the customer/mobile app. Do not reuse customer tokens on admin routes.

### Login

```http
POST /api/v1/admin/auth/login
Content-Type: application/json

{
  "identifier": "admin@raceservice.com",
  "password": "Admin@123"
}
```

**Response `data`**

```json
{
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@raceservice.com",
    "role": "SUPER_ADMIN",
    "permissions": ["DASHBOARD_VIEW", "CUSTOMERS_VIEW", "..."]
  },
  "tokens": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": "15m"
  }
}
```

### Protected requests

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

### Refresh token

```http
POST /api/v1/admin/auth/refresh-token
{ "refreshToken": "..." }
```

### Other auth routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/admin/auth/logout` | No | Body: `{ "refreshToken" }` |
| GET | `/api/v1/admin/auth/me` | Yes | Current admin profile |
| POST | `/api/v1/admin/auth/forgot-password` | No | `{ "email" }` |
| POST | `/api/v1/admin/auth/reset-password` | No | `{ "token", "password" }` |

### Seed credentials (after `npm run seed`)

| Field | Value |
|-------|--------|
| Email | `admin@raceservice.com` |
| Password | `Admin@123` |
| Role | `SUPER_ADMIN` (all permissions) |

---

## 4. RBAC (roles & permissions)

Permissions are returned on login in `user.permissions`. Routes enforce them server-side.

| Permission | Used for |
|------------|----------|
| `DASHBOARD_VIEW` | Dashboard |
| `CUSTOMERS_VIEW` / `CUSTOMERS_MANAGE` | Customers |
| `VENDORS_VIEW` / `VENDORS_MANAGE` / `VENDORS_APPROVE` | Vendors |
| `DRIVERS_VIEW` / `DRIVERS_MANAGE` / `DRIVERS_APPROVE` | Drivers |
| `BOOKINGS_VIEW` / `BOOKINGS_MANAGE` | Bookings |
| `FINANCE_VIEW` / `FINANCE_MANAGE` | Transactions |
| `REPORTS_VIEW` | Reports |
| `SUBSCRIPTIONS_VIEW` / `SUBSCRIPTIONS_MANAGE` | Subscriptions |
| `SETTINGS_VIEW` / `SETTINGS_MANAGE` | Platform settings |
| `NOTIFICATIONS_VIEW` | Admin notifications |
| `ADMIN_USERS_VIEW` / `ADMIN_USERS_MANAGE` | Admin user CRUD |
| `AUDIT_LOGS_VIEW` | Activity logs |

Roles: `SUPER_ADMIN`, `OPERATIONS_ADMIN`, `FINANCE_ADMIN`, `VERIFICATION_ADMIN`, `SUPPORT_ADMIN`.

Source: `backend/src/modules/admin/shared/rbac.ts`

---

## 5. Complete admin API reference

Base path for all tables below: **`/api/v1/admin`**

Legend: **Auth** = requires `Authorization: Bearer` admin token unless marked Public.

### Dashboard

| Method | Path | Permission |
|--------|------|------------|
| GET | `/dashboard` | `DASHBOARD_VIEW` |

### Customers

| Method | Path | Permission | Notes |
|--------|------|------------|-------|
| GET | `/customers` | `CUSTOMERS_VIEW` | Paginated list |
| GET | `/customers/cities` | `CUSTOMERS_VIEW` | City filter options |
| GET | `/customers/export/csv` | `CUSTOMERS_VIEW` | Export |
| GET | `/customers/:id` | `CUSTOMERS_VIEW` | Detail |
| POST | `/customers` | `CUSTOMERS_MANAGE` | Create |
| PATCH | `/customers/:id` | `CUSTOMERS_MANAGE` | Update |
| PATCH | `/customers/:id/status` | `CUSTOMERS_MANAGE` | `{ "status" }` |
| DELETE | `/customers/:id` | `CUSTOMERS_MANAGE` | Delete |

### Vendors

| Method | Path | Permission | Notes |
|--------|------|------------|-------|
| GET | `/vendors/counts` | `VENDORS_VIEW` | Status counts |
| GET | `/vendors` | `VENDORS_VIEW` | Paginated list |
| GET | `/vendors/:id` | `VENDORS_VIEW` | Detail + docs |
| POST | `/vendors` | `VENDORS_MANAGE` | Create |
| PATCH | `/vendors/:id` | `VENDORS_MANAGE` | Update |
| DELETE | `/vendors/:id` | `VENDORS_MANAGE` | Delete |
| POST | `/vendors/:id/approve` | `VENDORS_APPROVE` | Approve |
| POST | `/vendors/:id/reject` | `VENDORS_APPROVE` | `{ "note" }` optional |
| POST | `/vendors/:id/suspend` | `VENDORS_MANAGE` | `{ "note" }` optional |
| PATCH | `/vendors/:id/documents/:docKey` | `VENDORS_APPROVE` | `{ "status": "VERIFIED" \| "REJECTED" }` |
| POST | `/vendors/:id/assign-drivers` | `VENDORS_MANAGE` | `{ "driverIds": [] }` |
| GET | `/vendors/:id/vehicles` | `VENDORS_VIEW` | Fleet list |
| POST | `/vendors/:id/vehicles` | `VENDORS_MANAGE` | Add vehicle |

**Document keys (vendor):** `business-reg`, `gst`, `pan`, `bank`, `rc`, `insurance`

### Drivers

| Method | Path | Permission | Notes |
|--------|------|------------|-------|
| GET | `/drivers/counts` | `DRIVERS_VIEW` | Status counts |
| GET | `/drivers` | `DRIVERS_VIEW` | Paginated list |
| GET | `/drivers/:id` | `DRIVERS_VIEW` | Detail + docs |
| POST | `/drivers` | `DRIVERS_MANAGE` | Create |
| PATCH | `/drivers/:id` | `DRIVERS_MANAGE` | Update |
| DELETE | `/drivers/:id` | `DRIVERS_MANAGE` | Delete |
| POST | `/drivers/:id/approve` | `DRIVERS_APPROVE` | Approve |
| POST | `/drivers/:id/reject` | `DRIVERS_APPROVE` | Reject |
| PATCH | `/drivers/:id/documents/:documentId` | `DRIVERS_APPROVE` | `{ "status": "VERIFIED" \| "REJECTED" }` |

### Bookings

| Method | Path | Permission | Notes |
|--------|------|------------|-------|
| GET | `/bookings` | `BOOKINGS_VIEW` | Paginated list |
| GET | `/bookings/counts` | `BOOKINGS_VIEW` | Status counts |
| GET | `/bookings/:id` | `BOOKINGS_VIEW` | Detail |
| POST | `/bookings` | `BOOKINGS_MANAGE` | Create |
| PATCH | `/bookings/:id` | `BOOKINGS_MANAGE` | Update |
| DELETE | `/bookings/:id` | `BOOKINGS_MANAGE` | Delete |
| POST | `/bookings/:id/assign-vendor` | `BOOKINGS_MANAGE` | `{ "vendorId" }` |
| POST | `/bookings/:id/assign-driver` | `BOOKINGS_MANAGE` | `{ "driverId" }` |
| POST | `/bookings/:id/status` | `BOOKINGS_MANAGE` | `{ "status", "reason?", "amount?" }` |

### Vendor fleet vehicles (global)

| Method | Path | Permission |
|--------|------|------------|
| PATCH | `/vehicles/:id` | `VENDORS_MANAGE` |
| DELETE | `/vehicles/:id` | `VENDORS_MANAGE` |

### Documents (PDF download / inline view)

Returns `application/pdf`. Requires auth header.

| Method | Path | Permission |
|--------|------|------------|
| GET | `/documents/vendor/:vendorId/:docKey` | `VENDORS_VIEW` |
| GET | `/documents/driver/:driverId/:docKey` | `DRIVERS_VIEW` |

**Driver doc keys:** `dl`, `aadhaar`, `police`, `medical`

### Finance

| Method | Path | Permission |
|--------|------|------------|
| GET | `/transactions` | `FINANCE_VIEW` |
| GET | `/transactions/summary` | `FINANCE_VIEW` |

### Reports

| Method | Path | Permission | Query |
|--------|------|------------|-------|
| GET | `/reports` | `REPORTS_VIEW` | `?dateFrom=&dateTo=` (ISO dates) |

### Settings

| Method | Path | Permission |
|--------|------|------------|
| GET | `/settings` | `SETTINGS_VIEW` |
| PUT | `/settings` | `SETTINGS_MANAGE` |

### Notifications

| Method | Path | Permission |
|--------|------|------------|
| GET | `/notifications` | `NOTIFICATIONS_VIEW` |
| GET | `/notifications/unread-count` | `NOTIFICATIONS_VIEW` |
| PATCH | `/notifications/:id/read` | `NOTIFICATIONS_VIEW` |
| POST | `/notifications/read-all` | `NOTIFICATIONS_VIEW` |

### Subscriptions

| Method | Path | Permission |
|--------|------|------------|
| GET | `/subscriptions/overview` | `SUBSCRIPTIONS_VIEW` |
| GET | `/subscriptions/plans` | `SUBSCRIPTIONS_VIEW` |
| POST | `/subscriptions/plans` | `SUBSCRIPTIONS_MANAGE` |
| PATCH | `/subscriptions/plans/:id` | `SUBSCRIPTIONS_MANAGE` |
| POST | `/subscriptions/assign` | `SUBSCRIPTIONS_MANAGE` |
| POST | `/subscriptions/:id/cancel` | `SUBSCRIPTIONS_MANAGE` |

### Admin users & activity

| Method | Path | Permission |
|--------|------|------------|
| GET | `/admins` | `ADMIN_USERS_VIEW` |
| POST | `/admins` | `ADMIN_USERS_MANAGE` |
| PATCH | `/admins/:id` | `ADMIN_USERS_MANAGE` |
| DELETE | `/admins/:id` | `ADMIN_USERS_MANAGE` |
| GET | `/activity-logs` | `AUDIT_LOGS_VIEW` |

---

## 6. Admin web frontend integration (`race-admin`)

The admin UI already calls this API via `@race/api`.

| Config | Location | Value |
|--------|----------|-------|
| API base URL | `race-admin/apps/admin-web/.env` | `VITE_API_URL=http://localhost:3000/api/v1` |
| HTTP client | `race-admin/packages/api/src/client.ts` | Axios + Bearer token |
| Admin paths | `race-admin/packages/api/src/http.ts` | Prepends `/admin` to each request |

**Example:** `apiGet('/vendors')` → `GET http://localhost:3000/api/v1/admin/vendors`

**Auth storage:** access token in memory + localStorage key `race_admin_token` (see `@race/config`).

**Services map (frontend → backend)**

| Frontend service file | Backend area |
|-------------------------|--------------|
| `auth.service.ts` | `/admin/auth/*` |
| `dashboard.service.ts` | `/admin/dashboard` |
| `customer.service.ts` | `/admin/customers/*` |
| `vendor.service.ts` | `/admin/vendors/*` |
| `driver.service.ts` | `/admin/drivers/*` |
| `booking.service.ts` | `/admin/bookings/*` |
| `finance.service.ts` | `/admin/transactions/*` |
| `reports.service.ts` | `/admin/reports` |
| `settings.service.ts` | `/admin/settings` |
| `notification.service.ts` | `/admin/notifications/*` |
| `subscription.service.ts` | `/admin/subscriptions/*` |
| `profile.service.ts` | `/admin/auth/me` |

---

## 7. Local setup

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env
# Set MONGODB_URI, JWT secrets (min 32 chars)
npm install
npm run seed
npm run dev
# → http://localhost:3000

# Terminal 2 — Admin web
cd race-admin
npm install
# race-admin/apps/admin-web/.env → VITE_API_URL=http://localhost:3000/api/v1
npm run dev --workspace=@race/admin-web
# → http://localhost:3001
```

**Required backend env**

- `MONGODB_URI`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `API_PREFIX=/api/v1`
- `REDIS_URL` (optional in dev — falls back to in-memory cache)

---

## 8. Error codes

| HTTP | Meaning |
|------|---------|
| 400 | Validation / bad request |
| 401 | Missing or invalid admin token |
| 403 | Valid token but missing permission |
| 404 | Resource not found |
| 429 | Rate limited |
| 500 | Server error |

---

## 9. Smoke test (curl / Postman)

```http
POST http://localhost:3000/api/v1/admin/auth/login
Content-Type: application/json

{ "identifier": "admin@raceservice.com", "password": "Admin@123" }
```

Copy `data.tokens.accessToken`, then:

```http
GET http://localhost:3000/api/v1/admin/dashboard
Authorization: Bearer <accessToken>
```

```http
GET http://localhost:3000/api/v1/admin/vendors?page=1&pageSize=10
Authorization: Bearer <accessToken>
```

Postman collection (if present): `backend/postman/RACE-Backend.postman_collection.json`

---

## 10. Notes for merge / review

1. **Single MongoDB** — Admin reads/writes the same database as customer bookings, vendors, etc. Seed data includes sample customers, vendors, drivers, and bookings.

2. **Admin vs customer JWT** — Admin tokens include `tokenType: admin` and a `permissions[]` array. Customer OTP tokens must not be sent to `/api/v1/admin/*`.

3. **CORS** — Backend `CORS_ORIGIN` must allow the admin web origin (e.g. `http://localhost:3001`).

4. **Document PDFs** — Open/download uses authenticated `GET /admin/documents/...` (returns PDF blob, not JSON).

5. **Activity logs** — `GET /activity-logs` is available for audit; the settings UI no longer exposes a separate audit tab, but the API remains.

---

*Last updated: matches `backend/src/modules/admin/routes/` structure.*

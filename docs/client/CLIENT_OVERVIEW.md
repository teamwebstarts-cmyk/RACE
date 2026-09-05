# RACE Service — Client Overview

> **Premium roadside assistance & towing platform**

---

## What is RACE?

RACE is a multi-sided platform that connects **vehicle owners** (customers) who need help on the road with a network of **verified partners** — drivers, towing vendors, and roadside assistance providers. The platform runs on three coordinated applications plus a unified backend, plus an admin dashboard for operations.

## Who Uses RACE?

| Audience | Their App | Platform |
|---|---|---|
| **Vehicle owners** (customers) | `customer application` (mobile, Expo RN) + `customerweb` (React) | iOS, Android, Web |
| **Towing vendors & on-road drivers** (partners) | `mobile application` (mobile, Expo RN) + `partnerweb` (React) | iOS, Android, Web |
| **Operations team** | `race-admin` (React + Turborepo) | Web |
| **Platform engineering** | `backend` (Node + Express + MongoDB) | Server |

All four UIs talk to the same `race-backend` API (REST + JWT auth, MongoDB persistence, Redis cache, real-time Socket.IO, file storage on Google Cloud Storage, OTP via Twilio).

---

## Core Services Offered

The platform covers the full spectrum of in-the-moment vehicle help:

1. **Towing** — long-distance, flatbed, accident-recovery towing
2. **On-demand driver** — when the owner can't drive (fatigue, injury, intoxication)
3. **Roadside assistance** — jump-start, tyre change, fuel delivery, lockout help
4. **Subscription plans** — monthly / annual packages for customer & vendor audiences, across towing / driver / partner categories
5. **SOS / Emergency** — single-tap alert with live location context, configurable per region
6. **Vehicle QR** — every saved vehicle gets a scannable QR for fast identification & SOS trigger

---

## Why RACE?

- **For vehicle owners**: predictable pricing via fare-preview before booking, multiple service categories in one app, subscription savings, real-time tracking, transparent driver profiles.
- **For partners**: a steady pipeline of jobs, in-app navigation, instant earnings, multi-driver vendor fleet management, document compliance handled in-app.
- **For operations**: end-to-end visibility — every booking, every payment, every document, every vendor — with role-based access for finance / reporting / customer support.

---

## What's Already Built (release4Aug2026)

- **Backend API** — 70+ REST endpoints across 41 route files, 27 MongoDB models, 25 service modules, JWT + refresh tokens, RBAC for 4 user roles (customer / driver / vendor / admin), Socket.IO for live tracking, Twilio OTP, Google Cloud Storage for uploads, Mongoose + Redis caching.
- **Customer mobile app** — 24 screens covering onboarding, OTP login, vehicle registration, QR generation, SOS, services catalog, towing booking, driver booking, profile management, subscriptions, support.
- **Customer web** — 25 pages mirroring the mobile flows (auth, services, bookings, profile, SOS, home, locations).
- **Partner mobile app** — 23 screens with multi-step vendor & driver registration, document upload, job acceptance, active-job workflow, account management, verification status.
- **Partner web** — 22 pages mirroring the partner flows (registration wizard, dashboard, jobs, account, subscriptions).
- **Admin web** — 18 pages covering dashboard, customers, vendors, drivers, bookings, finance, reports, notifications, subscriptions, settings, with RBAC and role-scoped permissions.
- **Postman collection** — `RACE-Backend.postman_collection.json` for end-to-end API exercise without writing client code.
- **Seed data** — `npm run seed` populates demo customers, drivers, vendors, bookings, plans.

---

## What's Pending / Not Production-Ready Yet

- `race-service/` — a new monorepo skeleton (apps: `api-server`, `admin-web`; packages: `shared-types`, `shared-utils`). Mostly empty — appears to be an incomplete refactor target. Not used.
- `web application/` — a legacy marketing-style site (React 19, Vite, hello-world). Not deployed.
- Payment integration — backend has `/api/v1/payments/*` stubs (advance/final, advance-verify, final-verify). Real gateway wiring (Razorpay, Stripe) is **not** in this release.
- Tests — backend has the `__tests__` folder but it's empty. Coverage relies on manual Postman exercises.

---

## Quick Local Start (for the client team)

```bash
# 1. Backend (port 3000)
cd backend
cp .env.example .env        # add MONGODB_URI, REDIS_URL, JWT_SECRET, GOOGLE_*, TWILIO_*
npm install
npm run seed                 # populate demo data
npm run dev                  # http://localhost:3000

# 2. Customer web (port 5173)
cd ../customerweb
npm install
npm run dev

# 3. Partner web (port 5174)
cd ../partnerweb
npm install
npm run dev

# 4. Admin web (port 3001)
cd ../race-admin
npm install
npm run dev

# 5. Customer mobile (Expo Go on phone)
cd '../customer application'
npm install
npx expo start

# 6. Partner mobile (Expo Go on phone)
cd '../mobile application'
npm install
npx expo start
```

**Time to first end-to-end happy path**: ~15 minutes if MongoDB + Redis are already running locally. ~45 minutes if you need to install those too.

---

## Repository & Branch Notes

- **Default branch `main` is empty** — `release4Aug2026` is the actual working release.
- 14 remote branches exist; the rest are feature/working branches. New contributors should clone `release4Aug2026` first.
- All apps share a top-level `package.json` (lockfile present) — root `npm install` does **not** install everything; you must `cd` into each app and install there.

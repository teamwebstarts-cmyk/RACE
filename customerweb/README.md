# RACE Customer Web (`customerweb`)

Phase 1 web client for the RACE customer experience. Built with Vite + React + TypeScript so it can later be wrapped with Ionic Capacitor.

## Features (Phase 1)

- OTP login / signup against the existing backend
- Profile + first vehicle onboarding + device PIN step
- 5-tab shell: Home · Services · **SOS** · Bookings · Profile
- Vehicles CRUD, bookings list/detail, SOS alert APIs
- Session restore via `localStorage` (access + refresh tokens)

## Setup

```bash
cd customerweb
cp .env.example .env
npm install
npm run dev
```

App runs at [http://localhost:5174](http://localhost:5174).

### Environment

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL (default `http://localhost:3000`) |
| `VITE_GOOGLE_MAPS_KEY` | Optional, for future maps |

Ensure the backend CORS origin allows `http://localhost:5174` (or set `CORS_ORIGIN=*` in backend `.env` for local dev).

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — typecheck + production build
- `npm run preview` — preview production build

## Deferred to Phase 2

- Full towing / driver / roadside booking wizards
- Live tracking maps + socket updates
- Payment verify flows
- Subscription purchase

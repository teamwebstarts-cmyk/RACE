# Active context

Updated: 2026-09-05

## Current focus

Full local environment running and verified across all 4 surfaces (Backend on :3000, Admin Web on :3001, Customer Metro on :8081, Partner Metro on :8082, local MongoDB container on :27017).

## Branch

`v2.0.1-cleanup` (workspace). Live VM still on frozen `release/13July26`.

## Last done

- Initialized local isolated MongoDB 7 Docker container (`race-mongo` on port 27017).
- Updated `backend/.env` for local development (`NODE_ENV=development`, local Mongo URI, dev OTP enabled).
- Installed all dependencies across `backend/`, `race-admin/`, `customer application/`, and `mobile application/`.
- Seeded local database with default brand, services, platform settings, and demo drivers.
- Resolved TypeScript compilation and typing blockers in `race-admin` (unused readOnly, root tsconfig JSX), `customer application` (AxiosHeaders typing & TabRootHeader navigation), and `mobile application` (AxiosHeaders typing & VendorVehiclesScreen navigation/assign payload).
- Configured Vite dev proxy in `race-admin` and `.devcontainer/devcontainer.json` for Codespace port forwarding.
- Successfully booted and running all 4 services concurrently in background.
- Executed 40-case comprehensive audit script (`src/scripts/comprehensive-audit.ts`) with 100% pass rate.
- Documented complete system findings, collection inventory, and 40 test cases in `docs/SYSTEM_AUDIT_AND_TEST_CASES.md`.

## Next (when the user asks)

Work queue in gap report (honesty/OTP, driver KYC submit, booking types, QR scan, payments). Do not deploy cleanup to the VM until asked.

## Do not

- Push/merge to `main` or old release branches.
- Recreate customerweb / partnerweb.
- Delete unused-looking screens without an import graph.
- Commit `.env` or dump secrets into memory.

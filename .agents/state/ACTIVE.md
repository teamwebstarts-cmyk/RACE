# RACE — Active State

> **Updated:** 2026-10-05
> **Read this first in every new session.**

---

## Current Objective

Customer mobile app polish — Onboarding wizard "Set up your vehicle" step improvements:
1. Smooth upward keyboard scrolling (`~110px`) aligned above keyboard without hiding card fields.
2. Custom vehicle type text input when "Other" is selected in `VehicleTypeChips`.
3. Stacked Make and Model fields (top and bottom, 100% width).
4. In-place transformation of Make & Model dropdowns into custom text inputs when "Other" is picked with "Choose from list" reset.

## Active Branch

`v2.5.2-development` (HEAD) — this is the current work branch.
Previous cleanup branch `v2.0.1-cleanup` was merged/superseded.

## Phase

Customer mobile onboarding UX refinement.

## Completed Work

- [x] Local environment fully running (Backend :3000, Admin :3001, Customer :8081, Partner :8082, MongoDB :27017)
- [x] All 4 surfaces: deps installed, TypeScript clean, Vite proxy configured
- [x] Database seeded; 40-case comprehensive audit 100% pass
- [x] System audit documented (`docs/SYSTEM_AUDIT_AND_TEST_CASES.md`)
- [x] Gap analysis documented (`docs/RACE_REMAINING_WORK_AND_GAPS.md`) — 57→95/100 plan
- [x] Mock testing mode + universal OTP + data seeders + playbook
- [x] Customer app onboarding wizard (Steps 1–3) polished:
  - Gentle card scroll upward when keyboard opens or fields are focused; returns to top on keyboard dismiss.
  - "Other" vehicle type custom input with proper validation.
  - Make and Model stacked vertically (top and bottom, 100% width).
  - In-place custom make & model input fields when "Other" is selected (with "Choose from list" quick reset).
  - Seamless persistence to `useVehicleStore` so vehicles are immediately available across the customer app.
  - Removed top `AuthToast` card-shift banner in favor of clean field-level inline validation: red input border + small red error text directly below the missing field, clearing instantly upon user input.

## Active Work

Context engineering session — see `AGENTS.md` for new architecture.

## Known Blockers

None. Waiting on next product task.

## Known Gaps (Product — Not Started)

- [ ] Real payment gateway (stubs)
- [ ] Real OTP delivery (`SKIP_OTP_AUTH = true` in both apps)
- [ ] Driver KYC document upload to API
- [ ] Booking model fields: `towingMode`, `driverServiceType`
- [ ] Live GPS tracking on mobile (scaffold only)
- [ ] Admin reports query legacy `Booking` not real bookings
- [ ] Automated test framework (`backend/__tests__` empty)

## Important Files

| Purpose | Path |
|---------|------|
| Project structure | `.agents/state/PROJECT_INDEX.md` |
| Decisions index | `.agents/state/DECISIONS_INDEX.md` |
| Gap/remaining work | `docs/RACE_REMAINING_WORK_AND_GAPS.md` |
| Backend layout | `backend/src/STRUCTURE.md` |
| Mock test playbook | `docs/MOCK_TESTING_PLAYBOOK.md` |
| Client overview | `docs/client/CLIENT_OVERVIEW.md` |

## Important Discoveries

- Expo SDK is **57** (^57.0.0), RN 0.86.3 — stale docs/memory may say 54 or 56, ignore them.
- Admin uses **Zustand + TanStack Query**, not Redux (CLIENT_FEATURES.md was wrong).
- `owner: 'race-service'` and MongoDB DB name `race-service` are strings, not the deleted folder.
- VPS is still on `release/13July26` — prod code does NOT match this workspace.
- `SKIP_OTP_AUTH = true` on both Expo login screens — real SMS via Twilio is configured but gated.
- Admin login: env-hardcoded in `backend/src/config/hardcoded-admin.ts`; `Admin` model unused for auth.

## Active Decisions

See `.agents/state/DECISIONS_INDEX.md` for all decisions.

## Next Action (When User Returns)

Choose from gap list above or ask user for priority. Do not deploy to VM until user asks.

## Do Not

- Push to `main`, `release4Aug2026`, `release/13July26`
- Recreate `customerweb/`, `partnerweb/`, `web application/`, `race-service/`
- Delete unused-looking screens without an import graph
- Commit `.env` or secrets

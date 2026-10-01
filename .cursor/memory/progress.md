# Progress

## Done (v2.0.1-cleanup)

- [x] Map the inherited repo and freeze old branches
- [x] Put `release4Aug2026` code onto `main` (merge commit; trees match)
- [x] Delete leftover remote feature branches
- [x] Remove `customerweb/`, `partnerweb/`, `web application/`, `race-service/`
- [x] Agent rules + skills + memory bank
- [x] Unlazy skill vendored for long-task gates
- [x] Complementary skills: brainstorming, systematic-debugging, verification-before-completion, requesting-code-review, security-and-hardening
- [x] GCP IAP SSH to `race-server`; copied gitignored `.env`; log snapshot in `docs/ops/vps-snapshot-2026-09-05.md`
- [x] Client doc vs build gap report: `docs/client/CLIENT_DOC_VS_BUILD.md`
- [x] Local MongoDB container initialized and running on port 27017
- [x] Backend, Admin Web, Customer Mobile, and Partner Mobile dependencies installed and typechecked
- [x] Database seeded with platform data and demo drivers
- [x] All 4 services running concurrently in Codespace (ports 3000, 3001, 8081, 8082)

## Known gaps (product — not started this branch)

- [ ] Real payment gateway (booking payments are stubs)
- [ ] Automated tests (`backend/src/__tests__` empty)
- [ ] Dual booking models (legacy `Booking` vs `TowingBooking`/`DriverBooking`)
- [ ] Customer-app leftover navigators/screens (kept on purpose)
- [ ] `SKIP_OTP_AUTH = true` on both Expo login screens
- [ ] Live map tracking still a scaffold

## Blocked

Nothing. Waiting on the next product task from the user.

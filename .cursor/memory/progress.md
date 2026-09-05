# Progress

## Done (v2.0.1-cleanup)

- [x] Map the inherited repo and freeze old branches
- [x] Put `release4Aug2026` code onto `main` (merge commit; trees match)
- [x] Delete leftover remote feature branches
- [x] Remove `customerweb/`, `partnerweb/`, `web application/`, `race-service/`
- [x] Agent rules + skills + memory bank
- [x] Unlazy skill vendored for long-task gates

## Known gaps (product — not started this branch)

- [ ] Real payment gateway (booking payments are stubs)
- [ ] Automated tests (`backend/src/__tests__` empty)
- [ ] Dual booking models (legacy `Booking` vs `TowingBooking`/`DriverBooking`)
- [ ] Customer-app leftover navigators/screens (kept on purpose)
- [ ] `SKIP_OTP_AUTH = true` on both Expo login screens
- [ ] Live map tracking still a scaffold

## Blocked

Nothing. Waiting on the next product task from the user.

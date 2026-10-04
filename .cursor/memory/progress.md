# Progress

## Done (customer UI polish — 2026-10-04)

- [x] Login + Create account UI on `MobileNumberScreen` from supplied cream/road design (OTP flow unchanged)
- [x] Onboarding leftover bottom gap: content `space-between` + fuller 2-line subtitles on all 4 slides
- [x] Deep UI/UX review logged: `docs/reviews/customer-app-ui-ux-review.md`
- [x] Living polish checklist: `docs/reviews/customer-ui-polish-log.md`
- [x] Splash ↔ Auth soft fade; Onboarding paged slides (forward/back)
- [x] Login/signup path recheck: AccountType + MobileNumber fade + back → Splash
- [x] Fixed Onboarding leave: Auth stack back before popping Splash

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
- [x] Customer mobile app upgraded to Expo SDK 57 for compatibility with latest Expo Go app
- [x] Seamless Codespace-to-phone tunnel configured with ngrok; documented in `docs/CODESPACE_PHONE_CONNECTION_PLAYBOOK.md`
- [x] Universal Mock OTP (`123456`) and full mock testing suite seeded and validated

## Known gaps (product — not started this branch)

- [ ] Real payment gateway (booking payments are stubs)
- [ ] Automated tests (`backend/src/__tests__` empty)
- [ ] Dual booking models (legacy `Booking` vs `TowingBooking`/`DriverBooking`)
- [ ] Customer-app leftover navigators/screens (kept on purpose)
- [ ] `SKIP_OTP_AUTH = true` on both Expo login screens
- [ ] Live map tracking still a scaffold
- [x] Customer auth sign-in/sign-up visual refresh implemented from supplied reference; typecheck + Android export pass

## Blocked

Nothing. Waiting on the next product task from the user.

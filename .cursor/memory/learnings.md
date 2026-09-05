# Learnings (do not repeat)

- **Two booking systems.** Mobile uses `TowingBooking` / `DriverBooking`. Admin seed/list still uses legacy `Booking`. Mixing them looks like “the booking vanished.”
- **Admin login is env-hardcoded** (`backend/src/config/hardcoded-admin.ts`). The `Admin` Mongo model is unused.
- **`SKIP_OTP_AUTH = true`** in customer `MobileNumberScreen` and partner `PartnerLoginScreen`.
- Expo `app.config.js` default API is a GCP IP. Local phones need `EXPO_PUBLIC_API_URL`.
- Expo SDK is **54**, not 56. Nested `AGENTS.md` files that said v56 were wrong.
- `CLIENT_FEATURES.md` said admin uses Redux — it uses Zustand + TanStack Query.
- `owner: 'race-service'` and Mongo DB name `race-service` are strings, not the deleted folder.
- Do not vendor the full Superpowers pack: TDD-always clashes with empty `__tests__`. Complementary skills only.
- Live VM `race-server` is still `release/13July26`, not `v2.0.1-cleanup`. Do not assume prod code matches this workspace.
- VPS `MONGODB_URI` has no db name → Mongoose logs `database: test`.
- VPS `APP_BASE_URL` is a laptop LAN IP, not the public VM.
- Expo apps hit `:3000` (Node public); admin hits `:80` (nginx). Both work today.
- PM2 out log is ~99% internet scanners (404/429). Real bug in file: Twilio trial `send-otp` 502 (21608).

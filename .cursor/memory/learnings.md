# Learnings (do not repeat)

- **Two booking systems.** Mobile uses `TowingBooking` / `DriverBooking`. Admin seed/list still uses legacy `Booking`. Mixing them looks like “the booking vanished.”
- **Admin login is env-hardcoded** (`backend/src/config/hardcoded-admin.ts`). The `Admin` Mongo model is unused.
- **`SKIP_OTP_AUTH = true`** in customer `MobileNumberScreen` and partner `PartnerLoginScreen`.
- Expo `app.config.js` default API is a GCP IP. Local phones need `EXPO_PUBLIC_API_URL`.
- Expo SDK is **54**, not 56. Nested `AGENTS.md` files that said v56 were wrong.
- `CLIENT_FEATURES.md` said admin uses Redux — it uses Zustand + TanStack Query.
- `owner: 'race-service'` and Mongo DB name `race-service` are strings, not the deleted folder.

# RACE Backend API Documentation

Base URL: `http://localhost:3000`

## Response Format

**Success**
```json
{
  "success": true,
  "data": {}
}
```

**Error**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Health

### GET /health

**Response `data`**
```json
{ "status": "ok" }
```

---

## Services

### GET /api/v1/services

Returns mobile-compatible grouped service catalog.

**Response `data`**: Array of categories with nested services (4 categories, 19 services).

### GET /api/v1/services/upcoming

Returns services marked as upcoming / not yet launched. Public, no auth.

**Response `data`**: Array of upcoming service items.

---

## Brand

### GET /api/v1/brand

**Response `data`**: Brand object matching mobile `brand.json` + colors.

---

## Authentication

Unified phone OTP — no `type` field. The backend auto-detects new vs returning users.

### POST /api/v1/auth/send-otp

**Body**
```json
{
  "mobileNumber": "9876543210"
}
```

**Response `data`** — returning verified user (`isVerified: true`, profile complete or incomplete)
```json
{
  "message": "OTP sent",
  "expiresIn": 300,
  "isExistingUser": true,
  "isProfileCompleted": true
}
```

**Response `data`** — brand new user (no record) or abandoned flow (`isVerified: false`)
```json
{
  "message": "OTP sent",
  "expiresIn": 300,
  "isExistingUser": false,
  "isProfileCompleted": false,
  "onboardingRequired": true
}
```

**Behaviour by user state**

| State | DB condition | Action |
|-------|----------------|--------|
| Brand new | No user record | Create `{ mobileNumber, isVerified: false, role: "customer" }`, send OTP |
| Abandoned | User exists, `isVerified: false` | Reuse record, invalidate old OTPs, send fresh OTP |
| Returning | User exists, `isVerified: true` | Send OTP; `isProfileCompleted` reflects profile |

**Rules:** 6-digit OTP, 5 min expiry, max 5 verify attempts per OTP, max 3 resends/hour, stored in MongoDB `otplogs`. Previous pending OTPs for the same number are invalidated when a new OTP is sent.

### POST /api/v1/auth/verify-otp

**Body**
```json
{
  "mobileNumber": "9876543210",
  "otp": "123456"
}
```

**Response `data`**
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresIn": "15m",
  "user": {
    "id": "...",
    "mobileNumber": "+919876543210",
    "role": "customer",
    "isVerified": true,
    "isProfileCompleted": false
  },
  "onboardingRequired": true
}
```

On success: sets `isVerified: true` on the existing user record (never creates a duplicate), issues JWT tokens. `onboardingRequired` is `true` when `isProfileCompleted` is `false`.

### POST /api/v1/auth/refresh-token

**Body**
```json
{
  "refreshToken": "..."
}
```

**Response `data`**: Same shape as verify-otp (`accessToken`, `refreshToken`, `expiresIn`, `user`, `onboardingRequired`). Revokes the old refresh token and issues a new pair.

---

## Fare Estimates (Public)

Preview pricing before creating a booking. No auth required.

### GET /api/v1/fare/towing

**Query:** `pickup_lat`, `pickup_lng`, `dropoff_lat`, `dropoff_lng`, optional `scheduledAt` (ISO datetime for night surcharge)

Uses Google Distance Matrix when `GOOGLE_MAPS_API_KEY` is set; otherwise falls back to flat **₹499**.

**Pricing:** Base **₹299** (first 5 km) + **₹25/km** after 5 km. Night surcharge **+20%** (10 PM–6 AM). Rounded to nearest **₹10**. Advance **30%**, remaining **70%**.

**Response `data`**
```json
{
  "estimatedFare": 420,
  "distanceKm": 10.2,
  "durationMinutes": 18.5,
  "fareBreakdown": {
    "baseFare": 299,
    "distanceKm": 10.2,
    "extraKm": 5.2,
    "extraKmCharge": 130,
    "nightSurcharge": 0,
    "totalFare": 420,
    "advanceAmount": 126,
    "remainingAmount": 294
  }
}
```

### GET /api/v1/fare/driver

**Query:** `packageHours` (2 | 4 | 8 | 12 | 24), `vehicleType` or `vehicleCategory` (`hatchback` | `sedan` | `suv`)

Package-based pricing by vehicle category. Advance **30%**, remaining **70%**.

**Example packages (sedan):** 2 hr / ₹500 · 4 hr / ₹700 · 8 hr / ₹1100 · 12 hr / ₹1600 · 24 hr / ₹2100

**Response `data`**
```json
{
  "estimatedFare": 700,
  "fareBreakdown": {
    "packageHours": 4,
    "includedKm": 40,
    "vehicleCategory": "sedan",
    "packageFare": 700,
    "extraHoursCharge": 0,
    "extraKmCharge": 0,
    "totalFare": 700,
    "advanceAmount": 210,
    "remainingAmount": 490
  }
}
```

---

## Profile (Protected)

Header: `Authorization: Bearer <accessToken>`

### GET /api/v1/profile

Returns the authenticated user's profile.

### PUT /api/v1/profile

Partial update — send only the fields you want to change (at least one required). `email` is optional.

**Body** (all fields optional except at least one must be present)
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "gender": "male",
  "dateOfBirth": "1990-01-15",
  "emergencyContact": {
    "name": "Jane Doe",
    "mobileNumber": "9876543211",
    "relationship": "spouse"
  },
  "address": {
    "line1": "123 Main Street",
    "city": "Bhubaneswar",
    "state": "Odisha",
    "pincode": "751001",
    "country": "India"
  }
}
```

`gender` values: `male` | `female` | `other` | `prefer_not_to_say`

### PUT /api/v1/profile/complete

First-time onboarding — all required profile fields must be sent in one request.

**Body** (`email` and `dateOfBirth` optional)
```json
{
  "fullName": "John Doe",
  "gender": "male",
  "dateOfBirth": "1990-01-15",
  "emergencyContact": {
    "name": "Jane Doe",
    "mobileNumber": "9876543211",
    "relationship": "spouse"
  },
  "address": {
    "line1": "123 Main Street",
    "city": "Bhubaneswar",
    "state": "Odisha",
    "pincode": "751001",
    "country": "India"
  }
}
```

Sets `isProfileCompleted` based on required fields (`fullName`, `gender`, `emergencyContact`, `address`).

---

## Vehicles (Protected)

### POST /api/v1/vehicles

**Body**
```json
{
  "vehicleType": "car",
  "vehicleNumber": "OD02AB1234",
  "brand": "Hyundai",
  "model": "i20",
  "color": "White",
  "fuelType": "petrol"
}
```

`color` is optional. `vehicleSubtype` may be included for finer category mapping.

**Response `data`**: Vehicle object with `qrCode` (data URL).

### GET /api/v1/vehicles

### GET /api/v1/vehicles/:id

### PUT /api/v1/vehicles/:id

### DELETE /api/v1/vehicles/:id

### GET /api/v1/vehicles/:id/verify (Public)

Verifies vehicle exists via QR scan. No auth required.

**Response `data`** — valid vehicle
```json
{
  "valid": true,
  "vehicleId": "...",
  "vehicleNumber": "OD02AB1234",
  "brand": "Hyundai",
  "model": "i20",
  "vehicleType": "car",
  "fuelType": "petrol",
  "color": "White",
  "ownerName": "John Doe",
  "ownerMobile": "+919876543210",
  "emergencyName": "Jane Doe",
  "emergencyMobile": "9876543211",
  "emergencyRelationship": "spouse"
}
```

**Response `data`** — invalid / not found
```json
{
  "valid": false,
  "vehicleId": "..."
}
```

---

## Bookings (Protected)

Header: `Authorization: Bearer <accessToken>`

### GET /api/v1/bookings

Combined list of the customer's **towing** and **driver** bookings (merged, newest first).

Optional query:
- `?status=PENDING` — unified status filter (`PENDING`, `CONFIRMED`, `DRIVER_ASSIGNED`, …)
- `?type=towing` or `?type=driver` — limit to one booking type

**Response `data`**: array of combined booking items with `bookingType`, `serviceLabel`, `estimatedFare`, `fareBreakdown`, `packageHours` / `vehicleCategory` (driver), payment fields, `pickup`/`dropoff`, and `statusHistory`.

Create, detail, tracking, and status updates use the type-specific routes below (`/bookings/towing`, `/bookings/driver`).

---

## Towing Bookings (Protected)

Unified status flow: `PENDING → CONFIRMED → DRIVER_ASSIGNED → DRIVER_EN_ROUTE → DRIVER_ARRIVED → IN_PROGRESS → COMPLETED → RATED` (`CANCELLED` allowed before `COMPLETED`).

### POST /api/v1/bookings/towing

**Body**
```json
{
  "vehicleId": "<vehicleObjectId>",
  "pickup": {
    "address": "Patia Square, Bhubaneswar",
    "latitude": 20.2961,
    "longitude": 85.8245
  },
  "dropoff": {
    "address": "Cuttack Road, Bhubaneswar",
    "latitude": 20.4625,
    "longitude": 85.8830
  },
  "scheduledAt": "2026-07-01T10:00:00.000Z"
}
```

`dropoff` is **required**. `scheduledAt` is optional.

Creates booking with `status: PENDING`. Distance from Google Distance Matrix when configured; fare from real pricing engine (base ₹299 + ₹25/km after 5 km, night +20%). Response includes `fareBreakdown`, `estimatedFare`, `distanceKm`, `advanceAmount` (30%), `remainingAmount` (70%).

### GET /api/v1/bookings/towing

Optional query: `?status=PENDING`

### GET /api/v1/bookings/towing/:id

### PATCH /api/v1/bookings/towing/:id/status

**Body:** `{ "status": "DRIVER_ASSIGNED" }` — must be a valid next status in the unified flow.

### GET /api/v1/bookings/towing/:id/tracking

Returns `status`, `statusHistory`, placeholder `driverLocation` (real-time location TBD).

### GET /api/v1/bookings/towing/:id/cancel-preview

Shows cancellation policy without cancelling the booking.

### POST /api/v1/bookings/towing/:id/cancel

**Body:** `{ "reason?": "Changed my mind" }`

Response includes:
- `refundAmount`
- `refundStatus` (`NOT_APPLICABLE` | `PENDING` | `PROCESSED`)
- `policy` (`canCancel`, `refundPercent`, `cancellationFee`, `reason`)

### POST /api/v1/bookings/towing/:id/rating

**Body:** `{ "rating": 1-5, "review?", "tags?" }` — booking must be `COMPLETED`; transitions to `RATED`.

---

## Driver Bookings (Protected)

Hire a driver to drive the customer's own vehicle. Same unified status flow. **Package-based pricing** by `packageHours` (2/4/8/12/24) and vehicle category (`hatchback` | `sedan` | `suv` from vehicle type/subtype).

### POST /api/v1/bookings/driver

**Body**
```json
{
  "vehicleId": "<vehicleObjectId>",
  "pickup": {
    "address": "Patia Square, Bhubaneswar",
    "latitude": 20.2961,
    "longitude": 85.8245
  },
  "packageHours": 4,
  "scheduledAt": "2026-07-01T18:00:00.000Z"
}
```

`vehicleId` is **required** (must belong to the authenticated customer). `packageHours` or legacy `estimatedDurationHours` is required. Vehicle category for pricing is derived from the registered vehicle. Response includes `fareBreakdown`, `packageHours`, `vehicleCategory`, `includedKm`, `advanceAmount`, `remainingAmount`.

### GET /api/v1/bookings/driver

### GET /api/v1/bookings/driver/:id

### PATCH /api/v1/bookings/driver/:id/status

### GET /api/v1/bookings/driver/:id/tracking

### GET /api/v1/bookings/driver/:id/cancel-preview

Shows cancellation policy without cancelling the booking.

### POST /api/v1/bookings/driver/:id/cancel

**Body:** `{ "reason?": "Found another service" }`

### POST /api/v1/bookings/driver/:id/rating

**Body:** `{ "rating": 1-5, "review?", "tags?" }` — booking must be `COMPLETED`; transitions to `RATED`.

---

## Roadside Bookings

### GET /api/v1/bookings/roadside/availability (Public)

Returns which roadside/towing service slugs are bookable. Only towing services are `available: true` for now.

### POST /api/v1/bookings/roadside (Protected)

**Body**
```json
{
  "serviceType": "towing_instant",
  "vehicleId": "<vehicleObjectId>",
  "pickup": {
    "address": "NH-16, Bhubaneswar",
    "latitude": 20.2961,
    "longitude": 85.8245
  },
  "dropoff": {
    "address": "Cuttack Road, Bhubaneswar",
    "latitude": 20.4625,
    "longitude": 85.8830
  }
}
```

- If `serviceType` is towing (`towing`, `towing_instant`, `towing_scheduled`, `towing_emergency`): `dropoff` is **required**; internally creates a towing booking and returns `{ available: true, redirectedTo: "towing", booking: {...} }`.
- Other types: `{ available: false, message: "... is coming soon", serviceType }` with HTTP 200.

---

## Booking Payments (Protected, STUB)

Simulated payment flow — no real Razorpay/Stripe gateway wired yet. Use verify endpoints to simulate success.

### POST /api/v1/payments/advance

**Body:** `{ "bookingId": "<id>", "bookingType": "towing" | "driver" }`

Creates `PaymentTransaction` with `paymentType: advance`, `status: initiated`.

### POST /api/v1/payments/advance/verify

**Body:** `{ "transactionId": "<id>", "status": "success" | "failed" }`

On `success`: sets booking `advancePaid: true`, `paymentStatus: ADVANCE_PAID`, transitions `PENDING → CONFIRMED`. Nearest available driver is auto-assigned when pickup coordinates exist (`CONFIRMED → DRIVER_ASSIGNED`); if no driver is available, the booking remains `CONFIRMED` for manual admin assignment.

### POST /api/v1/payments/final

**Body:** `{ "bookingId": "<id>", "bookingType": "towing" | "driver" }`

Only when booking `status` is `COMPLETED` and advance already paid.

### POST /api/v1/payments/final/verify

**Body:** `{ "transactionId": "<id>", "status": "success" | "failed" }`

On `success`: sets `remainingPaid: true`, `paymentStatus: FULLY_PAID`.

---

## Booking Cancellation Policy

`PENDING` (no advance paid): free cancellation, no refund transaction.

`CONFIRMED`: 100% advance refund.

`DRIVER_ASSIGNED`: 50% advance refund.

`DRIVER_EN_ROUTE` / `DRIVER_ARRIVED`: no refund.

`IN_PROGRESS` / `COMPLETED` / `RATED` / `CANCELLED`: customer cancellation not allowed.

Refunds are currently stubbed (`PaymentTransaction` with `paymentType: refund`, `status: initiated`).
// TODO: Razorpay refund trigger integration.

---

## Driver APIs (Protected — driver role only)

For the driver mobile app. All routes require JWT auth and `role: driver`.

### PATCH /api/v1/driver/availability

**Body:** `{ "isAvailable": true | false }`

Returns `{ isAvailable, message }`. Returns 400 if setting offline while `activeBookingId` is set.

### PATCH /api/v1/driver/location

**Body:** `{ "latitude": number, "longitude": number }`

Updates `currentLocation` with `updatedAt`. Returns `{ location, updatedAt }`.

### GET /api/v1/driver/bookings

Optional query: `?status=DRIVER_ASSIGNED&type=towing`

Returns merged towing + driver bookings assigned to the driver, sorted by `createdAt` desc.

### GET /api/v1/driver/bookings/active

Returns `{ active: false }` or `{ active: true, booking, bookingType }` from the driver's `activeBookingId`.

### PATCH /api/v1/driver/bookings/:id/status

**Body:** `{ "status": "<next status>", "bookingType": "towing" | "driver" }`

Driver-allowed transitions: `DRIVER_ASSIGNED → DRIVER_EN_ROUTE → DRIVER_ARRIVED → IN_PROGRESS → COMPLETED`. On `COMPLETED`, driver is released (`isAvailable: true`).

---

## Admin APIs (Protected — admin JWT)

### PATCH /api/v1/admin/bookings/:id/assign-driver

**Body:** `{ "driverId": "<userObjectId>", "bookingType": "towing" | "driver" }`

Manually assigns an available driver to a towing or driver service booking. Returns `{ message, booking, driver: { name, phone, currentLocation } }`.

### POST /api/v1/admin/bookings/:id/cancel

**Body:** `{ "bookingType": "towing" | "driver", "reason": "Admin override", "refundAmount?": 300 }`

Admin can cancel any stage (including `IN_PROGRESS`). Refund defaults to full advance paid amount and can be overridden.

### GET /api/v1/admin/drivers/available

Optional query: `?lat=20.29&lng=85.82` — sorts by distance when coordinates provided.

Returns available drivers: `[{ _id, fullName, mobileNumber, isAvailable, currentLocation, activeBookingId, distanceKm? }]`.

---

## Profile Extensions (Protected)

### GET/POST/PUT/DELETE /api/v1/profile/locations

Saved addresses CRUD.

### GET/POST/DELETE /api/v1/profile/payment-methods

Payment methods. POST body: `{ "type": "upi|card|wallet|netbanking", "label", "details" }`

### GET /api/v1/profile/wallet

Returns `{ balance, currency }`.

### GET /api/v1/profile/notifications

Returns `{ notifications[], unreadCount }`.

### PATCH /api/v1/profile/notifications/read-all

### GET/PATCH /api/v1/profile/notifications/preferences

---

## Subscriptions

### GET /api/v1/subscriptions/plans (Public)

### GET/POST /api/v1/subscriptions (Protected)

POST body: `{ "planSlug": "towing_premium_monthly", "billingCycle?": "monthly" | "yearly" }`

### POST /api/v1/subscriptions/cancel (Protected)

---

## SOS / Emergency

### GET /api/v1/sos/config (Public)

Support and emergency phone numbers, trust indicators.

### GET /api/v1/sos/context (Protected)

Owner, vehicle, and emergency contact for SOS screen.

### POST /api/v1/sos/alert (Protected)

Body: `{ "action": "sos|towing|ambulance|share_location|notify_contacts", "vehicleId?", "latitude?", "longitude?", "address?", "contactId?" }`

`contactId` is reserved for future emergency-contact targeting.

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Validation / bad request |
| 401 | Unauthorized |
| 404 | Not found |
| 429 | Rate limit / OTP limit |
| 500 | Server error |


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

---

## Brand

### GET /api/v1/brand

**Response `data`**: Brand object matching mobile `brand.json` + colors.

---

## Authentication

### POST /api/v1/auth/send-otp

**Body**
```json
{ "mobileNumber": "9876543210" }
```

**Response `data`**
```json
{
  "message": "OTP sent successfully",
  "expiresIn": 300
}
```

**Rules:** 6-digit OTP, 5 min expiry, max 3 resends/hour, stored in Redis.

> In development, OTP is logged to the server console.

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

---

## Profile (Protected)

Header: `Authorization: Bearer <accessToken>`

### GET /api/v1/profile

### PUT /api/v1/profile

**Body**
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

**Response `data`**: Vehicle object with `qrCode` (data URL).

### GET /api/v1/vehicles

### GET /api/v1/vehicles/:id

### PUT /api/v1/vehicles/:id

### DELETE /api/v1/vehicles/:id

### GET /api/v1/vehicles/:id/verify (Public)

Verifies vehicle exists via QR scan.

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Validation / bad request |
| 401 | Unauthorized |
| 404 | Not found |
| 429 | Rate limit / OTP limit |
| 500 | Server error |

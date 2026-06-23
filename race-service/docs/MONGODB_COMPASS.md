# MongoDB Compass — RACE Service data storage

All admin panel data is stored in **MongoDB**. There are no mock APIs in production mode.

## Connect in Compass

1. Install [MongoDB Compass](https://www.mongodb.com/products/compass).
2. Start MongoDB locally (default port `27017`).
3. Open Compass → **New Connection**.
4. Paste this connection string:

```
mongodb://localhost:27017
```

5. Click **Connect**.
6. Open the database: **`race-service`**

> The database name comes from `MONGODB_URI` in `backend/.env`:
> `mongodb://localhost:27017/race-service`

## Collections (after seed)

| Collection | Contents |
|------------|----------|
| `admins` | Admin users (login accounts) |
| `users` | Customers and vendor owners |
| `vendors` | Vendor businesses |
| `drivers` | Tow / fleet drivers |
| `bookings` | Service bookings |
| `vehicles` | Customer vehicles |
| `transactions` | Payments, commissions, payouts, refunds |
| `subscriptionplans` | Customer & vendor subscription plans |
| `usersubscriptions` | Active customer subscriptions |
| `adminnotifications` | Admin inbox notifications |
| `activitylogs` | Audit / activity trail |
| `platformsettings` | Platform configuration |
| `services` | Service catalogue (mobile app) |
| `brands` | Brand config |

## Reset and re-seed all data

From the `backend` folder:

```bash
npm run seed
```

This **clears** admin-related collections (customers, vendors, drivers, bookings, transactions, subscriptions, notifications, activity logs, admins) and inserts fresh demo data.

Default super admin after seed:

- **Email:** `admin@raceservice.com`
- **Password:** `Admin@123`

Other seeded admins (same password): `ops@raceservice.com`, `finance@raceservice.com`, `support@raceservice.com`

## Why some pages looked empty before

| Page | Cause |
|------|--------|
| **Subscriptions** | Plans were not seeded — fixed in `admin-seed.ts` |
| **Admin users** | Only 1 admin was seeded — now 4 admins |
| **Notifications** | Only 2 items — now 8 |
| **Activity logs** | Only 1 entry — now 11 |
| **Vendors** | Legacy route conflict returned 403 — fixed |

If the UI still shows no data after seeding:

1. Log out and log in again (clears old mock JWT from browser storage).
2. Confirm `race-admin/apps/admin-web/.env` has `VITE_API_URL=http://localhost:3000/api/v1`.
3. Confirm backend is running: `cd backend && npm run dev`.
4. Refresh Compass — you should see documents in each collection above.

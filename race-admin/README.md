# RACE Service — Admin Panel Monorepo

Enterprise-grade Turborepo for the RACE Service Admin Panel.

## Structure

```
race-admin/
├── apps/admin-web/          # React + Vite admin dashboard
├── packages/
│   ├── api/                 # Axios client + service layer
│   ├── constants/           # Theme, roles, navigation
│   ├── types/               # Shared TypeScript types
│   ├── ui/                  # Shared UI primitives
│   ├── utils/               # Utilities (cn, formatters, permissions)
│   └── config/              # App configuration
├── turbo.json
└── package.json
```

## Tech Stack

- **Framework:** React 19 + Vite + React Router + TypeScript
- **Styling:** Tailwind CSS + shared `@race/ui` components
- **State:** TanStack Query + Zustand
- **Tables:** TanStack Table
- **Charts:** Recharts
- **Auth:** JWT (mock layer ready for backend integration)

## Getting Started

```bash
cd race-admin
npm install
npm run dev
```

Admin panel runs at **http://localhost:3001/dashboard**

> **Windows note:** If `npm run dev` fails with port error, stop any process on port 3001:
> `netstat -ano | findstr :3001` then `taskkill /PID <pid> /F`
> Or run directly: `cd apps/admin-web && npm run dev`

## Completed Modules

- [x] Monorepo scaffold
- [x] Shared packages (types, api, ui, constants, utils, config)
- [x] App layout (Sidebar, Header, RaceLogo)
- [x] Permissions system (Role + Permission enums, guards)
- [x] **Dashboard page** (stats, charts, tables, activity timeline)

## Next Modules (pending)

Customer Management, Vendor Management, Driver Management, Bookings, Financial, Reports, Subscriptions, Admin Users, Settings, Auth screens.

## Environment

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Design System

| Token | Value |
|-------|-------|
| Primary | `#F5A623` |
| Background | `#F4F5F7` |
| Heading | `#1A1A2E` |
| Body | `#555555` |
| Sidebar width | `220px` |

## Logo

Use `components/layout/race-logo.tsx` globally. **Do not redesign the logo.**

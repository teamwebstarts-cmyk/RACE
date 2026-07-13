# RACE Partner Web

Full-width React + Vite + TypeScript partner portal for RACE vendors and drivers.

## Run

```bash
npm install
npm run dev
```

Dev server: **http://localhost:5176**

Requires the RACE backend API on **http://localhost:3000** (`VITE_API_URL` in `.env`).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite on port 5176 |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |

## Stack

- React 19 + React Router
- Zustand + Redux Toolkit (auth persistence)
- TanStack Query
- Axios API client with refresh interceptor
- Lucide icons

# RACE — agent instructions

Roadside assistance: **customer mobile**, **partner mobile**, **admin**, **backend**.

## Frozen vs work

- Work on **`v2.0.1-cleanup` only**.
- Do not touch **`main`**, **`release4Aug2026`**, **`release/13July26`** until the user explicitly promotes after testing.

## Live folders

| Path | Role |
|------|------|
| `customer application/` | Customer Expo app (`com.racecar.customer`) |
| `mobile application/` | Partner Expo app (`com.racecar.partner`) |
| `race-admin/` | Admin web (port 3001) |
| `backend/` | Express API (port 3000) |
| `deploy/` | GCP VM scripts for backend + admin |

Root `npm install` does not install the apps. `cd` into each folder.

## Method

Plan and read existing code before implementing. Research current docs for the versions in `package.json`. Reuse what is already here. Do not add parallel modules. Do not delete suspected-dead screens without a proven unused import graph — that breaks runtime.

Details: `.cursor/rules/`, `.cursor/skills/race-project-map/`, `docs/client/`.

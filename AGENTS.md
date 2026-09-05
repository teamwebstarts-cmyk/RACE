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

1. Read `.cursor/memory/activeContext.md` and `agents-lock.md`. Claim a surface before editing.
2. Plan and read existing code. Research version-matched docs (`package.json`).
3. Reuse what exists. Do not add parallel modules. Do not delete leftover screens without an import graph.
4. Update memory when done; clear the lock.

Substantial / multi-part work: use the **unlazy** skill (`.cursor/skills/unlazy/`) — write `GATES.md` first, do not report done while gates are unmet.

## Skills (when to load)

| Skill | Use when |
|-------|----------|
| `unlazy` | Long / multi-part task — gates before “done” |
| `brainstorming` | New feature or unclear product change (not tiny bugfixes) |
| `systematic-debugging` | Bug or unexpected behavior — root cause before a fix |
| `verification-before-completion` | About to claim it works |
| `requesting-code-review` | Major change, or user asked for a review |
| `security-and-hardening` | Auth, OTP, JWT, PII, payments, untrusted input |
| `race-task-workflow` | Any non-trivial RACE implementation |
| `race-project-map` / `race-memory-bank` | Which folder, what is frozen, what we already learned |

Sources: `.cursor/skills/SOURCES.md`. Do not dump more marketplaces in unless asked.

Details: `.cursor/rules/`, `.cursor/skills/`, `.cursor/memory/`, `docs/client/`.

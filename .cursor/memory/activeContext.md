# Active context

Updated: 2026-09-05

## Current focus

Agent memory bank + parallel-agent lock added under `.cursor/memory/`. Product work after v2 folder cleanup has not started yet.

## Branch

`v2.0.1-cleanup` @ `b1050e8` (pushed). `main` frozen.

## Last done

- Added git-tracked agent memory (`.cursor/memory/`).
- Installed **Unlazy** as a project skill (`.cursor/skills/unlazy/`) for gate-based completion on long tasks.
- Added complementary skills (not full marketplaces): `brainstorming`, `systematic-debugging`, `verification-before-completion`, `requesting-code-review`, `security-and-hardening`. Catalog in `AGENTS.md` + `.cursor/skills/SOURCES.md`.

## Next (when the user asks)

Product work on the two Expo apps + admin + backend. Read `agents-lock.md` before touching a surface.

## Do not

- Push/merge to `main` or old release branches.
- Recreate customerweb / partnerweb.
- Delete unused-looking screens without an import graph.

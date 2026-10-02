# Active context

Updated: 2026-10-02

## Current focus

Context engineering infrastructure: `.agents/` layered context architecture added this session.
New preferred state file: `.agents/state/ACTIVE.md` (more detail there).

## Branch

`v2.5.2-development` (current HEAD) — replaces old `v2.0.1-cleanup` references in older docs.

## Last done

- Added `.agents/` layered context architecture (AGENTS.md, state/, decisions/, rules/, skills/, scripts/).
- Updated root `AGENTS.md` to be compact and layered (~2k tokens).
- Created 9 ADR files, 7 rules, 6 focused skills, 5 maintenance scripts.
- Context index: run `.agents/scripts/context-index.sh` to generate.

## Next (when the user asks)

Product work queue from gap report (`docs/RACE_REMAINING_WORK_AND_GAPS.md`):
OTP enable, driver KYC, booking model fields, QR scan, payments.

## Do not

- Push/merge to `main` or old release branches.
- Recreate `customerweb/`, `partnerweb/`.
- Delete unused-looking screens without an import graph.
- Commit `.env` or dump secrets into memory.

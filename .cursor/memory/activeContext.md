# Active context

Updated: 2026-09-05

## Current focus

VPS connected (`race-server` / `townow-j5hir`). Production `.env` copied into gitignored app paths. Log review written to `docs/ops/vps-snapshot-2026-09-05.md`. Product fixes not started.

## Branch

`v2.0.1-cleanup` (workspace). **Live VM still on frozen `release/13July26` @ `1cb88eb`.**

## Last done

- IAP SSH to `race-server` (`34.93.103.86`).
- Copied four VPS `.env` files into matching workspace folders (gitignored).
- Reviewed PM2 + nginx logs; documented real bugs vs scanner noise.

## Next (when the user asks)

Fix education/local env using VPS env + snapshot findings (Mongo `test` db, APP_BASE_URL LAN leftover, Twilio trial 502, maps placeholder on customer app). Do not deploy cleanup to the VM until asked.

## Do not

- Push/merge to `main` or old release branches.
- Recreate customerweb / partnerweb.
- Delete unused-looking screens without an import graph.
- Commit `.env` or dump secrets into memory.

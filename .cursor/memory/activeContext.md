# Active context

Updated: 2026-10-07

## Current focus

**Cloud production path is documented** in `docs/ops/CLOUD_PRODUCTION_RUNBOOK.md` (Render API, Vercel admin, Expo EAS customer APK). Use that doc before any deploy/build — no re-discovery each session.

## Branch

`v2.5.2-development`

## Last done

- 2026-10-07: Customer EAS `@webstarts/race-service` (`277981d5-…`), owner/slug aligned, SDK 57 + worklets, production APK build started via `eas build`. Runbook + memory updated.

## Quick refs

| Surface | URL / ID |
|---------|-----------|
| API | `https://race-api-w361.onrender.com` |
| Admin | `https://race-admin-six.vercel.app` |
| EAS | `@webstarts/race-service`, projectId `277981d5-5046-4288-8c91-672aab158419` |

## Do not

- Push/merge to `main` or old release branches without user ask.
- Re-link old EAS project `d2ee249a-…` or set `owner: race-service` on customer app (use `webstarts`).
- Commit `.env` or secrets into memory/docs.

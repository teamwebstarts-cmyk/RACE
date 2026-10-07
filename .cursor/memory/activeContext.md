# Active context

Updated: 2026-10-07

## Current focus

**Customer app UI/UX only.** Redesign one screen at a time when the user names it. Design source is `.agents/uiux/` (`SKILL.md`, `MOBILE_APP_PATTERNS.md`, `AGENT_QUICK_RULES.md`). Preserve behavior, APIs, and navigation unless the user asks otherwise.

## Branch

`v2.5.2-development`

## Last done

- 2026-10-07: Service nav header is shared (`ServiceNavHeader`) across Services, Towing, Driver, Roadside, and More. Detail heroes use the same artwork card as the Services list (`ServiceCategoryArtCard`).

## Last done (user-confirmed design)

Already redesigned and treated as the visual baseline:

- Onboarding
- Sign up
- Sign in
- Home
- Service pages (Services, Towing, Driver, Roadside, More, location picker)

Do not restyle those unless the user asks.

## Next

Wait for the next named customer screen. Before coding: screen goal, one primary CTA, keep/remove, states, then implement against existing theme tokens.

## Design tokens (customer)

Primary `#F5A800`, page `#FFFFFF` / `#F7F7F5`, text `#1A1A1A` / `#666666`, success `#22C55E`, error `#EF4444`. Spacing `screenPadding 20`, button height `54`, card radius `20`. Tabs: Home, Bookings, SOS (Call), Services, Profile.

## Quick refs

| Surface | URL / ID |
|---------|-----------|
| API | `https://race-api-w361.onrender.com` |
| Admin | `https://race-admin-six.vercel.app` |
| EAS | `@webstarts/race-service`, projectId `277981d5-5046-4288-8c91-672aab158419` |

## Do not

- Touch partner, admin, or backend for this design pass.
- Push/merge to `main` or old release branches.
- Invent backend fields or fake capabilities for visual reasons.
- Commit `.env` or secrets.

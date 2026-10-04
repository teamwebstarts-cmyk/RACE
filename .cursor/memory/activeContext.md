# Active context

Updated: 2026-10-04

## Current focus

Customer splash: highway photo fills the real layout (no bottom seam); logo uses a transparent PNG; sky fog wash behind copy instead of a white halo.

## Branch

`v2.5.2-development` (tracks origin)

## Last done

- Replaced MobileNumber login/signup UI with the supplied layout (RACE SERVICE header, SVG road scene, phone field, Continue / Create account).
- Auth logic unchanged: OTP send/verify, `SKIP_OTP_AUTH = true`, signup path toggle.
- Illustrations live in `components/auth/AuthSceneIllustrations.tsx`.

## Next (when the user asks)

Reload: onboarding → create account, then Sign in → welcome back. Polish spacing if needed.

## Do not

- Push/merge to `main` or old release branches.
- Recreate `customerweb/`, `partnerweb/`.
- Delete unused-looking screens without an import graph.
- Commit `.env` or dump secrets into memory.
- Touch splash while another pass is using `Golden Sunrise`.

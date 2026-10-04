# Active context

Updated: 2026-10-04

## Current focus

Customer login + signup aligned: SVG on top, heading below, shared field/header.

## Branch

`v2.5.2-development` (tracks origin)

## Last done

- Create account uses the new tow-truck SVG on top; heading sits under it like Welcome back.
- Header is one line: RACE SERVICE.
- Inputs slightly smaller and the same on both screens; keyboard shrinks the hero.
- Title/button type is heavier; descenders (g) no longer clipped by tight line-height.

## Next (when the user asks)

Reload both auth modes and type in the field with the keyboard open.

## Do not

- Push/merge to `main` or old release branches.
- Recreate `customerweb/`, `partnerweb/`.
- Delete unused-looking screens without an import graph.
- Commit `.env` or dump secrets into memory.

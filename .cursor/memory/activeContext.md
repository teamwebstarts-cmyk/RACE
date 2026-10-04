# Active context

Updated: 2026-10-04

## Current focus

Auth screens: descenders (`g`/`y`) not clipped; SVG fades into page on top + right.

## Branch

`v2.5.2-development` (tracks origin)

## Last done

- Removed tight `height === lineHeight` + `includeFontPadding: false` on titles, paragraphs, hint, terms, switcher.
- Both heroes overlay a page-color fade on the top and right so the illustration blends into `#FFFEFC`.

## Next (when the user asks)

Reload both modes and check `moving` / `get` / `agree` tails and SVG edges.

## Do not

- Push/merge to `main` or old release branches.
- Recreate `customerweb/`, `partnerweb/`.
- Delete unused-looking screens without an import graph.
- Commit `.env` or dump secrets into memory.

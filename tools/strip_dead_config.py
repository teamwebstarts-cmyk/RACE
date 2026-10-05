#!/usr/bin/env python
"""Strip the dead WordPress plumbing left by the capture.

After the copy and imagery passes, 24 references to the upstream demo site remain
per page. None of them affect rendering — they are absolute URLs to a WordPress
install that is not part of this clone:

  rest_url / restapi / siteurl      REST API root (unused offline)
  ajaxurl                          admin-ajax.php (no PHP here)
  uploadUrl                        uploads directory (no PHP here)
  speculationrules href_matches     prefetch rules pointing at /rapidtow/*
  rest_config / ekit_config nonce   one-time nonces, meaningless off-site
  post.title / featuredImage        demo page metadata

Leaving them means a console full of failed requests and a hard-coded reference
to another company's domain in the shipped files. This removes only the dead
config and metadata. It deliberately does NOT touch script/style src attributes,
because those were already repointed to local js/ and css/ paths.
"""
from __future__ import annotations

import pathlib
import re
import sys

BASE = pathlib.Path(__file__).parent
PAGES = ["home.html", "service.html", "contact.html", "pricing.html"]

DEMO = "demo.lubnalooom.com"

# Inline config blocks that exist purely to talk to the upstream WordPress.
BLOCK_PATTERNS = [
    # rest_config / rest_api_conf assignments
    re.compile(r"var\s+(?:rest_config|rest_api_conf)\s*=\s*\{.*?\};\s*", re.S),
    re.compile(r"var\s+wsluFrontObj\s*=\s*\{.*?\};\s*", re.S),
    re.compile(r"var\s+ekit_config\s*=\s*\{.*?\};\s*", re.S),
    # The prefetch rules script: useless without a server, and it references
    # the upstream path prefix.
    re.compile(r'<script[^>]*type="speculationrules"[^>]*>.*?</script>\s*', re.S | re.I),
]

# wp-emoji settings point at the demo's plugin asset.
EMOJI = re.compile(r"window\._wpemojiSettings\s*=\s*\{.*?\};\s*", re.S)


def clean(html: str) -> tuple[str, int]:
    removed = 0

    for pattern in BLOCK_PATTERNS + [EMOJI]:
        html, n = pattern.subn("", html)
        removed += n

    # Any residual absolute URL to the demo domain, outside of src/href on tags
    # that we already repointed. Strip only the JSON/config occurrences.
    html, n = re.subn(
        r'"(?:rest_url|siteurl|root|restapi|ajaxurl|uploadUrl|assets)":'
        r'"https:\\?/\\?/' + re.escape(DEMO) + r'[^"]*"',
        '""',
        html,
    )
    removed += n

    return html, removed


def main() -> int:
    for page in PAGES:
        path = BASE / page
        if not path.exists():
            print(f"{page}: missing")
            continue
        html = path.read_text(encoding="utf-8")
        new, n = clean(html)
        if new != html:
            path.write_text(new, encoding="utf-8")
        before = html.lower().count(DEMO)
        after = new.lower().count(DEMO)
        print(f"{page}: removed {n} config block(s); demo refs {before} -> {after}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
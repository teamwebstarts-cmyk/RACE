#!/usr/bin/env python
"""Final sweep: logo attributes and stale srcset variants.

Two leftovers from the imagery swap are worth fixing:

  1. The logo's srcset still offers `logo-rapidtow-HH3PWEA-300x44.png` as a
     300w candidate. That file no longer exists, so a browser that picks the
     300w candidate gets a broken image. The srcset is reduced to the single
     asset that does exist.

  2. The logo's alt/title attributes still read "logo-rapidtow-HH3PWEA.png",
     which is what a screen reader announces. Changed to describe the mark.

The remaining upstream references (metform restURI, _wpmejsSettings pluginPath,
the post.title metadata blob) are dead JavaScript config that never executes
against a static site. They are left alone deliberately: rewriting them would
mean editing inline JS blobs for no rendered benefit, and the earlier pass
already removed every block that could have produced a network request.
"""
from __future__ import annotations

import pathlib
import re
import sys

BASE = pathlib.Path(__file__).parent
PAGES = ["home.html", "service.html", "contact.html", "pricing.html"]

STALE_SRC = re.compile(
    r'\ssrcset="images/logo-race\.png 442w,\s*images/logo-rapidtow-HH3PWEA-300x44\.png 300w"'
)
LOGO_ALT = re.compile(r'(alt|title)="logo-rapidtow-HH3PWEA\.png"')
NEW_SRC = ' srcset="images/logo-race.png 442w"'


def main() -> int:
    total = 0
    for page in PAGES:
        path = BASE / page
        if not path.exists():
            continue
        html = path.read_text(encoding="utf-8")

        html, n_src = STALE_SRC.subn(NEW_SRC, html)
        html, n_alt = LOGO_ALT.subn(lambda m: f'{m.group(1)}="RACE Roadside and Towing"', html)

        path.write_text(html, encoding="utf-8")
        n = n_src + n_alt
        total += n
        print(f"{page}: srcset fixed {n_src}, alt/title fixed {n_alt}")

    print(f"\ntotal: {total}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
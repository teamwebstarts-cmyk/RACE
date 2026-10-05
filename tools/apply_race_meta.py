#!/usr/bin/env python
"""Second RACE pass: head metadata, SEO fields and the emergency phone strip.

The first pass only touched element text nodes. Three things were left:

  1. `<title>`, meta description, OG and Twitter tags still say RapidTow and
     target a US audience. These are the highest-leverage SEO strings on the
     page, so they are rewritten to the researched Bhubaneswar pattern.
  2. The emergency icon-list item is one string, "1-800-555-0100  (Available
     24/7)", which the per-slot map did not cover because the copy sits in a
     different container.
  3. RSS/link titles carry the brand name.

Logo image filenames still contain "rapidtow" — those are asset paths, not copy,
and renaming them would break the image references. The logo artwork itself is a
design asset and is left untouched per the text-only constraint.
"""
from __future__ import annotations

import pathlib
import re
import sys

BASE = pathlib.Path(__file__).parent
PAGES = ["home.html", "service.html", "contact.html", "pricing.html"]

# SEO strings from the researched pattern: [service] + [geo] + [SLA] + [brand].
META = {
    "home.html": {
        "title": "24/7 Car Towing in Bhubaneswar from Rs 499 | RACE Service",
        "desc": (
            "24x7 car towing and roadside assistance in Bhubaneswar. Flatbed and "
            "wheel-lift from Rs 499, 25-minute average arrival, upfront pricing. "
            "Call +91 8249475731."
        ),
    },
    "service.html": {
        "title": "Towing, Drivers & Roadside Assistance | RACE Bhubaneswar",
        "desc": (
            "Instant towing from Rs 499, accident recovery from Rs 699, verified "
            "chauffeurs and roadside help from Rs 149. Covering Bhubaneswar and "
            "NH-16. Call +91 8249475731."
        ),
    },
    "contact.html": {
        "title": "Contact RACE Service | 24/7 Roadside Help Bhubaneswar",
        "desc": (
            "Talk to RACE Service for towing, roadside assistance or a verified "
            "driver in Bhubaneswar. 24x7 helpline +91 8249475731, based in "
            "Bhubaneswar, Odisha."
        ),
    },
    "pricing.html": {
        "title": "RACE Membership Plans from Rs 299 | Roadside Bhubaneswar",
        "desc": (
            "Roadside membership from Rs 299 a month. Towing quotas, priority "
            "response under 15 minutes and full RSA cover across Bhubaneswar and "
            "Odisha highways. Call +91 8249475731."
        ),
    },
}

PHONE_OLD = "1-800-555-0100  (Available 24/7)"
PHONE_NEW = "+91 82494 75731  (Available 24/7)"


def set_meta(html: str, tag: str, attr: str, value: str) -> tuple[str, int]:
    """Replace the content of <meta name|property=... content=...>."""
    pattern = re.compile(
        r"(<meta\b[^>]*\b" + re.escape(attr) + r"=[\"']" + re.escape(tag) + r"[\"'][^>]*\bcontent=)[\"'][^\"']*([\"'])",
        re.I,
    )
    return pattern.subn(lambda m: m.group(1) + '"' + value + '"' + m.group(2), html)


def main() -> int:
    problems = 0

    for page in PAGES:
        path = BASE / page
        if not path.exists():
            print(f"{page}: MISSING")
            problems += 1
            continue
        html = path.read_text(encoding="utf-8")
        meta = META[page]
        hits = {}

        # <title>
        html, n = re.subn(
            r"(<title>).*?(</title>)",
            lambda m: m.group(1) + meta["title"] + m.group(2),
            html,
            flags=re.S | re.I,
        )
        hits["title"] = n

        # description / og:description / twitter:description
        for attr, tag in (
            ("name", "description"),
            ("property", "og:description"),
            ("name", "twitter:description"),
            ("property", "og:title"),
            ("name", "twitter:title"),
        ):
            html, n = set_meta(html, tag, attr, meta["title"] if "title" in tag else meta["desc"])
            hits[f"{attr}:{tag}"] = n

        # og:url stays a placeholder on the clone; only rewrite the domain-bearing
        # site name in RSS titles, not the hrefs (those are relative by design).
        # The capture stores the guillemet as the entity &raquo;, not the
        # character, so match both forms.
        html, n = re.subn(
            r'(title=")RapidTow(\s*(?:»|&raquo;)[^"]*")',
            lambda m: m.group(1) + "RACE Service" + m.group(2),
            html,
        )
        hits["rss_titles"] = n

        # The emergency phone strip.
        html, n = re.subn(
            r"(?<=>)\s*" + re.escape(PHONE_OLD) + r"\s*(?=<)",
            PHONE_NEW,
            html,
        )
        hits["phone_strip"] = n

        path.write_text(html, encoding="utf-8")
        total = sum(hits.values())
        print(f"{page}: {hits}")
        if hits["title"] == 0 or hits["phone_strip"] == 0:
            problems += 1

    print(f"\nRESULT: {'PASS' if not problems else f'{problems} PAGE(S) NEED ATTENTION'}")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
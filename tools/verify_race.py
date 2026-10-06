#!/usr/bin/env python
"""Verify the RACE copy pass: placeholders purged, new content present.

Two checks:
  1. No RapidTow placeholder survives anywhere (phone, email, US cities,
     company name, dollar prices).
  2. The RACE essentials are actually on the page (phone, prices, localities).

Also re-runs the link/asset audit so a text edit cannot have broken a reference.
"""
import json
import pathlib
import re
import subprocess
import sys

# The scripts were moved into tools/ during the repo tidy-up, but they still
# address the site as a sibling of this directory. Resolve the site root by
# walking up until the four page files are found, so the scripts keep working
# from either location.
_HERE = pathlib.Path(__file__).resolve().parent
BASE = next(
    (p for p in (_HERE, _HERE.parent)
     if all((p / f"{n}.html").exists() for n in ("home", "service", "contact", "pricing"))),
    _HERE.parent,
)
PAGES = ["home.html", "service.html", "contact.html", "pricing.html"]

# Must be gone from *rendered text*. The brand also survives inside inline JS
# (rest_url, speculation rules) and inside logo image filenames — those are
# asset paths and WordPress plumbing, not copy, and renaming them would break
# every image reference. verify_race.py strips scripts and tags before checking.
FORBIDDEN = [
    "1-800-555-0100",
    "help@rapidtow",
    "Copyright © 2025",
    "456 Oak Avenue",
    "Springfield, IL",
    "Dallas, TX",
    "Las Vegas, NV",
    "Central city",
    "Lake view",
    "Highway 45",
    "Industrial zone B",
    "West hills",
    "River bend",
    "Downtown Garage",
    "East Side Lot",
    "$59",
    "$129",
    "$999",
    "Book Service",
    "Get Service",
    "Tire change and inflation",
    "Flatbed towing",
    "Lockout service",
    "Emergency towing",
    "Vehicle recovery",
    "1. 24/7 availability",
    "2. Fast response time",
    "3. Certified & trained team",
    "4. Transparent pricing",
    "5. Modern equipment",
    # The brand must not survive as *visible* text. Checked post-strip below.
    "RapidTow",
]

# Must be present somewhere across the site.
REQUIRED = {
    "phone_compact": "+91 82494 75731",
    "phone_spaced": "+91 8249475731",
    "email": "support@raceservice.in",
    "company": "Saiprahallad Services",
    "brand": "RACE Service",
    "price_towing": "Rs 499",
    "price_battery": "Rs 299",
    "price_membership": "Rs 599",
    "locality": "Mancheswar",
    "highway": "NH-16",
    "copyright": "Copyright © 2026 RACE Service",
}


def text_of(html: str) -> str:
    """Rendered text only: drop <script>/<style> bodies and all tags/attrs."""
    body = re.sub(r"<script\b.*?</script>", " ", html, flags=re.S | re.I)
    body = re.sub(r"<style\b.*?</style>", " ", body, flags=re.S | re.I)
    return re.sub(r"<[^>]+>", " ", body)


def main() -> int:
    blobs = {p: (BASE / p).read_text(encoding="utf-8") for p in PAGES}
    rendered = {p: text_of(h) for p, h in blobs.items()}
    everything = " ".join(rendered.values())

    print("=== placeholders that must be gone ===")
    leaks = []
    for bad in FORBIDDEN:
        hits = [p for p in PAGES if bad in rendered[p]]
        if hits:
            leaks.append((bad, hits))
            print(f"  LEAK  {bad!r} -> {hits}")
    if not leaks:
        print("  clean — none of the RapidTow strings survive")

    print("\n=== RACE content that must be present ===")
    missing = []
    for label, needle in REQUIRED.items():
        found = [p for p in PAGES if needle in rendered[p]]
        status = "ok  " if found else "MISS"
        if not found:
            missing.append(label)
        print(f"  {status} {label:16s} {needle:32s} {found if found else ''}")

    # Link/asset integrity after the text edit.
    print("\n=== link + asset audit ===")
    r = subprocess.run(
        [sys.executable, str(BASE / "tools" / "audit.py")],
        capture_output=True, text=True,
    )
    if r.returncode != 0 and not r.stdout.strip():
        r = subprocess.run(
            [sys.executable, str(pathlib.Path(__file__).parent / "audit.py")],
            capture_output=True, text=True,
        )
    print(r.stdout.strip())

    bad = len(leaks) + len(missing)
    print(f"\nRESULT: {'PASS' if not bad else f'{bad} PROBLEM(S)'}")
    return 1 if bad else 0


if __name__ == "__main__":
    raise SystemExit(main())
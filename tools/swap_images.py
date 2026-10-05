#!/usr/bin/env python
"""Swap the clone's RapidTow imagery for the generated RACE set.

Text-only was the earlier constraint; this is the deliberate imagery pass. Only
the filenames inside <img src> and <img srcset> change — every CSS rule, class,
element order and inline width/height attribute is left exactly as captured, so
the layout cannot move. Each new file was normalised to the pixel dimensions of
the slot it replaces (see normalise_images.py), and the slot's original width and
height attributes are reused verbatim.

srcset variants are rewritten alongside the main src so the browser cannot fall
back to a stale RapidTow filename at a different viewport.
"""
from __future__ import annotations

import pathlib
import re
import sys

BASE = pathlib.Path(__file__).parent
PAGES = ["home.html", "service.html", "contact.html", "pricing.html"]

# old clone filename -> generated filename
MAP = {
    "car-hero-UCBZSH4-2-e1750942959723.png": "hero-tow-truck.png",
    "insurance-officers-hold-a-red-emergency-triangle-s-HH7LFPM.jpg": "about-team.png",
    "broken-car-red-sign-man-is-with-his-automobile-out-5K3XG3H.jpg": "recovery-accident.png",
    "a-man-driving-a-car-opens-the-window-and-smiles-GLKLA5C.jpg": "chauffeur-driver.png",
    "tow-truck-operator-fixing-the-car-on-platform-VN29XU9-1.jpg": "service-mechanic.png",
    "tow-truck-operator-fixing-the-car-on-platform-BMZTK74.jpg": "contact-dispatch.png",
    "tow-truck-operator-fixing-the-car-on-platform-VN29XU9.jpg": "contact-coverage.png",
    "car-evacuation-due-to-improper-roadside-parking-RZM4SW5.jpg": "pricing-hero.png",
    "industrial-worker-with-walkie-talkie-checking-in-c-K4QSVVU.jpg": "pricing-membership.png",
    "worker-with-woman-near-the-broken-car-on-the-highw-S86F3VA.jpg": "rsa-battery.png",
    "logo-rapidtow-HH3PWEA.png": "logo-race.png",
}

SRC_SET = re.compile(r'\bsrcset="([^"]*)"', re.I)
ANY = re.compile(r"(logo-rapidtow|crossorigin)[^\s\"']*|[A-Za-z0-9_.-]*"
                 r"(?:logo-rapidtow|crossorigin)[A-Za-z0-9_.-]*")


def rewrite_srcset(block: str) -> str:
    """Point every RapidTow entry in a srcset at the replacement, same width."""
    parts = []
    for chunk in block.split(","):
        chunk = chunk.strip()
        if not chunk:
            continue
        bits = chunk.split(None, 1)
        url = bits[0]
        suffix = f" {bits[1]}" if len(bits) > 1 else ""
        name = url.rsplit("/", 1)[-1]
        if name in MAP:
            parts.append(f"images/{MAP[name]}{suffix}")
        else:
            parts.append(chunk)
    return ", ".join(parts)


def swap(html: str) -> tuple[str, dict[str, int]]:
    counts: dict[str, int] = {}

    def note(old: str) -> str:
        counts[old] = counts.get(old, 0) + 1
        return MAP[old]

    # srcset first: its URLs are a different shape than src.
    def fix_srcset(m: re.Match) -> str:
        new = rewrite_srcset(m.group(1))
        for old in MAP:
            if old in m.group(1):
                note(old)
        return f'srcset="{new}"'

    html = SRC_SET.sub(fix_srcset, html)

    # Then plain src / href references to the images directory.
    def fix_src(m: re.Match) -> str:
        attr, quote, url = m.group(1), m.group(2), m.group(3)
        name = url.rsplit("/", 1)[-1]
        if name in MAP:
            note(name)
            return f"{attr}={quote}images/{MAP[name]}{quote}"
        return m.group(0)

    html = re.sub(
        r"\b(src|href|data-src)=([\"'])([^\"']*\.(?:png|jpe?g|webp))\2",
        fix_src,
        html,
        flags=re.I,
    )

    return html, counts


def main() -> int:
    missing = [v for v in MAP.values() if not (BASE / "race-img" / v).exists()]
    if missing:
        print(f"generated assets missing: {missing}")
        return 1

    total = 0
    for page in PAGES:
        path = BASE / page
        if not path.exists():
            print(f"{page}: missing")
            continue
        html = path.read_text(encoding="utf-8")
        new, counts = swap(html)
        if new != html:
            path.write_text(new, encoding="utf-8")
        n = sum(counts.values())
        total += n
        detail = ", ".join(f"{k.split('-')[0]}x{v}" for k, v in sorted(counts.items()))
        print(f"{page}: {n} refs rewritten" + (f" ({detail})" if detail else ""))

    print(f"\ntotal references rewritten: {total}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
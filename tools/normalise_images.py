#!/usr/bin/env python
"""Normalise generated imagery to the exact dimensions the clone expects.

The clone hard-codes width/height attributes on every <img>, and two generated
assets do not match their slot:

  hero    slot is 1200x448 (2.68:1 panoramic strip); Hunyuan returned
          1920x1072 (1.79:1). Swapping it raw would squash or letterbox.
  logo    slot is 442x65 (6.8:1 wordmark); the generated mark is a 1:1 square.
          A square mark in a 6.8:1 slot would either stretch or leave a huge
          gap, so the logo is handled separately by logo_wordmark.py.

Everything else already matches, but this script re-asserts every file so a
future regeneration cannot silently introduce a mismatch.
"""
from __future__ import annotations

import pathlib
import struct
import subprocess

BASE = pathlib.Path(__file__).parent
SRC = BASE / "race-img"

# generated name -> exact (width, height) the slot requires
TARGETS = {
    "hero-tow-truck.png": (1200, 448),
    "service-mechanic.png": (1200, 800),
    "about-team.png": (1200, 800),
    "recovery-accident.png": (1200, 800),
    "chauffeur-driver.png": (1200, 800),
    "rsa-battery.png": (1200, 800),
    "rsa-tyre.png": (1200, 800),
    "rsa-fuel.png": (1200, 800),
    "pricing-hero.png": (1920, 1080),
    "pricing-membership.png": (1200, 800),
    "contact-dispatch.png": (1200, 800),
    "contact-coverage.png": (1200, 800),
    "coverage-highway.png": (1200, 800),
}

PY = r"D:\harmes\hermes-agent\venv\Scripts\python.exe"


def png_size(path: pathlib.Path) -> tuple[int, int] | None:
    head = path.read_bytes()[:24]
    if head[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    return struct.unpack(">II", head[16:24])


def fit(name: str, tw: int, th: int) -> str:
    """Resize/cover-crop the image to exactly tw x th, centred."""
    from PIL import Image

    src = SRC / name
    with Image.open(src) as im:
        im = im.convert("RGB")
        cur_w, cur_h = im.size
        if (cur_w, cur_h) == (tw, th):
            return f"already {tw}x{th}"

        # Cover-crop: scale so the short side fills the target, then centre-crop.
        scale = max(tw / cur_w, th / cur_h)
        new_w, new_h = round(cur_w * scale), round(cur_h * scale)
        im = im.resize((new_w, new_h), Image.LANCZOS)
        left = (new_w - tw) // 2
        top = (new_h - th) // 2
        im = im.crop((left, top, left + tw, top + th))
        im.save(src, "PNG", optimize=True)
        return f"{cur_w}x{cur_h} -> {tw}x{th} (crop)"


def main() -> int:
    print("=== dimension normalisation ===")
    changed = 0
    for name, (tw, th) in TARGETS.items():
        path = SRC / name
        if not path.exists():
            print(f"  MISSING {name}")
            continue
        before = png_size(path)
        note = fit(name, tw, th)
        after = png_size(path)
        mark = " " if before == after else "*"
        print(f" {mark} {name:26s} {before[0]}x{before[1]:<5d} -> {after[0]}x{after[1]:<5d}  {note}")
        if before != after:
            changed += 1
    print(f"\nadjusted {changed} file(s)")

    # Report slot coverage so nothing is silently missing.
    total_kb = sum(p.stat().st_size for p in SRC.glob("*.png")) // 1024
    print(f"race-img total: {total_kb} KB across {len(list(SRC.glob('*.png')))} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
#!/usr/bin/env python
"""Generate RACE website imagery with Tencent Hunyuan (Hy-Image-v3.5).

Why regenerate: the cloned template still carries a US towing company's photos —
a flatbed carrying a hatchback with an Ohio licence plate, plus RapidTow branding
in the logo. Content and design were swapped to RACE; the imagery was not, so the
site currently reads as a US business to an Odisha audience.

Every slot below mirrors an existing <img> in the clone, matching its aspect
ratio so no layout shifts when the file is swapped in. Names are stable, so the
swapping script is a straight filename rename.

Generation is synchronous: the POST blocks 10-60s. Set the read timeout to 180s.
Cost is $0.024/image at 2K and below.
"""
from __future__ import annotations

import json
import pathlib
import subprocess
import sys
import time
import urllib.error
import urllib.request

BASE = pathlib.Path(__file__).parent
OUT = BASE / "race-img"
ENDPOINT = "https://console.gmicloud.ai/api/v1/ie/requestqueue/apikey/requests"
MODEL = "hy-image-v3.5-preview"
TIMEOUT = 180

# Shared style suffix. Keeps the set visually consistent across 14 assets.
STYLE = (
    "Professional commercial photography for a roadside assistance company. "
    "Natural daylight, clean modern styling, uncluttered composition, "
    "photorealistic, sharp focus, no text overlays, no logos, no watermarks, "
    "no visible number plates, no readable signage."
)

# slot -> (filename stem, size, prompt)
SLOTS: dict[str, tuple[str, str, str]] = {
    "hero": (
        "hero-tow-truck",
        "1920x1080",
        "A bright orange flatbed tow truck with a hydraulic platform, parked at a "
        "slight angle on a wide Indian highway at golden hour. Clean modern road, "
        "green trees blurred in the background, no other vehicles in frame. The "
        "truck is empty and ready for dispatch, ramp lowered. Shot from a low "
        "three-quarter angle showing the whole vehicle.",
    ),
    "service-hero": (
        "service-mechanic",
        "1200x800",
        "A roadside assistance technician in a clean orange high-visibility vest "
        "working on a car wheel beside an Indian highway, hydraulic jack and tools "
        "on the tarmac. Late afternoon light, shallow depth of field, the mechanic "
        "is focused and competent. Documentary commercial photography style.",
    ),
    "about": (
        "about-team",
        "1200x800",
        "Three roadside assistance professionals in orange high-visibility vests "
        "standing beside two flatbed tow trucks in a paved Indian depot yard, late "
        "afternoon sun, confident relaxed posture, looking toward camera. Wide shot "
        "with space above them for a headline overlay.",
    ),
    "recovery": (
        "recovery-accident",
        "1200x800",
        "A recovery worker using a winch cable to right an overturned hatchback on "
        "a grassy highway shoulder in India, daylight, safety cones placed around "
        "the scene, a flatbed truck waiting in the background. Realistic "
        "documentary photography, no graphic injury imagery.",
    ),
    "chauffeur": (
        "chauffeur-driver",
        "1200x800",
        "A professional chauffeur in a crisp white shirt and dark trousers standing "
        "beside an open rear door of a clean sedan in India, courteous posture, "
        "daylight outside a modern building. Lifestyle commercial photography.",
    ),
    "battery": (
        "rsa-battery",
        "1200x800",
        "Close-up of gloved hands connecting a portable jump starter booster pack to "
        "a car battery under an open bonnet, clean modern equipment, daylight, "
        "shallow depth of field focused on the connection point. Technical "
        "commercial photography.",
    ),
    "tyre": (
        "rsa-tyre",
        "1200x800",
        "A technician fitting a spare wheel onto a car using a torque wrench beside "
        "an Indian highway, hydraulic jack in place, safety first, daylight. Clean "
        "commercial product photography.",
    ),
    "fuel": (
        "rsa-fuel",
        "1200x800",
        "A roadside assistance worker carrying a clean fuel canister to a car on an "
        "Indian highway shoulder, daylight, mid-action, professional documentary "
        "photography style.",
    ),
    "pricing-hero": (
        "pricing-hero",
        "1920x1080",
        "A calm wide shot of an Indian city road at dusk with a single orange flatbed "
        "tow truck parked neatly at the roadside, warm street lights beginning to "
        "glow, clean urban environment, plenty of negative space on the left side "
        "for text overlay.",
    ),
    "pricing-card": (
        "pricing-membership",
        "1200x800",
        "A family standing beside their car on a residential street in India, "
        "relaxed and safe, with an orange roadside assistance vehicle visible in "
        "the background. Warm daylight, lifestyle commercial photography.",
    ),
    "contact-hero": (
        "contact-dispatch",
        "1200x800",
        "A roadside assistance control room in India, a dispatcher at a desk with "
        "a wall of map screens showing vehicle locations, warm interior lighting, "
        "clean modern office, professional atmosphere.",
    ),
    "contact-map": (
        "contact-coverage",
        "1200x800",
        "A top-down aerial view of a road junction in an Indian city with a flatbed "
        "tow truck approaching, clear road markings, urban landscape, daylight. "
        "Clean editorial aerial photography.",
    ),
    "coverage-highway": (
        "coverage-highway",
        "1200x800",
        "A long straight Indian national highway stretching into the distance "
        "through green countryside, an orange flatbed tow truck driving along it, "
        "clear blue sky, wide landscape composition.",
    ),
    "logo": (
        "logo-race",
        "1024x1024",
        "A minimal flat vector logo on a pure white background: a bold orange "
        "chevron arrow sweeping upward and forward to suggest speed and rescue, "
        "paired with a simplified flatbed tow truck silhouette integrated into the "
        "arrow shape. Pure orange #F26522 on white, thick clean geometric forms, "
        "generous white space, no text, no letters, no gradients, no shadows. "
        "Modern minimal automotive brand mark.",
    ),
}

# Filename rewrites: old clone asset -> new generated asset.
REPLACEMENTS = {
    "logo-rapidtow-HH3PWEA.png": "logo-race.png",
    "car-hero-UCBZSH4-2-e1750942959723.png": "hero-tow-truck.png",
    "insurance-officers-hold-a-red-emergency-triangle-s-HH7LFPM.jpg": "about-team.png",
    "broken-car-red-sign-man-is-with-his-automobile-out-5K3XG3H.jpg": "recovery-accident.png",
    "a-man-driving-a-car-opens-the-window-and-smiles-GLKLA5C.jpg": "chauffeur-driver.png",
    "tow-truck-operator-fixing-the-car-on-platform-VN29XU9-1.jpg": "service-mechanic.png",
    "tow-truck-operator-fixing-the-car-on-platform-BMZTK74.jpg": "contact-dispatch.png",
    "tow-truck-operator-fixing-the-car-on-platform-VN29XU9.jpg": "contact-coverage.png",
    "car-evacuation-due-to-improper-roadside-parking-RZM4SW5.jpg": "pricing-hero.png",
    "industrial-worker-with-walkie-talkie-checking-in-c-K4QSVVU.jpg": "pricing-membership.png",
    "worker-with-woman-near-the-broken-car-on-the-highw-S86F3VA.jpg": "battery-jump.png",
    "portrait-of-handsome-latin-man-driver-wearing-styl-2STDPDX.jpg": "logo-alt.png",
}


def api_key() -> str:
    out = subprocess.run(
        ["grep", "GMI_SERVING_API_KEY=", "/d/harmes/.env"],
        capture_output=True,
        text=True,
    ).stdout.strip()
    return out.split("=", 1)[1]


def generate(key: str, prompt: str, size: str, seed: int = 0) -> str:
    body = json.dumps({
        "model": MODEL,
        "payload": {"prompt": f"{prompt} {STYLE}", "size": size, "seed": seed},
    }).encode()
    req = urllib.request.Request(
        ENDPOINT,
        data=body,
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        data = json.load(r)

    status = data.get("status")
    if status != "success":
        err = data.get("outcome", {}).get("error")
        raise RuntimeError(f"{status}: {err}")

    urls = data.get("outcome", {}).get("media_urls", [])
    if not urls:
        raise RuntimeError("success but no media_urls")
    return urls[0]["url"]


def download(url: str, dest: pathlib.Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=90) as r:
        data = r.read()
    if len(data) < 5000:
        raise RuntimeError(f"suspiciously small payload: {len(data)}")
    dest.write_bytes(data)


def main() -> int:
    only = sys.argv[1:] or list(SLOTS)
    OUT.mkdir(exist_ok=True)
    key = api_key()
    print(f"key loaded ({len(key)} chars)\n")

    ok = failed = 0
    for slot in only:
        if slot not in SLOTS:
            print(f"!! unknown slot {slot}")
            continue
        stem, size, prompt = SLOTS[slot]
        dest = OUT / f"{stem}.png"
        if dest.exists() and dest.stat().st_size > 0:
            print(f"  skip   {slot:16s} {dest.name} (exists)")
            continue
        try:
            url = generate(key, prompt, size)
            download(url, dest)
            kb = dest.stat().st_size // 1024
            print(f"  ok     {slot:16s} {dest.name:26s} {size:10s} {kb}KB")
            ok += 1
        except Exception as exc:
            print(f"  FAIL   {slot:16s} {type(exc).__name__}: {str(exc)[:110]}")
            failed += 1
        time.sleep(1)

    print(f"\ngenerated {ok}, failed {failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
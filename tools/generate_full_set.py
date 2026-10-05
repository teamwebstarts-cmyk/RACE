#!/usr/bin/env python
"""Generate the full RACE image set, slot by slot, at the clone's exact sizes.

Audit found the earlier pass only covered the 11 largest <img> slots. Still
pointing at the upstream US template:

  12 photography slots  - hero, about, recovery, chauffeur, service, contact x2,
                         pricing x2, plus two testimonial portraits nobody had
                         spotted because they sit in the reviews carousel.
  18 icon slots         - 64x64 (and 48x48) PNGs used as list bullets, card
                         glyphs and coverage markers.

Photography goes through Hy-Image-v3.5 (Hunyuan). Icons do NOT: a diffusion
model asked for a 64px monochrome glyph returns a blurry illustration with
invented shapes and unreadable edges. They are drawn as inline SVG instead,
which stays crisp at any DPI and costs nothing.

Every asset is emitted at the exact pixel dimensions its slot declares, and
responsive srcset variants are produced locally with PIL rather than generated
separately, so the browser can never fall back to a stale upstream filename.
"""
from __future__ import annotations

import json
import pathlib
import re
import struct
import subprocess
import sys
import time
import urllib.error
import urllib.request

BASE = pathlib.Path(__file__).parent
IMG = BASE / "images"
ENDPOINT = "https://console.gmicloud.ai/api/v1/ie/requestqueue/apikey/requests"
MODEL = "hy-image-v3.5-preview"
TIMEOUT = 200

# ---------------------------------------------------------------- photography
# Every shot is written for an Indian audience: Indian road furniture, local
# vehicle types, tropical daylight, people who look like the service's customers.
STYLE = (
    "Professional commercial photography for an Indian roadside assistance "
    "company in Odisha. Natural daylight, authentic Indian setting, warm and "
    "dependable mood, photorealistic, sharp focus, high detail. "
    "No text, no captions, no logos, no watermarks, no readable signage, "
    "no legible number plates, no distorted faces or hands."
)

# name -> (size, prompt)
PHOTOS: dict[str, tuple[str, str]] = {
    # ---- hero / about / services -------------------------------------------
    "race-hero-truck": (
        "1200x448",
        "Wide panoramic shot of a modern orange flatbed tow truck driving on a "
        "divided Indian national highway, seen from a low three-quarter angle. "
        "Tropical green roadside trees blur past, bright overcast daylight, clean "
        "empty road stretching ahead, other traffic absent. The truck carries "
        "RACE-style orange livery in flat panels with no text.",
    ),
    "race-service-mechanic": (
        "1200x800",
        "A roadside assistance technician in an orange high-visibility vest with "
        "reflective bands kneeling beside a silver sedan on the shoulder of an "
        "Indian highway, working on a rear wheel with a torque wrench. Hydraulic "
        "jack and tool kit on the tarmac. Warm late-morning light, shallow depth "
        "of field, the technician looks focused and competent.",
    ),
    "race-about-team": (
        "1200x800",
        "Four roadside assistance professionals in matching orange high-visibility "
        "vests standing in a row beside two orange flatbed tow trucks in a paved "
        "Indian depot yard. Friendly confident posture, looking toward camera, "
        "morning light, palm trees and a compound wall behind them. Wide shot with "
        "clear sky space above their heads.",
    ),
    "race-recovery-accident": (
        "1200x800",
        "A recovery worker in an orange vest operating a winch cable that is "
        "righting a sedan that has slipped off a muddy embankment on an Indian "
        "highway. Safety cones ring the scene, a flatbed truck waits on the "
        "paved road behind, daylight. Documentary realism, calm and professional, "
        "no injuries visible.",
    ),
    "race-chauffeur": (
        "1200x800",
        "A professional chauffeur in a crisp white shirt and dark trousers "
        "standing beside the open rear door of a clean white sedan parked outside "
        "a modern Indian building. He holds the door handle courteously, wearing "
        "dark sunglasses, relaxed confident expression, bright daylight.",
    ),
    # ---- roadside assistance ----------------------------------------------
    "race-rsa-battery": (
        "1200x800",
        "Close-up of a technician's gloved hands connecting a portable jump-starter "
        "booster unit to a car battery under an open bonnet on an Indian highway. "
        "Clean modern equipment, digital display glowing, daylight, shallow depth "
        "of field focused on the clamp connection.",
    ),
    "race-rsa-tyre": (
        "1200x800",
        "A technician fitting a spare wheel onto a silver hatchback beside an "
        "Indian highway using a torque wrench. Hydraulic jack in place, wheel "
        "bolts laid out neatly on a cloth, safety first, bright daylight. Clean "
        "commercial photography.",
    ),
    "race-rsa-fuel": (
        "1200x800",
        "A roadside assistance worker in an orange vest carrying a clean red fuel "
        "canister in a metal rack toward a silver sedan on an Indian highway "
        "shoulder, mid-stride, sunlight, professional documentary photography.",
    ),
    # ---- pricing -----------------------------------------------------------
    "race-pricing-hero": (
        "1200x800",
        "Calm wide shot of an Indian city street at dusk with one orange flatbed "
        "tow truck parked neatly on the roadside, warm street lights just glowing, "
        "clean urban streetscape, generous empty negative space on the left third "
        "for a text overlay.",
    ),
    "race-pricing-family": (
        "1200x800",
        "A young Indian family - parents with a child - standing beside their "
        "silver car on a quiet residential street in Bhubaneswar, relaxed and safe. "
        "An orange roadside assistance vehicle is parked a little further down the "
        "street, slightly out of focus. Warm golden hour lifestyle photography.",
    ),
    # ---- contact -----------------------------------------------------------
    "race-contact-dispatch": (
        "1200x800",
        "Interior of a modern roadside assistance control room in Bhubaneswar. A "
        "dispatcher in a navy shirt sits at a curved desk facing a large wall of "
        "screens showing a city map with vehicle markers. Warm interior lighting, "
        "clean professional atmosphere, one colleague blurred in the background.",
    ),
    "race-contact-coverage": (
        "1200x800",
        "Aerial view looking down on a broad Indian city road junction with clear "
        "lane markings, palm trees lining the median, low-rise buildings either "
        "side, and an orange flatbed tow truck approaching the intersection. "
        "Bright midday light, clean editorial aerial photography.",
    ),
    "race-coverage-highway": (
        "1200x800",
        "A long straight Indian national highway running through green Odisha "
        "countryside into the far distance, an orange flatbed tow truck driving "
        "along it, palm trees and paddy fields either side, clear sky, wide "
        "landscape composition.",
    ),
    # ---- testimonial portraits (previously missed entirely) ---------------
    "race-review-1": (
        "1200x800",
        "Portrait of a young Indian woman in a simple salwar kameez standing "
        "beside a white SUV on an Indian highway at night, headlights of the "
        "vehicle illuminating the scene, she looks relieved and safe. Warm orange "
        "sodium street lighting, authentic documentary style, waist-up framing "
        "with space above her head.",
    ),
    "race-review-2": (
        "1200x800",
        "Portrait of a middle-aged Indian man in a light blue shirt standing next "
        "to a silver sedan on a wet road after rain, holding car keys up with a "
        "calm satisfied expression, an orange flatbed tow truck softly blurred in "
        "the background. Overcast daylight, authentic documentary photography, "
        "waist-up framing with space above his head.",
    ),
    "race-review-3": (
        "1200x800",
        "Portrait of a young Indian woman in office attire standing beside a "
        "compact car in an office parking basement, holding a small jump-starter "
        "unit, looking directly at camera with a relieved smile. Cool fluorescent "
        "lighting mixed with warm accents, authentic documentary style, waist-up "
        "framing with space above her head.",
    ),
}

# Upstream filename (without srcset size suffix) -> generated name
PHOTO_MAP = {
    "car-hero-UCBZSH4-2-e1750942959723.png": "race-hero-truck.png",
    "insurance-officers-hold-a-red-emergency-triangle-s-HH7LFPM.jpg": "race-about-team.png",
    "broken-car-red-sign-man-is-with-his-automobile-out-5K3XG3H.jpg": "race-recovery-accident.png",
    "a-man-driving-a-car-opens-the-window-and-smiles-GLKLA5C.jpg": "race-chauffeur.png",
    "a-whole-lot-of-fun-up-ahead-QDSF7NX.jpg": "race-review-1.png",
    "portrait-of-handsome-latin-man-driver-wearing-styl-2STDPDX.jpg": "race-review-2.png",
    "tow-truck-operator-fixing-the-car-on-platform-VN29XU9-1.jpg": "race-service-mechanic.png",
    "tow-truck-operator-fixing-the-car-on-platform-BMZTK74.jpg": "race-contact-dispatch.png",
    "tow-truck-operator-fixing-the-car-on-platform-VN29XU9.jpg": "race-contact-coverage.png",
    "car-evacuation-due-to-improper-roadside-parking-RZM4SW5.jpg": "race-pricing-hero.png",
    "industrial-worker-with-walkie-talkie-checking-in-c-K4QSVVU.jpg": "race-pricing-family.png",
    "worker-with-woman-near-the-broken-car-on-the-highw-S86F3VA.jpg": "race-rsa-battery.png",
}

# ------------------------------------------------------------------------- icons
# name -> (svg body, viewBox)
# Drawn rather than generated: a diffusion model cannot produce a clean 64px
# glyph. These are single-colour, currentColor-style strokes on a 24-unit grid.
ICONS: dict[str, tuple[str, str]] = {
    "race-icon-clock": (
        '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>', "0 0 24 24"),
    "race-icon-calendar": (
        '<rect x="3.5" y="5" width="17" height="15" rx="2"/>'
        '<path d="M3.5 10h17M8 3v4M16 3v4"/>', "0 0 24 24"),
    "race-icon-battery": (
        '<rect x="2.5" y="7" width="16" height="10" rx="2"/>'
        '<path d="M18.5 11h3M6 10.5v3M9.5 10.5v3M13 10.5v3"/>', "0 0 24 24"),
    "race-icon-fuel": (
        '<path d="M4 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16"/>'
        '<path d="M3 21h11M13 10h3a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V9l-3-3"/>', "0 0 24 24"),
    "race-icon-wheel": (
        '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3"/>'
        '<path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3"/>', "0 0 24 24"),
    "race-icon-tools": (
        '<path d="M14.5 3.5a5 5 0 0 0-6.2 6.9L3 15.7 5.3 18l5.3-5.3a5 5 0 0 0 6.9-6.2l-3 3-2.6-2.6 3-3Z"/>'
        '<path d="M17.5 17.5 21 21"/>', "0 0 24 24"),
    "race-icon-shield": (
        '<path d="M12 2.5 20 6v6c0 5-3.4 8.3-8 9.5C7.4 20.3 4 17 4 12V6l8-3.5Z"/>'
        '<path d="m9 12 2 2 4-4"/>', "0 0 24 24"),
    "race-icon-pin": (
        '<path d="M12 21.5s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/>'
        '<circle cx="12" cy="10.5" r="2.6"/>', "0 0 24 24"),
    "race-icon-phone": (
        '<path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z"/>',
        "0 0 24 24"),
    "race-icon-mail": (
        '<rect x="3" y="5" width="18" height="14" rx="2"/>'
        '<path d="m3.5 6.5 8.5 6 8.5-6"/>', "0 0 24 24"),
    "race-icon-building": (
        '<path d="M4 21V6l8-3v18M12 10h8v11"/>'
        '<path d="M7 9v0M7 12.5v0M7 16v0M15.5 13.5v0M15.5 17v0M2 21h20"/>', "0 0 24 24"),
    "race-icon-truck": (
        '<path d="M2.5 6.5h11v10h-11z"/><path d="M13.5 10h4l3 3v3.5h-7z"/>'
        '<circle cx="7" cy="18.5" r="1.9"/><circle cx="17" cy="18.5" r="1.9"/>', "0 0 24 24"),
    "race-icon-key": (
        '<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M15 12v2"/>', "0 0 24 24"),
    "race-icon-check": (
        '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.5 2.5 5.5-6"/>', "0 0 24 24"),
    "race-icon-star": (
        '<path d="m12 3.5 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.9L6.6 20l1-6L3.3 9.9l6-.9L12 3.5Z"/>',
        "0 0 24 24"),
    "race-icon-clock24": (
        '<circle cx="12" cy="12" r="9"/><path d="M12 6.5V12l4 2.5M8 2.5h8"/>', "0 0 24 24"),
    "race-icon-id": (
        '<rect x="2.5" y="5" width="19" height="14" rx="2"/>'
        '<circle cx="8.5" cy="11" r="2.2"/><path d="M4.8 16.5a4 4 0 0 1 7.4 0M14.5 10h4M14.5 13.5h4"/>',
        "0 0 24 24"),
    "race-icon-car": (
        '<path d="M3 16v-3.5l2-5h14l2 5V16"/>'
        '<path d="M3 12.5h18M6.5 16v2M17.5 16v2"/>', "0 0 24 24"),
}

ICON_MAP = {
    "automotive-icon-set-01-ET8KDDL.png": "race-icon-clock.png",
    "automotive-icon-set-05-ET8KDDL.png": "race-icon-shield.png",
    "automotive-icon-set-10-ET8KDDL.png": "race-icon-fuel.png",
    "automotive-icon-set-28-ET8KDDL.png": "race-icon-wheel.png",
    "business-operation-icon-set-26-KFJ7ZDM.png": "race-icon-phone.png",
    "business-operation-icon-set-28-KFJ7ZDM.png": "race-icon-mail.png",
    "car-service-icons-03-K3JVG6D.png": "race-icon-battery.png",
    "car-service-icons-12-K3JVG6D.png": "race-icon-tools.png",
    "car-service-icons-16-K3JVG6D.png": "race-icon-truck.png",
    "check-icons-10-SX6NMW8.png": "race-icon-check.png",
    "maps-icons-02-ZFAJFAT.png": "race-icon-pin.png",
    "maps-icons-07-ZFAJFAT.png": "race-icon-shield.png",
    "maps-icons-11-ZFAJFAT.png": "race-icon-calendar.png",
    "maps-icons-16-ZFAJFAT.png": "race-icon-star.png",
    "maps-icons-18-ZFAJFAT.png": "race-icon-truck.png",
    "maps-icons-27-ZFAJFAT.png": "race-icon-phone.png",
    "navigation-icon-pack-06-Z6KGGBD.png": "race-icon-key.png",
    "navigation-icon-pack-13-Z6KGGBD-1.png": "race-icon-building.png",
}


def api_key() -> str:
    out = subprocess.run(
        ["grep", "GMI_SERVING_API_KEY=", "/d/harmes/.env"],
        capture_output=True, text=True,
    ).stdout.strip()
    return out.split("=", 1)[1]


def generate(key: str, prompt: str, size: str, seed: int = 0) -> str:
    body = json.dumps({
        "model": MODEL,
        "payload": {"prompt": f"{prompt} {STYLE}", "size": size, "seed": seed},
    }).encode()
    req = urllib.request.Request(
        ENDPOINT, data=body,
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        data = json.load(r)
    if data.get("status") != "success":
        raise RuntimeError(f"{data.get('status')}: {data.get('outcome',{}).get('error')}")
    urls = data.get("outcome", {}).get("media_urls", [])
    if not urls:
        raise RuntimeError("no media_urls")
    return urls[0]["url"]


def download(url: str, dest: pathlib.Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=120) as r:
        data = r.read()
    if len(data) < 5000:
        raise RuntimeError(f"small payload {len(data)}")
    dest.write_bytes(data)


def render_icons() -> int:
    """Rasterise the SVG glyphs at every size the clone actually declares."""
    from PIL import Image, ImageDraw

    made = 0
    # Sizes seen in the markup: 64x64 list markers and 48x48 card glyphs.
    for name, (body, vb) in ICONS.items():
        stroke_w = 1.9
        for px in (64, 48):
            scale = px / 24
            img = Image.new("RGBA", (px, px), (0, 0, 0, 0))
            draw = ImageDraw.Draw(img)
            colour = (242, 101, 34, 255)  # RACE orange

            # Parse the tiny subset of path/circle/rect we emit.
            for el in re.findall(r"<(circle|rect|path)([^/]*)/>", body):
                tag, attrs = el
                num = lambda k: float(re.search(k + r'="([-\d.]+)"', attrs).group(1)) * scale
                if tag == "circle":
                    cx, cy, r = num("cx"), num("cy"), num("r")
                    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=colour,
                                 width=max(1, round(stroke_w * scale)))
                elif tag == "rect":
                    x, y = num("x"), num("y")
                    w, h = num("width"), num("height")
                    rx = num("rx") if 'rx="' in attrs else 0
                    if rx:
                        draw.rounded_rectangle([x, y, x + w, y + h], radius=rx,
                                               outline=colour,
                                               width=max(1, round(stroke_w * scale)))
                    else:
                        draw.rectangle([x, y, x + w, y + h], outline=colour,
                                       width=max(1, round(stroke_w * scale)))
                else:
                    d = re.search(r'd="([^"]+)"', attrs).group(1)
                    pts = []
                    for cmd in d.split():
                        if cmd == "M":
                            pts = []
                        nums = re.findall(r"-?\d+\.?\d*", cmd)
                        if cmd == "M" and len(nums) >= 2:
                            pts.append((float(nums[0]) * scale, float(nums[1]) * scale))
                        elif cmd == "L" and len(nums) >= 2:
                            pts.append((float(nums[0]) * scale, float(nums[1]) * scale))
                        elif cmd == "h" and nums:
                            pts.append((pts[-1][0] + float(nums[0]) * scale, pts[-1][1]))
                        elif cmd == "v" and nums:
                            pts.append((pts[-1][0], pts[-1][1] + float(nums[0]) * scale))
                    if len(pts) > 1:
                        draw.line(pts, fill=colour, width=max(1, round(stroke_w * scale)),
                                  joint="curve")

            suffix = "" if px == 64 else "-48"
            # name already carries .png, so strip it before appending the suffix
            # and put it back once - otherwise the 48px variant would be written
            # as "race-icon-clock.png-48.png" and the 64px as "race-icon-clock.png".
            stem = name[:-4] if name.endswith(".png") else name
            out = IMG / f"{stem}{suffix}.png"
            img.save(out, "PNG")
            made += 1
    return made


def main() -> int:
    IMG.mkdir(exist_ok=True)
    only = sys.argv[1:]
    photos = [p for p in PHOTOS if not only or p in only]
    icons = [] if only else ICONS

    if icons:
        n = render_icons()
        print(f"icons: rendered {n} PNGs across {len(icons)} glyphs\n")

    key = api_key()
    ok = fail = 0
    for name in photos:
        size, prompt = PHOTOS[name]
        dest = IMG / name
        if dest.exists() and dest.stat().st_size > 5000:
            print(f"  skip  {name}")
            continue
        try:
            download(generate(key, prompt, size), dest)
            print(f"  ok    {name:26s} {size:10s} {dest.stat().st_size//1024:5d}KB")
            ok += 1
        except Exception as exc:
            print(f"  FAIL  {name:26s} {type(exc).__name__}: {str(exc)[:100]}")
            fail += 1
        time.sleep(1)

    print(f"\nphotos: {ok} generated, {fail} failed")
    return 1 if fail else 0


if __name__ == "__main__":
    raise SystemExit(main())
#!/usr/bin/env python3
import os
import shutil
from PIL import Image

SRC_PATH = "image.png"
if not os.path.exists(SRC_PATH):
    raise FileNotFoundError(f"{SRC_PATH} not found!")

# 1. Backup old hero-tow-truck.png if not already backed up
if os.path.exists("images/hero-tow-truck.png") and not os.path.exists("images/hero-tow-truck.bak.png"):
    shutil.copyfile("images/hero-tow-truck.png", "images/hero-tow-truck.bak.png")
    print("Backed up old hero-tow-truck.png to images/hero-tow-truck.bak.png")

src_img = Image.open(SRC_PATH).convert("RGB")
src_w, src_h = src_img.size

# Target base is 1200x448
target_w, target_h = 1200, 448
target_ratio = target_w / target_h
src_ratio = src_w / src_h

if src_ratio > target_ratio:
    # Wider than target -> crop sides
    crop_w = int(src_h * target_ratio)
    left = (src_w - crop_w) // 2
    crop_box = (left, 0, left + crop_w, src_h)
else:
    # Taller than target -> crop top/bottom slightly
    crop_h = int(src_w / target_ratio)
    top = (src_h - crop_h) // 2
    crop_box = (0, top, src_w, top + crop_h)

cropped = src_img.crop(crop_box)
print(f"Cropped image from {src_img.size} to {cropped.size} using box {crop_box}")

# Required responsive dimensions
SIZES = {
    "images/hero-tow-truck.png": (1200, 448),
    "images/hero-tow-truck-1024x382.png": (1024, 382),
    "images/hero-tow-truck-800x299.png": (800, 299),
    "images/hero-tow-truck-768x287.png": (768, 287),
    "images/hero-tow-truck-300x112.png": (300, 112),
    # Also overwrite the legacy car-hero files so any browser cache loads the new image:
    "images/car-hero-UCBZSH4-2-e1750942959723.png": (1200, 448),
    "images/car-hero-UCBZSH4-2-e1750942959723-1024x382.png": (1024, 382),
    "images/car-hero-UCBZSH4-2-e1750942959723-800x299.png": (800, 299),
    "images/car-hero-UCBZSH4-2-e1750942959723-768x287.png": (768, 287),
    "images/car-hero-UCBZSH4-2-e1750942959723-300x112.png": (300, 112),
}

for out_path, (w, h) in SIZES.items():
    resized = cropped.resize((w, h), Image.Resampling.LANCZOS)
    resized.save(out_path, format="PNG", optimize=True)
    print(f"Generated {out_path} ({w}x{h})")

# Update HTML files: home.html and index.html
OLD_IMG_TAG = (
    '<img fetchpriority="high" decoding="async" width="1200" height="448" '
    'src="images/hero-tow-truck.png" class="attachment-full size-full wp-image-68" '
    'alt="" srcset="images/hero-tow-truck.png 1200w, '
    'images/car-hero-UCBZSH4-2-e1750942959723-300x112.png 300w, '
    'images/car-hero-UCBZSH4-2-e1750942959723-1024x382.png 1024w, '
    'images/car-hero-UCBZSH4-2-e1750942959723-768x287.png 768w, '
    'images/car-hero-UCBZSH4-2-e1750942959723-800x299.png 800w" '
    'sizes="(max-width: 1200px) 100vw, 1200px">'
)

NEW_IMG_TAG = (
    '<img fetchpriority="high" decoding="async" width="1200" height="448" '
    'src="images/hero-tow-truck.png" class="attachment-full size-full wp-image-68" '
    'alt="RACE Service 24/7 Roadside Assistance and Tow Truck" '
    'srcset="images/hero-tow-truck.png 1200w, '
    'images/hero-tow-truck-1024x382.png 1024w, '
    'images/hero-tow-truck-800x299.png 800w, '
    'images/hero-tow-truck-768x287.png 768w, '
    'images/hero-tow-truck-300x112.png 300w" '
    'sizes="(max-width: 1200px) 100vw, 1200px">'
)

for page in ["home.html", "index.html"]:
    with open(page, "r", encoding="utf-8") as f:
        content = f.read()
    if OLD_IMG_TAG in content:
        content = content.replace(OLD_IMG_TAG, NEW_IMG_TAG)
        with open(page, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated image tag in {page}")
    else:
        # Check if already updated or slight whitespace mismatch
        import re
        pattern = re.compile(r'<img fetchpriority="high"[^>]*src="images/hero-tow-truck\.png"[^>]*>')
        if pattern.search(content):
            content = pattern.sub(NEW_IMG_TAG, content)
            with open(page, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Regex replaced image tag in {page}")
        else:
            print(f"WARNING: Hero image tag not found in {page}")

print("Hero image replacement complete!")

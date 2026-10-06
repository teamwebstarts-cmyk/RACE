#!/usr/bin/env python3
import os
import shutil
from PIL import Image

SRC_PATH = "image copy 2.png"
if not os.path.exists(SRC_PATH):
    raise FileNotFoundError(f"{SRC_PATH} not found!")

# Open the new transparent RGBA branded truck image
src_img = Image.open(SRC_PATH).convert("RGBA")
src_w, src_h = src_img.size

# Target base is 1200x448
target_w, target_h = 1200, 448
target_ratio = target_w / target_h
src_ratio = src_w / src_h

# Resize and place onto transparent canvas matching exact aspect ratio if needed,
# or crop slightly to fit 1200x448.
if src_ratio > target_ratio:
    crop_w = int(src_h * target_ratio)
    left = (src_w - crop_w) // 2
    crop_box = (left, 0, left + crop_w, src_h)
else:
    crop_h = int(src_w / target_ratio)
    top = (src_h - crop_h) // 2
    crop_box = (0, top, src_w, top + crop_h)

cropped = src_img.crop(crop_box)
print(f"Prepared cropped image from {src_img.size} to {cropped.size}")

SIZES = {
    "images/hero-tow-truck.png": (1200, 448),
    "images/hero-tow-truck-1024x382.png": (1024, 382),
    "images/hero-tow-truck-800x299.png": (800, 299),
    "images/hero-tow-truck-768x287.png": (768, 287),
    "images/hero-tow-truck-300x112.png": (300, 112),
    # Also overwrite the legacy car-hero files for complete consistency
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

print("All hero tow truck images generated successfully!")

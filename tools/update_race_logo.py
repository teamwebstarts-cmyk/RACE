#!/usr/bin/env python3
import os
import shutil
import numpy as np
from PIL import Image

SRC_PATH = "image copy.png"
if not os.path.exists(SRC_PATH):
    raise FileNotFoundError(f"{SRC_PATH} not found!")

# 1. Backup old logo
if os.path.exists("images/logo-race.png") and not os.path.exists("images/logo-race.bak.png"):
    shutil.copyfile("images/logo-race.png", "images/logo-race.bak.png")
    print("Backed up old logo to images/logo-race.bak.png")

# 2. Process image copy.png to create high-res transparent logo
im = Image.open(SRC_PATH).convert("RGBA")
w, h = im.size

# High-quality 3x upscale for super crisp edges
upscaled = im.resize((w * 3, h * 3), Image.Resampling.LANCZOS)
arr = np.array(upscaled, dtype=np.float32)

# Distance to white
diff = np.sqrt(np.sum((255.0 - arr[:, :, :3]) ** 2, axis=2))

# Smooth alpha thresholding
alpha = np.clip((diff - 22.0) / 28.0, 0.0, 1.0) * 255.0
arr[:, :, 3] = alpha

out = Image.fromarray(arr.astype(np.uint8))

# Crop tightly to content + small padding
coords = np.argwhere(arr[:, :, 3] > 15)
y_min, x_min = coords.min(axis=0)
y_max, x_max = coords.max(axis=0)

pad = 16
crop_box = (
    max(0, x_min - pad),
    max(0, y_min - pad),
    min(arr.shape[1], x_max + 1 + pad),
    min(arr.shape[0], y_max + 1 + pad),
)
cropped = out.crop(crop_box)
print(f"Cropped logo size: {cropped.size}")

# Save as images/logo-race.png
cropped.save("images/logo-race.png", format="PNG", optimize=True)
print("Saved clean transparent logo to images/logo-race.png")

# Also generate a favicon if needed or check favicon
cropped_square = Image.new("RGBA", (max(cropped.size), max(cropped.size)), (0, 0, 0, 0))
offset = ((cropped_square.size[0] - cropped.size[0]) // 2, (cropped_square.size[1] - cropped.size[1]) // 2)
cropped_square.paste(cropped, offset, cropped)
cropped_square.resize((32, 32), Image.Resampling.LANCZOS).save("images/favicon.png", format="PNG")
print("Saved favicon to images/favicon.png")

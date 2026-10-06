import os
from PIL import Image

BRAIN_DIR = r"C:\Users\lenovo\.gemini\antigravity-ide\brain\8e799e14-fd8a-4843-9209-1e709b4cd3e4"
IMAGES_DIR = r"d:\harmes\apps\rapidtow-clone\images"

CUSTOMERS = [
    {
        "src": os.path.join(BRAIN_DIR, "customer_subhashree_photo_1791273517512.jpg"),
        "base_name": "customer-subhashree",
        "legacy_name": "a-man-driving-a-car-opens-the-window-and-smiles-GLKLA5C",
    },
    {
        "src": os.path.join(BRAIN_DIR, "customer_rajesh_photo_1791273546131.jpg"),
        "base_name": "customer-rajesh",
        "legacy_name": "portrait-of-handsome-latin-man-driver-wearing-styl-2STDPDX",
    },
    {
        "src": os.path.join(BRAIN_DIR, "customer_ananya_photo_1791273580796.jpg"),
        "base_name": "customer-ananya",
        "legacy_name": "a-whole-lot-of-fun-up-ahead-QDSF7NX",
    },
]

RESPONSIVE_SIZES = [
    (1200, 800, ""),
    (1024, 683, "-1024x683"),
    (800, 533, "-800x533"),
    (768, 512, "-768x512"),
    (300, 200, "-300x200"),
]

def main():
    for cust in CUSTOMERS:
        img = Image.open(cust["src"]).convert("RGB")
        print(f"Processing {cust['base_name']} ({img.size})...")
        
        for w, h, suffix in RESPONSIVE_SIZES:
            resized = img.resize((w, h), Image.Resampling.LANCZOS)
            
            # Save new standard name
            out_path = os.path.join(IMAGES_DIR, f"{cust['base_name']}{suffix}.jpg")
            resized.save(out_path, quality=90, optimize=True)
            print(f"  Saved {out_path}")
            
            # Also save legacy names for backward compat
            legacy_path = os.path.join(IMAGES_DIR, f"{cust['legacy_name']}{suffix}.jpg")
            resized.save(legacy_path, quality=90, optimize=True)
            print(f"  Legacy compat saved {legacy_path}")

    # Also save chauffeur-driver.png replacement
    sh_img = Image.open(CUSTOMERS[0]["src"]).convert("RGB").resize((1200, 800), Image.Resampling.LANCZOS)
    sh_img.save(os.path.join(IMAGES_DIR, "chauffeur-driver.png"), quality=90)
    print("Done generating customer review images!")

if __name__ == "__main__":
    main()

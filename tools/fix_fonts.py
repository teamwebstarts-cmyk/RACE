#!/usr/bin/env python
"""Resolve the Google Fonts chain so the clone renders identically offline.

The capture left three <link> tags pointing at "#":

    id="e-animation-fadeInUp-css"      (keyframe rules)
    id="e-animation-fadeInRight-css"
    id="elementor-gf-rubik-css"        (the actual webfont @font-face)
    id="elementor-gf-inter-css"

Elementor expects those ids to be real stylesheets; because they were "#" the
browser resolved the font to a fallback, which is why headings looked slightly
off next to the live site. This fetches the @font-face CSS from Google Fonts,
downloads every woff2 it references into fonts/, rewrites the URLs to local
paths, and swaps each placeholder <link> for the resolved file.
"""
import pathlib
import re
import urllib.request

BASE = pathlib.Path(__file__).parent
FONTS_DIR = BASE / "fonts"
CSS_DIR = BASE / "css"

# A modern UA is required: Google Fonts serves woff2 + the full unicode-range
# split only to browsers it recognises as current. Without it you get a single
# legacy .ttf at weight 400, which renders visibly different from the live site.
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
)

LINK = re.compile(r'<link\b[^>]*\bid="([^"]*-css)"[^>]*\bhref="#"[^>]*>', re.I)
URL = re.compile(r"url\((https://fonts\.gstatic\.com/[^)]+)\)")

# CSS2 gives every weight + the latin/latin-ext subsets the live site loads.
FAMILIES = {
    "Rubik": "family=Rubik:wght@300;400;500;600;700;800;900",
    "Inter": "family=Inter:wght@300;400;500;600;700;800",
}


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def build_family(name: str, spec: str) -> tuple[str, int]:
    """Download one family's CSS + woff2 files; return (css_text, file_count)."""
    css_url = f"https://fonts.googleapis.com/css2?{spec}&display=swap"
    text = fetch(css_url).decode("utf-8", errors="ignore")
    count = 0

    def grab(m: re.Match) -> str:
        nonlocal count
        url = m.group(1)
        fname = url.rsplit("/", 1)[-1]
        if not (FONTS_DIR / fname).exists():
            try:
                data = fetch(url)
            except Exception:
                return m.group(0)  # leave the remote URL in place on failure
            FONTS_DIR.mkdir(exist_ok=True)
            (FONTS_DIR / fname).write_bytes(data)
        count += 1
        return f"url(../fonts/{fname})"

    return URL.sub(grab, text), count


def main() -> int:
    FONTS_DIR.mkdir(exist_ok=True)

    generated = {}
    for name, spec in FAMILIES.items():
        css_text, n = build_family(name, spec)
        out = CSS_DIR / f"google-{name}.css"
        out.write_text(css_text, encoding="utf-8")
        generated[name] = (out.name, n)
        print(f"{name}: css -> css/{out.name} ({len(css_text)}B), {n} woff2 files")

    pages = ["home.html", "service.html", "contact.html", "pricing.html"]
    for page in pages:
        path = BASE / page
        if not path.exists():
            continue
        html = path.read_text(encoding="utf-8", errors="ignore")

        def replace(m: re.Match) -> str:
            link_id = m.group(1)
            low = link_id.lower()
            if "rubik" in low:
                target = generated["Rubik"][0]
            elif "inter" in low:
                target = generated["Inter"][0]
            elif "fadeinup" in low:
                target = "fadeInUp.min.css"
            elif "fadeinright" in low:
                target = "fadeInRight.min.css"
            else:
                return m.group(0)
            return f'<link rel="stylesheet" id="{link_id}" href="css/{target}" media="all">'

        new_html = LINK.sub(replace, html)
        n = len(LINK.findall(html))
        path.write_text(new_html, encoding="utf-8")
        print(f"{page}: resolved {n} placeholder stylesheet links")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
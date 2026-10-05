#!/usr/bin/env python
"""Resolve the last placeholder <script src="#"> tags.

Six scripts were left pointing at "#" by the original capture, so the features
they power never initialised: the off-canvas mobile menu, scroll easing, the
hero slideshow, the Elementor addon bundle, the service-card carousel, and the
pricing table. Every file is already on disk under js/ — only the src attribute
was wrong. This maps each script id to its real filename, taking the mapping
from the live capture so nothing is guessed.
"""
import pathlib
import re

BASE = pathlib.Path(__file__).parent
PAGES = ["home.html", "service.html", "contact.html", "pricing.html"]

SRC = re.compile(r'(<script\b[^>]*?\b(?:id="([^"]*)"[^>]*?\bsrc|src)=")#(")', re.I)


def script_map() -> dict[str, str]:
    """script-id -> local filename, read off the live captures."""
    out: dict[str, str] = {}
    for page in PAGES:
        live = BASE / f"_live_{page.replace('.html', '')}.html"
        if not live.exists():
            continue
        html = live.read_text(encoding="utf-8", errors="ignore")
        for m in re.finditer(r"<script\b[^>]*>", html, re.I):
            tag = m.group(0)
            sid = re.search(r'id="([^"]+)"', tag)
            src = re.search(r'src="([^"]+)"', tag)
            if sid and src and src.group(1).startswith("http"):
                name = src.group(1).split("?")[0].rsplit("/", 1)[-1]
                if (BASE / "js" / name).exists():
                    out.setdefault(sid.group(1), name)
    return out


def main() -> int:
    mapping = script_map()
    if not mapping:
        print("no script mapping could be derived")
        return 1
    print(f"derived {len(mapping)} script mappings")

    for page in PAGES:
        path = BASE / page
        if not path.exists():
            print(f"{page}: missing")
            continue
        html = path.read_text(encoding="utf-8", errors="ignore")

        fixed = 0

        def repl(m: re.Match) -> str:
            nonlocal fixed
            tag = m.group(0)
            sid = re.search(r'id="([^"]+)"', tag)
            if not sid:
                return tag
            name = mapping.get(sid.group(1))
            if not name:
                return tag
            fixed += 1
            return tag.replace('src="#"', f'src="js/{name}"', 1)

        new_html = re.sub(r'<script\b[^>]*\bsrc="#"[^>]*>', repl, html)
        path.write_text(new_html, encoding="utf-8")

        remaining = new_html.count('src="#"')
        print(f"{page}: fixed {fixed}, remaining '{remaining}' placeholders")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
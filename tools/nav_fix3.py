#!/usr/bin/env python
"""Third nav pass: collapse parents that now duplicate their only child.

nav_fix2 repointed the dropdown parents at their surviving child, which leaves
the menu showing both "Services -> service.html" and "Service -> service.html".
Now that each parent has exactly one real page, drop the redundant parent <li>
and promote the child, leaving a flat, honest menu:

    Home · Service · Pricing · Contact
"""
import pathlib
import re

BASE = pathlib.Path(__file__).parent

PAGES = ["home.html", "service.html", "contact.html", "pricing.html"]
NAV_ID = "menu-header-menu"

HREF = re.compile(r'<a\b[^>]*?\bhref="([^"]*)"', re.I)
LI_TAG = re.compile(r"<(/?)li\b[^>]*>")


def top_level_spans(seg: str) -> list[tuple[int, int]]:
    spans, depth, start = [], 0, None
    for m in LI_TAG.finditer(seg):
        if not m.group(1):
            if depth == 0:
                start = m.start()
            depth += 1
        else:
            depth -= 1
            if depth == 0 and start is not None:
                spans.append((start, m.end()))
                start = None
    return spans


def promote(chunk: str) -> str | None:
    """Return the single child <li> if the parent is now redundant."""
    m = re.search(r"<ul\b[^>]*>(.*)</ul>\s*</li>\s*$", chunk, re.S)
    if not m:
        return None
    inner = m.group(1)
    # The parent link and the child must point at the same page.
    parent_hrefs = HREF.findall(chunk.split("<ul", 1)[0])
    child_spans = top_level_spans(inner)
    if len(child_spans) != 1:
        return None
    child = inner[child_spans[0][0] : child_spans[0][1]]
    child_hrefs = HREF.findall(child)
    if not parent_hrefs or not child_hrefs:
        return None
    if parent_hrefs[0] != child_hrefs[0]:
        return None
    # Promote, but strip the child's dropdown class since it is now flat.
    return child.replace(" menu-item-has-children", "")


def locate(html: str) -> tuple[int, int] | None:
    anchor = html.find(f'id="{NAV_ID}"')
    if anchor == -1:
        return None
    start = html.rfind("<ul", 0, anchor)
    if start == -1:
        return None
    pos, depth = start, 0
    while pos < len(html):
        m = re.compile(r"<(/?)ul\b[^>]*>").search(html, pos)
        if not m:
            return None
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return start, m.end()
        pos = m.end()
    return None


def main() -> int:
    for page in PAGES:
        path = BASE / page
        if not path.exists():
            print(f"{page}: missing")
            continue
        html = path.read_text(encoding="utf-8", errors="ignore")
        span = locate(html)
        if not span:
            print(f"{page}: nav not found")
            continue

        start, end = span
        seg = html[start:end]
        out: list[str] = []
        cursor = 0
        collapsed = 0

        for s, e in top_level_spans(seg):
            chunk = seg[s:e]
            replacement = promote(chunk)
            if replacement is not None:
                out.append(seg[cursor:s])
                out.append(replacement)
                collapsed += 1
            else:
                out.append(seg[cursor:e])
            cursor = e
        out.append(seg[cursor:])

        cleaned = "".join(out)
        html = html[:start] + cleaned + html[end:]
        path.write_text(html, encoding="utf-8")

        links = re.findall(
            r'<a\b[^>]*?href="([^"]*)"[^>]*>(.*?)</a>', cleaned, re.S | re.I
        )
        summary = [
            (" ".join(re.sub(r"<[^>]+>", " ", t).split())[:18] or "(icon)", h)
            for h, t in links
        ]
        print(f"{page}: collapsed {collapsed}")
        print(f"{page}: nav -> {summary}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
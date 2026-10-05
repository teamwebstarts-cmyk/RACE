#!/usr/bin/env python
"""Full clone audit: every internal link and asset on every page.

Walks each cloned page, collects every href/src/srcset reference, and reports
anything that does not resolve locally. This is the check that catches nav
leftovers, footer links to uncloned pages, and missing media in one pass.
"""
import pathlib
import re

# Resolved dynamically so this works from the site root or from tools/.
_HERE = pathlib.Path(__file__).resolve().parent
BASE = next(
    (p for p in (_HERE, _HERE.parent)
     if all((p / f"{n}.html").exists() for n in ("home", "service", "contact", "pricing"))),
    _HERE.parent,
)
PAGES = ["home.html", "service.html", "contact.html", "pricing.html"]

SKIP_SCHEME = re.compile(r"^(#|javascript:|mailto:|tel:|data:|blob:)", re.I)
SRCSET = re.compile(r'srcset=["\']([^"\']+)["\']', re.I)
HREF = re.compile(r'\bhref=["\']([^"\']+)["\']', re.I)
SRC = re.compile(r'\bsrc=["\']([^"\']+)["\']', re.I)
ACTION = re.compile(r'\baction=["\']([^"\']+)["\']', re.I)


def refs(html: str) -> set[str]:
    out: set[str] = set()
    for pattern in (HREF, SRC, ACTION):
        out.update(pattern.findall(html))
    for group in SRCSET.findall(html):
        for part in group.split(","):
            url = part.strip().split(" ")[0]
            if url:
                out.add(url)
    return out


def exists(path: str) -> bool:
    p = path.split("?")[0].split("#")[0]
    return bool(p) and (BASE / p).exists()


def main() -> int:
    total_bad = 0
    for page in PAGES:
        path = BASE / page
        if not path.exists():
            print(f"{page}: FILE MISSING")
            total_bad += 1
            continue
        html = path.read_text(encoding="utf-8", errors="ignore")

        internal, external, broken = [], 0, []
        for r in sorted(refs(html)):
            if SKIP_SCHEME.match(r) or r.startswith(("http://", "https://", "//")):
                if r.startswith(("http://", "https://")):
                    external += 1
                continue
            internal.append(r)
            if not exists(r):
                broken.append(r)

        # Placeholder leftovers from the original capture.
        placeholders = len(re.findall(r'(?:href|src)="#"', html))

        print(f"\n=== {page} ===")
        print(f"  internal refs : {len(internal)}")
        print(f"  external refs : {external}")
        print(f"  BROKEN        : {len(broken)}")
        for b in broken[:15]:
            print(f"      ! {b}")
        print(f"  '#' placeholders: {placeholders}")
        total_bad += len(broken) + placeholders

    print(f"\nTOTAL PROBLEMS: {total_bad}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
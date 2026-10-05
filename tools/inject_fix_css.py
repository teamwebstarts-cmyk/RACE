#!/usr/bin/env python
"""Inject the clone-fidelity stylesheet as the last <link> in <head>.

Ordering matters: the override has to win over frontend.min.css, which carries
the `.elementor-invisible { visibility:hidden }` rule that blanks the page.
"""
import pathlib
import re

BASE = pathlib.Path(__file__).parent

PAGES = ["home.html", "service.html", "contact.html", "pricing.html"]
TAG = '<link rel="stylesheet" href="css/clone-fidelity-fix.css" media="all">'


def main() -> int:
    for page in PAGES:
        path = BASE / page
        if not path.exists():
            print(f"{page}: missing")
            continue
        html = path.read_text(encoding="utf-8", errors="ignore")
        if TAG in html:
            print(f"{page}: already injected")
            continue
        head = re.search(r"</head>", html, re.I)
        if not head:
            print(f"{page}: no </head>")
            continue
        html = html[: head.start()] + "  " + TAG + "\n" + html[head.start() :]
        path.write_text(html, encoding="utf-8")
        print(f"{page}: injected")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
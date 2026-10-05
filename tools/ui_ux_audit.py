#!/usr/bin/env python
"""UI/UX regression sweep across the four cloned pages.

Checks the things a text-only copy swap can plausibly break:
  - horizontal overflow introduced by longer copy
  - Elementor widgets still stuck invisible
  - broken images
  - text nodes that collapsed to zero height (clipped by a fixed-height box)
  - rendered height drift versus the pre-copy baseline
"""
import asyncio
import json
import pathlib

from playwright.async_api import async_playwright

BASE = pathlib.Path(__file__).parent
PAGES = ["home", "service", "contact", "pricing"]
PORT = 8085

# Heights captured before the RACE copy pass, for drift comparison.
BASELINE = {"home": 9045, "service": 4728, "contact": 4326, "pricing": 4549}

PROBE = """
() => {
  const vw = window.innerWidth;
  const hidden = [...document.querySelectorAll('.elementor-invisible')]
    .filter(e => getComputedStyle(e).visibility === 'hidden').length;
  const brokenImgs = [...document.images]
    .filter(i => i.complete && i.naturalWidth === 0).length;
  // Text that has content but renders at zero height = clipped by a fixed box.
  const collapsed = [...document.querySelectorAll('h1,h2,h3,h4,h5,p,li')]
    .filter(e => e.innerText.trim() && e.getBoundingClientRect().height === 0).length;
  // Elements poking outside the viewport horizontally.
  const wide = [...document.querySelectorAll('body *')]
    .filter(e => { const r = e.getBoundingClientRect();
      return r.width > 0 && (r.right > vw + 2 || r.left < -2); }).length;
  return {
    scrollW: document.documentElement.scrollWidth,
    vw,
    height: document.body.scrollHeight,
    hidden, brokenImgs, collapsed, wide,
  };
}
"""


async def main() -> None:
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1440, "height": 1000})
        rows = []
        for name in PAGES:
            await page.goto(f"http://localhost:{PORT}/{name}.html", wait_until="load")
            await page.wait_for_timeout(2500)
            r = await page.evaluate(PROBE)
            base = BASELINE.get(name, 0)
            drift = r["height"] - base if base else 0
            rows.append((name, r, drift))

            issues = []
            if r["scrollW"] > r["vw"] + 2:
                issues.append(f"H-OVERFLOW {r['scrollW']}>{r['vw']}")
            if r["hidden"]:
                issues.append(f"HIDDEN {r['hidden']}")
            if r["brokenImgs"]:
                issues.append(f"BROKEN-IMG {r['brokenImgs']}")
            if r["collapsed"]:
                issues.append(f"COLLAPSED {r['collapsed']}")
            if r["wide"]:
                issues.append(f"WIDE-ELEM {r['wide']}")
            if base and abs(drift) > 120:
                issues.append(f"HEIGHT-DRIFT {drift:+d}px")

            status = "OK" if not issues else " | ".join(issues)
            print(f"{name:8s} h={r['height']:5d} (drift {drift:+5d})  {status}")

            await page.screenshot(path=str(BASE / "shots" / f"{name}-race.png"),
                                  full_page=False)
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
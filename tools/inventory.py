#!/usr/bin/env python
"""Inventory every piece of visible text in the cloned pages.

Before rewriting copy we need to know exactly how much text sits in each
container, so the replacement can match line and paragraph counts and avoid
shuffling the layout. This walks the rendered DOM (via Playwright) rather than
the raw HTML, so it reports what a visitor actually sees.
"""
import asyncio
import json
import pathlib

from playwright.async_api import async_playwright

BASE = pathlib.Path(__file__).parent
OUT = BASE / "_text_inventory.json"
PAGES = ["home", "service", "contact", "pricing"]
PORT = 8085

SCRIPT = """
() => {
  const out = [];
  const skip = new Set(['SCRIPT','STYLE','NOSCRIPT','SVG','PATH','LINK','META']);
  const walk = (node, path) => {
    for (const child of node.children) {
      const tag = child.tagName;
      if (skip.has(tag)) continue;
      const cls = (child.className && child.className.baseVal !== undefined
        ? child.className.baseVal : child.className || '');
      const key = (child.className || '').toString().split(' ').filter(Boolean)
        .filter(c => !/^(elementor-element|elementor-widget|elementor-element-)/.test(c))
        .slice(0,3).join('.') || tag.toLowerCase();
      const next = path ? path + ' > ' + key : key;
      const text = Array.from(child.childNodes)
        .filter(n => n.nodeType === 3)
        .map(n => n.textContent.trim())
        .filter(Boolean).join(' ').trim();
      if (text) {
        const r = child.getBoundingClientRect();
        out.push({path: next, tag, text, chars: text.length,
                  words: text.split(/\\s+/).length,
                  w: Math.round(r.width), h: Math.round(r.height)});
      }
      walk(child, next);
    }
  };
  walk(document.body, '');
  return out;
}
"""


async def main() -> None:
    result: dict[str, list] = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1440, "height": 1000})
        for name in PAGES:
            await page.goto(f"http://localhost:{PORT}/{name}.html", wait_until="load")
            await page.wait_for_timeout(2500)
            result[name] = await page.evaluate(SCRIPT)
            print(f"{name}: {len(result[name])} text nodes")
        await browser.close()

    OUT.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nwrote {OUT}")

    total_chars = sum(e["chars"] for v in result.values() for e in v)
    print(f"total visible chars: {total_chars:,}")


if __name__ == "__main__":
    asyncio.run(main())
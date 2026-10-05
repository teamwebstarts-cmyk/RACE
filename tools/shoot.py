#!/usr/bin/env python
"""Render each cloned page to PNG so the result can be compared to the live site."""
import asyncio
import pathlib

from playwright.async_api import async_playwright

BASE = pathlib.Path(__file__).parent
SHOTS = BASE / "shots"
PORT = 8085

PAGES = {
    "home": "home.html",
    "service": "service.html",
    "contact": "contact.html",
    "pricing": "pricing.html",
}


async def main() -> None:
    SHOTS.mkdir(exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1440, "height": 1000})
        for name, file in PAGES.items():
            if not (BASE / file).exists():
                print(f"skip {name}: missing {file}")
                continue
            await page.goto(f"http://localhost:{PORT}/{file}", wait_until="load")
            await page.wait_for_timeout(2500)
            # Scroll through so lazy images settle before the shot.
            await page.evaluate(
                "async () => { const h=document.body.scrollHeight;"
                " for (let y=0; y<h; y+=600){ window.scrollTo(0,y);"
                " await new Promise(r=>setTimeout(r,120)); } window.scrollTo(0,0); }"
            )
            await page.wait_for_timeout(1200)
            info = await page.evaluate(
                "() => { const imgs=[...document.images];"
                " const broken=imgs.filter(i=>i.complete && i.naturalWidth===0);"
                " return {imgs: imgs.length, broken: broken.length,"
                " sheets: document.styleSheets.length,"
                " fonts: document.fonts.status,"
                " h: document.body.scrollHeight}; }"
            )
            out = SHOTS / f"{name}.png"
            await page.screenshot(path=str(out), full_page=False)
            print(
                f"{name:8s} imgs={info['imgs']:3d} broken={info['broken']:2d} "
                f"sheets={info['sheets']} fonts={info['fonts']} height={info['h']}"
            )
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
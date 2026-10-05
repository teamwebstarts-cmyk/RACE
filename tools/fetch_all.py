#!/usr/bin/env python
"""Download every image referenced by the live RapidTow pages into images/."""
import concurrent.futures as futures
import pathlib
import re
import urllib.error
import urllib.request

BASE = pathlib.Path(__file__).parent
URL_LIST = BASE / "_asset_urls.txt"

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"


def remote_to_local(url: str) -> pathlib.Path:
    """Strip the host + wp-content prefix so everything lands flat in images/."""
    path = urllib.parse.urlparse(url).path
    name = path.rsplit("/", 1)[-1]
    return BASE / "images" / name


def fetch(url: str) -> tuple[str, str]:
    dest = remote_to_local(url)
    if dest.exists() and dest.stat().st_size > 0:
        return ("skip", url)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            data = r.read()
    except urllib.error.HTTPError as e:
        return (f"http{e.code}", url)
    except Exception as e:
        return (f"err:{type(e).__name__}", url)
    if len(data) < 500:
        return (f"tiny({len(data)})", url)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    return (f"ok({len(data)//1024}KB)", url)


if __name__ == "__main__":
    import urllib.parse

    urls = [
        u for u in URL_LIST.read_text(encoding="utf-8").splitlines()
        if u.strip() and not u.strip().endswith(".css")
    ]
    tally: dict[str, int] = {}
    with futures.ThreadPoolExecutor(max_workers=8) as pool:
        for status, url in pool.map(fetch, urls):
            tally[status.split("(")[0]] = tally.get(status.split("(")[0], 0) + 1
            if not status.startswith(("ok", "skip")):
                print(f"  {status:14s} {url.rsplit('/', 1)[-1]}")
    print("\nTALLY:", tally)
    print(f"TOTAL: {len(urls)}")
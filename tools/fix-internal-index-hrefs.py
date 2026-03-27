#!/usr/bin/env python3
"""Normalize internal hrefs: drop explicit index.html and trailing slash on hub URLs."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Listing hub URLs in absolute form: .../artigos/" -> .../artigos"
HUB_TRAILING = re.compile(
    r"https://web-engenharia\.com/"
    r"((?:en|es|ja|kok|sv)/)?"
    r"(artigos|produtos|boutique-engenharia)/\""
)


def patch_file(path: Path) -> bool:
    raw = path.read_text(encoding="utf-8")
    orig = raw

    raw = raw.replace('href="../index.html#', 'href="../#')
    raw = raw.replace("href='../index.html#", "href='../#")
    raw = raw.replace('href="../index.html"', 'href="../"')
    raw = raw.replace("href='../index.html'", "href='../'")

    # artigos/* listing link (./index.html = folder index without filename in URL)
    raw = raw.replace('href="./index.html#', 'href="./#')
    raw = raw.replace('href="./index.html"', 'href="./"')

    # carreiras.html, termos.html, etc.: sibling index in same folder
    if path.name != "index.html":
        if path.parent == ROOT:
            raw = raw.replace('href="index.html#', 'href="/#')
            raw = raw.replace('href="index.html"', 'href="/"')
        else:
            raw = raw.replace('href="index.html#', 'href="./#')
            raw = raw.replace('href="index.html"', 'href="./"')

    # Root index: section hubs (absolute paths, no index.html)
    if path.name == "index.html" and path.parent == ROOT:
        raw = raw.replace('href="artigos/index.html"', 'href="/artigos"')
        raw = raw.replace('href="produtos/index.html"', 'href="/produtos"')
        raw = raw.replace(
            'href="boutique-engenharia/index.html"', 'href="/boutique-engenharia"'
        )

    # Canonical / hreflang / og:url hub URLs — match sitemap (no trailing slash)
    raw = HUB_TRAILING.sub(
        lambda m: f'https://web-engenharia.com/{m.group(1) or ""}{m.group(2)}"', raw
    )

    if raw != orig:
        path.write_text(raw, encoding="utf-8")
        return True
    return False


def main() -> int:
    changed = 0
    for path in sorted(ROOT.rglob("*.html")):
        if patch_file(path):
            changed += 1
    print(f"Updated {changed} HTML files under {ROOT}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

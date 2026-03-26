#!/usr/bin/env python3
"""Inject hreflang cluster (6 locales, no x-default) into all landing/**/tecnologias/*.html."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://www.web-engenharia.com"
LOCALES = ("en", "es", "ja", "kok", "sv")


def urls_for_slug(filename: str) -> list[tuple[str, str]]:
    """(hreflang, url) matching sitemap tecnologias blocks. filename includes .html."""
    out = [("pt-BR", f"{BASE}/tecnologias/{filename}")]
    for loc in LOCALES:
        out.append((loc, f"{BASE}/{loc}/tecnologias/{filename}"))
    return out


def hreflang_block(filename: str) -> str:
    lines = [
        f'    <link rel="alternate" hreflang="{hl}" href="{url}" />'
        for hl, url in urls_for_slug(filename)
    ]
    return "\n".join(lines)


def strip_hreflang_lines(text: str) -> str:
    out = []
    for line in text.splitlines():
        if re.search(r'<link\s+rel="alternate"\s+hreflang=', line, re.I):
            continue
        out.append(line)
    return "\n".join(out)


def patch_file(path: Path) -> bool:
    filename = path.name
    if not filename.endswith(".html") or filename.startswith("_"):
        return False
    original = path.read_text(encoding="utf-8")
    text = strip_hreflang_lines(original)
    block = hreflang_block(filename)
    canon_re = re.compile(
        r'(<link\s+rel="canonical"\s+href="[^"]+"\s*/>)',
        re.IGNORECASE,
    )
    if not canon_re.search(text):
        raise RuntimeError(f"No canonical in {path}")
    new = canon_re.sub(r"\1\n" + block, text, count=1)
    if new == original:
        return False
    path.write_text(new, encoding="utf-8")
    return True


def main() -> None:
    count = 0
    for p in sorted(ROOT.rglob("tecnologias/*.html")):
        if p.name.startswith("_"):
            continue
        if patch_file(p):
            count += 1
    print(f"Patched {count} tecnologias/*.html files.")


if __name__ == "__main__":
    main()

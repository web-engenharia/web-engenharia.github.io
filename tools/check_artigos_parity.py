#!/usr/bin/env python3
"""Exit with non-zero if locale artigos/*.html slugs differ from PT (excluding _template)."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PT_DIR = ROOT / "artigos"
LOCALES = ("en", "es", "ja", "kok", "sv")


def slugs() -> set[str]:
    out: set[str] = set()
    for p in PT_DIR.glob("*.html"):
        if p.name.startswith("_"):
            continue
        if p.name == "index.html":
            continue
        out.add(p.name)
    return out


def main() -> int:
    expected = slugs()
    err = 0
    for loc in LOCALES:
        d = ROOT / loc / "artigos"
        got = {p.name for p in d.glob("*.html") if p.name != "index.html"}
        missing = expected - got
        extra = got - expected
        if missing or extra:
            err += 1
            print(f"[{loc}] missing: {sorted(missing)} extra: {sorted(extra)}", file=sys.stderr)
    if err == 0:
        print("artigos parity OK:", len(expected), "articles x", len(LOCALES), "locales")
    return 1 if err else 0


if __name__ == "__main__":
    sys.exit(main())

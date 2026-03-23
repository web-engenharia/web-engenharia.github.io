#!/usr/bin/env python3
"""Insert newlines before opening ```lang fences when merged with preceding text (translation artifact)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def fix(text: str) -> str:
    # Opening fence: non-newline char immediately before ```word
    return re.sub(r"([^\n])```(\w)", r"\1\n\n```\2", text)


def main() -> None:
    dirs = [ROOT / "en" / "artigos" / "markdown", ROOT / "es" / "artigos" / "markdown", ROOT / "ja" / "artigos" / "markdown", ROOT / "kok" / "artigos" / "markdown", ROOT / "sv" / "artigos" / "markdown"]
    for d in dirs:
        if not d.is_dir():
            continue
        for p in sorted(d.glob("*.md")):
            raw = p.read_text(encoding="utf-8")
            fixed = fix(raw)
            if fixed != raw:
                p.write_text(fixed, encoding="utf-8")
                print("fixed", p)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Add hreflang, og:locale, and in-page language links to PT article HTML files."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://www.web-engenharia.com"

SLUGS = [
    "otp-elixir-escolha-aplicacoes-criticas",
    "construindo-sistemas-resilientes-eventos-cqrs",
    "alem-do-hype-arquiteturas-cognitivas-llms",
    "metrica-invisivel-saude-bem-estar-desenvolvedor-qualidade-codigo",
]


def hreflang(slug: str) -> str:
    h = f"{BASE}/artigos/{slug}.html"
    return f"""    <link rel="alternate" hreflang="x-default" href="{h}" />
    <link rel="alternate" hreflang="pt-BR" href="{h}" />
    <link rel="alternate" hreflang="en" href="{BASE}/en/artigos/{slug}.html" />
    <link rel="alternate" hreflang="es" href="{BASE}/es/artigos/{slug}.html" />
    <link rel="alternate" hreflang="ja" href="{BASE}/ja/artigos/{slug}.html" />
    <link rel="alternate" hreflang="kok" href="{BASE}/kok/artigos/{slug}.html" />
    <link rel="alternate" hreflang="sv" href="{BASE}/sv/artigos/{slug}.html" />"""


def og_locale_block() -> str:
    return """    <meta property="og:locale" content="pt_BR" />
    <meta property="og:locale:alternate" content="en_US" />
    <meta property="og:locale:alternate" content="es_ES" />
    <meta property="og:locale:alternate" content="ja_JP" />
    <meta property="og:locale:alternate" content="kok" />
    <meta property="og:locale:alternate" content="sv_SE" />"""


def lang_row(slug: str) -> str:
    s = f"{slug}.html"
    return f"""      <nav class="mt-4 flex flex-wrap gap-2 text-xs text-brand-dark/70" aria-label="Outras línguas">
        <span class="font-medium text-brand-dark/80">Outras línguas:</span>
        <a hreflang="pt-BR" class="underline hover:text-brand-mid" href="./{s}">PT</a>
        <span aria-hidden="true">·</span>
        <a hreflang="en" class="underline hover:text-brand-mid" href="../en/artigos/{s}">EN</a>
        <span aria-hidden="true">·</span>
        <a hreflang="es" class="underline hover:text-brand-mid" href="../es/artigos/{s}">ES</a>
        <span aria-hidden="true">·</span>
        <a hreflang="ja" class="underline hover:text-brand-mid" href="../ja/artigos/{s}">日本語</a>
        <span aria-hidden="true">·</span>
        <a hreflang="kok" class="underline hover:text-brand-mid" href="../kok/artigos/{s}">Konknni</a>
        <span aria-hidden="true">·</span>
        <a hreflang="sv" class="underline hover:text-brand-mid" href="../sv/artigos/{s}">SV</a>
      </nav>"""


def patch_file(path: Path, slug: str) -> None:
    text = path.read_text(encoding="utf-8")
    if 'hreflang="en"' in text and "Outras línguas" in text:
        print("skip (already patched)", path)
        return

    # After canonical line
    canon = f'<link rel="canonical" href="{BASE}/artigos/{slug}.html" />'
    if canon not in text:
        raise SystemExit(f"canonical not found: {path}")
    text = text.replace(canon, canon + "\n" + hreflang(slug), 1)

    # After og:image (first occurrence)
    og_img = '    <meta property="og:image" content="https://www.web-engenharia.com/images/web-engenharia-og.png" />'
    if og_img in text and "og:locale" not in text:
        text = text.replace(og_img, og_img + "\n\n" + og_locale_block(), 1)

    # After breadcrumb closing </nav> — insert before <article or main content
    breadcrumb_end = '      </nav>\n\n      <article'
    if breadcrumb_end in text and "Outras línguas" not in text:
        text = text.replace(
            breadcrumb_end,
            "      </nav>\n\n" + lang_row(slug) + "\n\n      <article",
            1,
        )

    path.write_text(text, encoding="utf-8")
    print("patched", path)


def main() -> None:
    for slug in SLUGS:
        patch_file(ROOT / "artigos" / f"{slug}.html", slug)


if __name__ == "__main__":
    main()

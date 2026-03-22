#!/usr/bin/env python3
"""One-shot: add sv hreflang, og:locale:alternate sv_SE, and SV nav link to landing HTML (excl. sv/, animacao_svg/, tools/)."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SKIP = {"sv", "animacao_svg", "tools"}


def public_sv_url(path: Path) -> str:
    rel = path.relative_to(ROOT)
    if rel.name == "index.html":
        return "https://www.web-engenharia.com/sv/"
    return f"https://www.web-engenharia.com/sv/{rel.name}"


def rel_href_to_sv(path: Path) -> str:
    rel = path.relative_to(ROOT)
    if rel.parent == Path("."):
        return f"sv/{rel.name}" if rel.name != "index.html" else "sv/"
    if rel.name == "index.html":
        return "../sv/"
    return f"../sv/{rel.name}"


def patch_text(path: Path, t: str) -> str:
    sv_alt_line = f'    <link rel="alternate" hreflang="sv" href="{public_sv_url(path)}" />'

    if 'hreflang="sv"' not in t and 'hreflang="kok"' in t:
        t = re.sub(
            r'(<link rel="alternate" hreflang="kok" href="[^"]+"\s*/>)',
            r"\1\n" + sv_alt_line,
            t,
            count=1,
        )

    if "sv_SE" not in t and '<meta property="og:locale:alternate" content="kok"' in t:
        t = t.replace(
            '<meta property="og:locale:alternate" content="kok" />',
            '<meta property="og:locale:alternate" content="kok" />\n    <meta property="og:locale:alternate" content="sv_SE" />',
            1,
        )
    elif "sv_SE" not in t and '<meta property="og:locale:alternate" content="ja"' in t and "og:locale:alternate" in t:
        # some pages only have ja as last alternate before image
        t = t.replace(
            '<meta property="og:locale:alternate" content="ja" />',
            '<meta property="og:locale:alternate" content="ja" />\n    <meta property="og:locale:alternate" content="sv_SE" />',
            1,
        )

    href_sv = rel_href_to_sv(path)
    # Desktop nav after Konknni link
    if "Konknni</a>" in t and f'href="{href_sv}"' not in t:
        extra = (
            '\n            <span class="text-brand-circuit/50" aria-hidden="true">|</span>\n'
            f'            <a href="{href_sv}" class="rounded px-2 py-1 text-sm font-medium text-brand-dark/80 transition-colors hover:bg-brand-pulse/40 hover:text-brand-dark" hreflang="sv">SV</a>'
        )
        # legal simple header uses slightly different classes
        extra_loose = (
            '\n            <span class="text-brand-circuit/50">|</span>\n'
            f'            <a href="{href_sv}" class="rounded px-2 py-1 text-brand-dark/80 hover:bg-brand-pulse/40 hover:text-brand-dark" hreflang="sv">SV</a>'
        )
        if 'class="rounded px-2 py-1 text-sm font-medium' in t and "Konknni</a>" in t:
            t = t.replace(
                'class="rounded px-2 py-1 text-sm font-medium text-brand-dark/80 transition-colors hover:bg-brand-pulse/40 hover:text-brand-dark" hreflang="kok">Konknni</a>',
                'class="rounded px-2 py-1 text-sm font-medium text-brand-dark/80 transition-colors hover:bg-brand-pulse/40 hover:text-brand-dark" hreflang="kok">Konknni</a>'
                + extra,
                1,
            )
        elif "Konknni</a>" in t:
            t = t.replace("Konknni</a>", "Konknni</a>" + extra_loose, 1)

    # kok index: current page is span Konknni
    if '<span class="px-2 py-1 text-sm font-medium text-brand-dark" aria-current="page">Konknni</span>' in t and f'href="{href_sv}"' not in t:
        t = t.replace(
            '<span class="px-2 py-1 text-sm font-medium text-brand-dark" aria-current="page">Konknni</span>',
            '<span class="px-2 py-1 text-sm font-medium text-brand-dark" aria-current="page">Konknni</span>'
            + '\n            <span class="text-brand-circuit/50" aria-hidden="true">|</span>\n'
            f'            <a href="{href_sv}" class="rounded px-2 py-1 text-sm font-medium text-brand-dark/80 transition-colors hover:bg-brand-pulse/40 hover:text-brand-dark" hreflang="sv">SV</a>',
            1,
        )

    return t


def main():
    for path in sorted(ROOT.rglob("*.html")):
        if any(p in SKIP for p in path.parts):
            continue
        raw = path.read_text(encoding="utf-8")
        new = patch_text(path, raw)
        if new != raw:
            path.write_text(new, encoding="utf-8")
            print("updated", path.relative_to(ROOT))


if __name__ == "__main__":
    main()

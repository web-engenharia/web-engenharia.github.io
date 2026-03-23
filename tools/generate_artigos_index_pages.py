#!/usr/bin/env python3
"""Generate landing/{en,es,ja,kok,sv}/artigos/index.html listing four articles with hreflang."""
from __future__ import annotations

import html
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

SLUG_CAT = {
    "otp-elixir-escolha-aplicacoes-criticas": "otp",
    "construindo-sistemas-resilientes-eventos-cqrs": "cqrs",
    "alem-do-hype-arquiteturas-cognitivas-llms": "llm",
    "metrica-invisivel-saude-bem-estar-desenvolvedor-qualidade-codigo": "metrica",
}

CATEGORIES = {
    "en": {
        "otp": "Architecture · Reliability",
        "cqrs": "Architecture · Modernization",
        "llm": "Trends · Applied AI",
        "metrica": "Engineering · Software quality",
    },
    "es": {
        "otp": "Arquitectura · Fiabilidad",
        "cqrs": "Arquitectura · Modernización",
        "llm": "Tendencias · IA aplicada",
        "metrica": "Ingeniería · Calidad de software",
    },
    "ja": {
        "otp": "アーキテクチャ · 信頼性",
        "cqrs": "アーキテクチャ · モダナイゼーション",
        "llm": "トレンド · 応用AI",
        "metrica": "エンジニアリング · ソフトウェア品質",
    },
    "kok": {
        "otp": "Arkitetura · Vishvas",
        "cqrs": "Arkitetura · Navikaran",
        "llm": "Ruj · Lago AI",
        "metrica": "Engenher · Software gunott",
    },
    "sv": {
        "otp": "Arkitektur · Tillförlitlighet",
        "cqrs": "Arkitektur · Modernisering",
        "llm": "Trender · Tillämpad AI",
        "metrica": "Teknik · Programvarukvalitet",
    },
}

CONFIG = {
    "en": {
        "lang": "en",
        "title": "Articles | Web-Engenharia",
        "desc": "Technical articles on architecture, modernization, integration, and outcome-driven delivery.",
        "h1": "Articles",
        "intro": "Publications for technology teams that need to scale predictably, reduce risk, and accelerate delivery.",
        "h2": "Latest articles",
        "card_read": "Read",
        "card_updated": "Updated",
        "skip": "Skip to content",
        "home": "Home",
        "footer_privacy": "Privacy",
    },
    "es": {
        "lang": "es",
        "title": "Artículos | Web-Engenharia",
        "desc": "Artículos técnicos sobre arquitectura, modernización, integración y entrega orientada a resultados.",
        "h1": "Artículos",
        "intro": "Contenido para equipos de tecnología que necesitan escalar con previsibilidad, reducir riesgos y acelerar entregas.",
        "h2": "Últimos artículos",
        "card_read": "Lectura",
        "card_updated": "Actualizado",
        "skip": "Ir al contenido",
        "home": "Inicio",
        "footer_privacy": "Privacidad",
    },
    "ja": {
        "lang": "ja",
        "title": "記事 | Web-Engenharia",
        "desc": "アーキテクチャ、モダナイゼーション、統合、成果志向のデリバリーに関する技術記事。",
        "h1": "記事",
        "intro": "予測可能にスケールし、リスクを抑え、リリースを加速したい技術チーム向けのコンテンツです。",
        "h2": "最新記事",
        "card_read": "読了目安",
        "card_updated": "更新",
        "skip": "本文へ",
        "home": "ホーム",
        "footer_privacy": "プライバシー",
    },
    "kok": {
        "lang": "kok",
        "title": "Lekh | Web-Engenharia",
        "desc": "Arkitetura, navikaran, integrashon ani resultad-axil delivericher vixei teknik lekh.",
        "h1": "Lekh",
        "intro": "Tech timank predict korcha scale, risk kumovnk ani release veg korunk zai tenna khathir lekh.",
        "h2": "Nove lekh",
        "card_read": "Vach",
        "card_updated": "Sudarle",
        "skip": "Sumir mhollar",
        "home": "Mukhar",
        "footer_privacy": "Gupitponn",
    },
    "sv": {
        "lang": "sv",
        "title": "Artiklar | Web-Engenharia",
        "desc": "Tekniska artiklar om arkitektur, modernisering, integration och resultatorienterad leverans.",
        "h1": "Artiklar",
        "intro": "Publicerat för teknikteam som behöver skala förutsägbart, minska risk och snabba upp leveranser.",
        "h2": "Senaste artiklar",
        "card_read": "Lästid",
        "card_updated": "Uppdaterad",
        "skip": "Hoppa till innehåll",
        "home": "Hem",
        "footer_privacy": "Integritet",
    },
}

READ_MIN = {"otp-elixir-escolha-aplicacoes-criticas": 12, "construindo-sistemas-resilientes-eventos-cqrs": 11, "alem-do-hype-arquiteturas-cognitivas-llms": 16, "metrica-invisivel-saude-bem-estar-desenvolvedor-qualidade-codigo": 15}


def strip_title(line: str) -> str:
    s = re.sub(r"^#\s*", "", line.strip())
    return s.replace("**", "").strip()


def first_para_desc(lines: list[str]) -> str:
    i = 0
    while i < len(lines) and not lines[i].strip():
        i += 1
    if i < len(lines) and lines[i].startswith("#"):
        i += 1
    while i < len(lines) and not lines[i].strip():
        i += 1
    parts: list[str] = []
    while i < len(lines) and lines[i].strip() and not lines[i].startswith("#"):
        parts.append(lines[i].strip())
        i += 1
    text = " ".join(parts)
    if len(text) > 220:
        text = text[:217].rsplit(" ", 1)[0] + "…"
    return text


def card_category(locale: str, slug: str) -> str:
    key = SLUG_CAT[slug]
    return CATEGORIES[locale][key]


def render(locale: str) -> str:
    C = CONFIG[locale]
    canonical = f"{BASE}/{locale}/artigos/"
    cards_html = []
    for slug in SLUGS:
        md = ROOT / locale / "artigos" / "markdown" / f"{slug}.md"
        lines = md.read_text(encoding="utf-8").splitlines()
        title = strip_title(lines[0]) if lines else slug
        blurb = first_para_desc(lines)
        cat = card_category(locale, slug)
        rm = READ_MIN[slug]
        href = f"./{slug}.html"
        cards_html.append(
            f"""          <article class="rounded-2xl border border-brand-circuit/35 bg-white p-6 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-wide text-brand-mid">{html.escape(cat)}</p>
            <h3 class="mt-2 font-display text-xl font-semibold text-brand-dark">
              <a href="{href}" class="hover:text-brand-mid">{html.escape(title)}</a>
            </h3>
            <p class="mt-3 text-sm text-brand-dark/80">{html.escape(blurb)}</p>
            <p class="mt-4 text-xs text-brand-dark/60">{C["card_read"]}: {rm} min · {C["card_updated"]} 2026-03-23</p>
          </article>"""
        )

    cards_block = "\n\n".join(cards_html)
    return f"""<!DOCTYPE html>
<html class="scroll-smooth" lang="{C["lang"]}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{html.escape(C["title"])}</title>
    <meta name="description" content="{html.escape(C["desc"])}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="{canonical}" />
    <link rel="alternate" hreflang="x-default" href="{BASE}/artigos/" />
    <link rel="alternate" hreflang="pt-BR" href="{BASE}/artigos/" />
    <link rel="alternate" hreflang="en" href="{BASE}/en/artigos/" />
    <link rel="alternate" hreflang="es" href="{BASE}/es/artigos/" />
    <link rel="alternate" hreflang="ja" href="{BASE}/ja/artigos/" />
    <link rel="alternate" hreflang="kok" href="{BASE}/kok/artigos/" />
    <link rel="alternate" hreflang="sv" href="{BASE}/sv/artigos/" />
    <meta property="og:title" content="{html.escape(C["title"])}" />
    <meta property="og:description" content="{html.escape(C["desc"])}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="{canonical}" />
    <meta property="og:image" content="{BASE}/images/web-engenharia-og.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="../../favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="../../css/tailwind.min.css" />
    <link rel="stylesheet" href="../../css/landing.css" />
  </head>
  <body class="bg-white font-sans text-brand-dark antialiased">
    <a href="#inicio" class="skip-link">{html.escape(C["skip"])}</a>
    <header class="border-b border-brand-circuit/30 bg-white/90 py-4" role="banner">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 sm:px-6">
        <a href="../index.html" class="font-display text-lg font-semibold text-brand-dark">Web-Engenharia</a>
        <a href="../index.html" class="text-sm font-medium text-brand-mid hover:text-brand-dark">{html.escape(C["home"])}</a>
      </div>
    </header>
    <main id="inicio" class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 class="font-display text-3xl font-bold text-brand-dark">{html.escape(C["h1"])}</h1>
      <p class="mt-3 max-w-3xl text-brand-dark/75">{html.escape(C["intro"])}</p>
      <section class="mt-8" aria-labelledby="lista-artigos-heading">
        <h2 id="lista-artigos-heading" class="font-display text-2xl font-semibold text-brand-dark">{html.escape(C["h2"])}</h2>
        <div class="mt-6 grid gap-6 md:grid-cols-2">
{cards_block}
        </div>
      </section>
    </main>
    <footer class="border-t border-brand-circuit/30 bg-brand-dark py-8 text-brand-pulse/90" role="contentinfo">
      <div class="mx-auto max-w-6xl px-4 text-sm sm:px-6">
        <a href="../index.html" class="hover:text-white">{html.escape(C["home"])}</a>
        <span class="mx-2 text-brand-circuit/60">·</span>
        <a href="../privacidade.html" class="hover:text-white">{html.escape(C["footer_privacy"])}</a>
      </div>
    </footer>
  </body>
</html>
"""


def main() -> None:
    for loc in CONFIG:
        out = ROOT / loc / "artigos" / "index.html"
        out.write_text(render(loc), encoding="utf-8")
        print(out)


if __name__ == "__main__":
    main()

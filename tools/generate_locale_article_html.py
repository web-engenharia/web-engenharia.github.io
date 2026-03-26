#!/usr/bin/env python3
"""
Generate localized article HTML shells under landing/{en,es,ja,kok,sv}/artigos/
Paths: CSS ../../css/, JS ../../artigos/js/render-markdown.js, md ./markdown/<file>.md
"""
from __future__ import annotations

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://www.web-engenharia.com"

LOCALES = {
    "en": {
        "lang": "en",
        "dir": "ltr",
        "og_locale": "en_US",
        "skip": "Skip to content",
        "all_articles": "All articles",
        "home": "Home",
        "articles": "Articles",
        "loading": "Loading article content…",
        "author": "Author: Matheus de Camargo Marques — Software Engineer, DevOps",
        "updated": "Updated",
        "read": "Read",
        "min": "min",
        "cta_title": "Want to apply this in your context?",
        "cta_body": "We work with your team to turn guidance into an executable plan with technical and business goals.",
        "cta_btn": "Talk to specialists",
        "footer_home": "Home",
        "footer_privacy": "Privacy",
        "footer_cookies": "Cookies",
        "footer_terms": "Terms",
        "lang_label": "Other languages",
    },
    "es": {
        "lang": "es",
        "dir": "ltr",
        "og_locale": "es_ES",
        "skip": "Ir al contenido",
        "all_articles": "Todos los artículos",
        "home": "Inicio",
        "articles": "Artículos",
        "loading": "Cargando contenido del artículo…",
        "author": "Autor: Matheus de Camargo Marques — Ingeniero de software DevOps",
        "updated": "Actualizado",
        "read": "Lectura",
        "min": "min",
        "cta_title": "¿Quieres aplicar esto en tu contexto?",
        "cta_body": "Hablamos con tu equipo para convertir directrices en un plan ejecutable, con metas técnicas y de negocio.",
        "cta_btn": "Hablar con especialistas",
        "footer_home": "Inicio",
        "footer_privacy": "Privacidad",
        "footer_cookies": "Cookies",
        "footer_terms": "Términos",
        "lang_label": "Otros idiomas",
    },
    "ja": {
        "lang": "ja",
        "dir": "ltr",
        "og_locale": "ja_JP",
        "skip": "本文へスキップ",
        "all_articles": "記事一覧",
        "home": "ホーム",
        "articles": "記事",
        "loading": "記事を読み込み中…",
        "author": "著者: Matheus de Camargo Marques — ソフトウェアエンジニア（DevOps）",
        "updated": "更新",
        "read": "読了目安",
        "min": "分",
        "cta_title": "自社の文脈で活かしたいですか？",
        "cta_body": "チームと対話し、指針を技術・事業目標のある実行計画に落とし込みます。",
        "cta_btn": "専門家に相談",
        "footer_home": "ホーム",
        "footer_privacy": "プライバシー",
        "footer_cookies": "クッキー",
        "footer_terms": "利用規約",
        "lang_label": "他の言語",
    },
    "kok": {
        "lang": "kok",
        "dir": "ltr",
        "og_locale": "kok_IN",
        "skip": "Sumir mhollar",
        "all_articles": "Soglleo lekh",
        "home": "Mukhar",
        "articles": "Lekh",
        "loading": "Lekh load zata…",
        "author": "Lekhak: Matheus de Camargo Marques — Software Engineer DevOps",
        "updated": "Sudarle",
        "read": "Vach",
        "min": "min",
        "cta_title": "Tumchea kontextant hacho kortolem?",
        "cta_body": "Tumchea tim sangata amkam uloi, nirdeshank karyanvoy nakachem plan korunk.",
        "cta_btn": "Tajnya sangata uloi",
        "footer_home": "Mukhar",
        "footer_privacy": "Gupitponn",
        "footer_cookies": "Cookies",
        "footer_terms": "Nem",
        "lang_label": "Her bhas",
    },
    "sv": {
        "lang": "sv",
        "dir": "ltr",
        "og_locale": "sv_SE",
        "skip": "Hoppa till innehåll",
        "all_articles": "Alla artiklar",
        "home": "Hem",
        "articles": "Artiklar",
        "loading": "Laddar artikel…",
        "author": "Författare: Matheus de Camargo Marques — mjukvaruingenjör, DevOps",
        "updated": "Uppdaterad",
        "read": "Lästid",
        "min": "min",
        "cta_title": "Vill ni tillämpa detta hos er?",
        "cta_body": "Vi pratar med ert team och gör riktlinjer till en genomförbar plan med tekniska och affärsmässiga mål.",
        "cta_btn": "Prata med specialister",
        "footer_home": "Hem",
        "footer_privacy": "Integritet",
        "footer_cookies": "Cookies",
        "footer_terms": "Villkor",
        "lang_label": "Andra språk",
    },
}

# slug -> (md file, read_min, extra_hljs list, category key for display)
ARTICLES: dict[str, tuple[str, int, list[str], str]] = {
    "otp-elixir-escolha-aplicacoes-criticas": ("otp-elixir-escolha-aplicacoes-criticas.md", 12, ["elixir"], "otp"),
    "construindo-sistemas-resilientes-eventos-cqrs": ("construindo-sistemas-resilientes-eventos-cqrs.md", 11, ["elixir", "java", "typescript"], "cqrs"),
    "alem-do-hype-arquiteturas-cognitivas-llms": ("alem-do-hype-arquiteturas-cognitivas-llms.md", 16, ["elixir"], "llm"),
    "metrica-invisivel-saude-bem-estar-desenvolvedor-qualidade-codigo": ("metrica-invisivel-saude-bem-estar-desenvolvedor-qualidade-codigo.md", 15, ["elixir"], "metrica"),
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
        "otp": "Architecture · Reliability",
        "cqrs": "Architecture · Modernization",
        "llm": "Trends · Applied AI",
        "metrica": "Engineering · Software quality",
    },
    "sv": {
        "otp": "Arkitektur · Tillförlitlighet",
        "cqrs": "Arkitektur · Modernisering",
        "llm": "Trender · Tillämpad AI",
        "metrica": "Teknik · Programvarukvalitet",
    },
}


def strip_md_title(line: str) -> str:
    s = line.strip()
    s = re.sub(r"^#\s*", "", s)
    s = s.replace("**", "").strip()
    return s


def first_para_desc(lines: list[str]) -> str:
    i = 0
    while i < len(lines) and not lines[i].strip():
        i += 1
    if i < len(lines) and lines[i].startswith("#"):
        i += 1
    while i < len(lines) and not lines[i].strip():
        i += 1
    # Skip subheadings (## …) so we still find body text when the intro is a section title.
    while i < len(lines) and lines[i].strip().startswith("#"):
        i += 1
        while i < len(lines) and not lines[i].strip():
            i += 1
    parts: list[str] = []
    while i < len(lines) and lines[i].strip() and not lines[i].startswith("#"):
        parts.append(lines[i].strip())
        i += 1
    text = " ".join(parts)
    if len(text) > 165:
        text = text[:162].rsplit(" ", 1)[0] + "…"
    return text


def hreflang_block(slug_html: str, canonical: str) -> str:
    return f"""    <link rel="canonical" href="{canonical}" />
    <link rel="alternate" hreflang="x-default" href="{BASE}/artigos/{slug_html}" />
    <link rel="alternate" hreflang="pt-BR" href="{BASE}/artigos/{slug_html}" />
    <link rel="alternate" hreflang="en" href="{BASE}/en/artigos/{slug_html}" />
    <link rel="alternate" hreflang="es" href="{BASE}/es/artigos/{slug_html}" />
    <link rel="alternate" hreflang="ja" href="{BASE}/ja/artigos/{slug_html}" />
    <link rel="alternate" hreflang="kok" href="{BASE}/kok/artigos/{slug_html}" />
    <link rel="alternate" hreflang="sv" href="{BASE}/sv/artigos/{slug_html}" />"""


def lang_links_row(slug_html: str, lang_label: str) -> str:
    return f"""      <nav class="mt-4 flex flex-wrap gap-2 text-xs text-brand-dark/70" aria-label="{html.escape(lang_label)}">
        <span class="font-medium text-brand-dark/80">{html.escape(lang_label)}:</span>
        <a hreflang="pt-BR" class="underline hover:text-brand-mid" href="../../artigos/{slug_html}">PT</a>
        <span aria-hidden="true">·</span>
        <a hreflang="en" class="underline hover:text-brand-mid" href="../../en/artigos/{slug_html}">EN</a>
        <span aria-hidden="true">·</span>
        <a hreflang="es" class="underline hover:text-brand-mid" href="../../es/artigos/{slug_html}">ES</a>
        <span aria-hidden="true">·</span>
        <a hreflang="ja" class="underline hover:text-brand-mid" href="../../ja/artigos/{slug_html}">日本語</a>
        <span aria-hidden="true">·</span>
        <a hreflang="kok" class="underline hover:text-brand-mid" href="../../kok/artigos/{slug_html}">Konknni</a>
        <span aria-hidden="true">·</span>
        <a hreflang="sv" class="underline hover:text-brand-mid" href="../../sv/artigos/{slug_html}">SV</a>
      </nav>"""


def hljs_scripts(extra: list[str]) -> str:
    lines = []
    for lang in extra:
        lines.append(
            f'    <script defer src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/languages/{lang}.min.js"></script>'
        )
    return "\n".join(lines)


def render(locale: str, slug: str) -> str:
    L = LOCALES[locale]
    md_file, read_min, extra_hljs, cat_key = ARTICLES[slug]
    md_path = ROOT / locale / "artigos" / "markdown" / md_file
    if not md_path.exists():
        raise FileNotFoundError(f"Missing {md_path} — run translate_article_md.py first")
    lines = md_path.read_text(encoding="utf-8").splitlines()
    title = strip_md_title(lines[0]) if lines else slug
    desc = first_para_desc(lines)
    cat = CATEGORIES[locale][cat_key]
    slug_html = f"{slug}.html"
    canonical = f"{BASE}/{locale}/artigos/{slug_html}"

    og_alt = """
    <meta property="og:locale:alternate" content="pt_BR" />
    <meta property="og:locale:alternate" content="en_US" />
    <meta property="og:locale:alternate" content="es_ES" />
    <meta property="og:locale:alternate" content="ja_JP" />
    <meta property="og:locale:alternate" content="kok" />
    <meta property="og:locale:alternate" content="sv_SE" />"""

    breadcrumb_short = title.split(":")[0][:48] + ("…" if len(title) > 48 else "")
    title_e = html.escape(title)
    desc_e = html.escape(desc)
    cat_e = html.escape(cat)
    crumb_e = html.escape(breadcrumb_short)

    return f"""<!DOCTYPE html>
<html class="scroll-smooth" lang="{L["lang"]}" dir="{L["dir"]}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title_e} | Web-Engenharia</title>
    <meta name="description" content="{desc_e}" />
    <meta name="author" content="Matheus de Camargo Marques" />
    <meta name="robots" content="index, follow" />
{hreflang_block(slug_html, canonical)}
    <meta property="og:title" content="{title_e} | Web-Engenharia" />
    <meta property="og:description" content="{desc_e}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="{canonical}" />
    <meta property="article:published_time" content="2026-03-23T12:00:00+00:00" />
    <meta property="article:modified_time" content="2026-03-23T12:00:00+00:00" />
    <meta property="og:image" content="{BASE}/images/web-engenharia-og.png" />
    <meta property="og:locale" content="{L["og_locale"]}" />
{og_alt}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{title_e} | Web-Engenharia" />
    <meta name="twitter:description" content="{desc_e}" />
    <meta name="twitter:image" content="{BASE}/images/web-engenharia-og.png" />
    <link rel="icon" href="../../favicon.ico" type="image/x-icon" />
    <link rel="preload" href="../../css/tailwind.min.css" as="style" />
    <link rel="preload" href="../../css/landing.css" as="style" />
    <link rel="stylesheet" href="../../css/tailwind.min.css" />
    <link rel="stylesheet" href="../../css/landing.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github-dark.min.css" />
    <script defer src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/dompurify/dist/purify.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js"></script>
{hljs_scripts(extra_hljs)}
    <script defer src="../../artigos/js/render-markdown.js"></script>
  </head>
  <body class="bg-white font-sans text-brand-dark antialiased">
    <a href="#inicio" class="skip-link">{L["skip"]}</a>
    <header class="border-b border-brand-circuit/30 bg-white/90 py-4" role="banner">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 sm:px-6">
        <a href="../index.html" class="font-display text-lg font-semibold text-brand-dark">Web-Engenharia</a>
        <div class="flex items-center gap-2">
          <a href="./index.html" class="text-sm font-medium text-brand-mid hover:text-brand-dark">{L["all_articles"]}</a>
          <a href="../index.html" class="text-sm font-medium text-brand-mid hover:text-brand-dark">{L["home"]}</a>
        </div>
      </div>
    </header>
    <main id="inicio" class="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <nav class="mb-2 text-xs text-brand-dark/60" aria-label="Breadcrumb">
        <a href="../index.html" class="hover:text-brand-dark">{L["home"]}</a>
        <span class="mx-2" aria-hidden="true">·</span>
        <a href="./index.html" class="hover:text-brand-dark">{L["articles"]}</a>
        <span class="mx-2" aria-hidden="true">·</span>
        <span aria-current="page" class="text-brand-dark/80">{crumb_e}</span>
      </nav>
{lang_links_row(slug_html, L["lang_label"])}
      <article data-md="./markdown/{md_file}">
        <header class="mt-6 rounded-2xl border border-brand-circuit/35 bg-white p-6 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-brand-mid">{cat_e}</p>
          <h1 class="mt-2 font-display text-3xl font-bold text-brand-dark">{title_e}</h1>
          <p class="mt-3 text-base text-brand-dark/75">{desc_e}</p>
          <div class="mt-4 flex flex-wrap items-center gap-3 text-xs text-brand-dark/65">
            <span>{L["author"]}</span>
            <span aria-hidden="true">·</span>
            <span>{L["updated"]}: 2026-03-23</span>
            <span aria-hidden="true">·</span>
            <span>{L["read"]}: {read_min} {L["min"]}</span>
          </div>
        </header>
        <div class="article-content mt-8 text-base leading-8 text-brand-dark/85">
          <p class="rounded-lg border border-brand-circuit/35 bg-white p-4 text-sm text-brand-dark/70">{L["loading"]}</p>
        </div>
        <section class="mt-10 rounded-2xl border border-brand-circuit/35 bg-white p-6 shadow-sm" aria-labelledby="cta-heading">
          <h2 id="cta-heading" class="font-display text-xl font-semibold text-brand-dark">{L["cta_title"]}</h2>
          <p class="mt-2 text-sm text-brand-dark/80">{L["cta_body"]}</p>
          <a href="../index.html#contato" class="mt-4 inline-flex items-center rounded-lg bg-brand-dark px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-mid">{L["cta_btn"]}</a>
        </section>
      </article>
    </main>
    <footer class="border-t border-brand-circuit/30 bg-brand-dark py-8 text-brand-pulse/90" role="contentinfo">
      <div class="mx-auto max-w-6xl px-4 text-sm sm:px-6">
        <a href="../index.html" class="hover:text-white">{L["footer_home"]}</a>
        <span class="mx-2 text-brand-circuit/60">·</span>
        <a href="../privacidade.html" class="hover:text-white">{L["footer_privacy"]}</a>
        <span class="mx-2 text-brand-circuit/60">·</span>
        <a href="../cookies.html" class="hover:text-white">{L["footer_cookies"]}</a>
        <span class="mx-2 text-brand-circuit/60">·</span>
        <a href="../termos.html" class="hover:text-white">{L["footer_terms"]}</a>
      </div>
    </footer>
  </body>
</html>
"""


def main() -> None:
    for loc in LOCALES:
        for slug in ARTICLES:
            html = render(loc, slug)
            out = ROOT / loc / "artigos" / f"{slug}.html"
            out.write_text(html, encoding="utf-8")
            print(out)


if __name__ == "__main__":
    main()

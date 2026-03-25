# Quality Backlog (Prioritized)

Last updated: 2026-03-25 (corrections applied in this session).

## Done (this session)

- **SEO**: Open Graph (`og:title`, `og:description`, `og:type`, `og:url`, image) on all product category pages (`produtos/categorias/*` in all locales).
- **hreflang**: PT pages `healthtech` and `supermercados` now include full alternate cluster (reciprocity with EN/ES/JA/KOK/SV + `x-default`).
- **Cross-locale**: Boutique pages `en`, `es`, `ja`, `kok`, `sv` link to `/{locale}/produtos/` instead of PT `../../produtos/index.html`.
- **Sitemap**: Four category URL groups added to `landing/sitemap.xml` with `xhtml:link` alternates; **0** local HTML files missing from sitemap for categories.

## High (remaining)

- **Security headers** (production): `content-security-policy`, `strict-transport-security`, `referrer-policy`, `x-content-type-options` — configure at CDN/hosting.
- **Performance**: Lighthouse budget failures on some URLs (home, articles, tecnologias) — tune per `landing/tools/reports/perf-budget.json` after re-run.
- **A11y**: axe findings (`region`, `landmark-unique`, `color-contrast` on careers), Chrome session flake on one file — see `npm run a11y` output.

## Medium (remaining)

- **JSON-LD**: Most pages lack `application/ld+json` (warning only unless you want rich results everywhere).
- **Meta description length**: Many pages outside 110–170 chars (warnings from `seo-audit.mjs`).

## Commands

- `npm run seo` — should report **Issues: 0** for critical meta.
- `npm run crawl:local` — HTML navigation coverage.
- `npm run quality:all` — full pipeline.

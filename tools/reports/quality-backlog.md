# Quality Backlog (Prioritized)

Generated after running:
- `npm run crawl:local`
- `npm run i18n:audit`
- `npm run seo`
- `npm run a11y`
- `npm run perf:budget`
- `npm run security:audit`

## Blocker
- None in HTML navigation coverage (`orphans=0`, `broken=0` for HTML routes).

## High
- Security headers missing in production response:
  - `content-security-policy`
  - `strict-transport-security`
  - `referrer-policy`
  - `x-content-type-options`
- SEO critical metadata missing in category product pages:
  - `missing_og:title`
  - `missing_og:description`
  - `missing_og:type`
  - `missing_og:url`
- Performance budget failures:
  - Home `/` and `/en/` below performance threshold.
  - Four lighthouse target URLs failed and need investigation.

## Medium
- i18n warnings:
  - Missing `x-default` in key routes.
  - Missing `hreflang` clusters in technology pages.
  - Potential cross-locale leakage in localized boutique product links.
- A11y:
  - `region` and `landmark-unique` issues in home templates.
  - Multiple `color-contrast` issues in `en/careers.html`.

## Next sprint targets
1. Add missing OG tags in all `produtos/categorias/*` pages.
2. Normalize `hreflang` strategy for technology and careers pages.
3. Fix top a11y issues (`region`, `landmark-unique`, high contrast failures).
4. Add/adjust security headers in production infra.
5. Re-run lighthouse and fix failing URLs in test set.

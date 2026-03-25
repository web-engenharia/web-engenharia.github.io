#!/usr/bin/env node
/**
 * i18n + crawl consistency audit.
 * - Uses crawl-report.json as navigation source-of-truth
 * - Validates lang/canonical/hreflang basics for crawled HTML pages
 * - Detects obvious cross-locale leakage in internal links
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LANDING = path.resolve(__dirname, '..');
const REPORTS = path.join(__dirname, 'reports');
const CRAWL_JSON = path.join(REPORTS, 'crawl-report.json');
const OUT_JSON = path.join(REPORTS, 'i18n-audit.json');
const OUT_MD = path.join(REPORTS, 'i18n-audit.md');
const BASE = 'https://www.web-engenharia.com';
const LOCALES = ['en', 'es', 'ja', 'kok', 'sv'];
const EXPECTED_HREFLANG = ['pt-BR', 'en', 'es', 'ja', 'kok', 'sv'];

function routeToRel(route) {
  if (route === '/' || route === '') return 'index.html';
  if (route.endsWith('/')) return route.slice(1) + 'index.html';
  return route.slice(1);
}

function localeFromRoute(route) {
  const m = route.match(/^\/(en|es|ja|kok|sv)(\/|$)/);
  return m ? m[1] : 'pt-BR';
}

function expectedLangFromRoute(route) {
  const locale = localeFromRoute(route);
  return locale === 'pt-BR' ? 'pt-BR' : locale;
}

function readHead(html) {
  const m = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  return m ? m[1] : '';
}

function extractHtmlLang(html) {
  const m = html.match(/<html[^>]*\blang=["']([^"']+)["']/i);
  return m ? m[1] : '';
}

function extractCanonical(head) {
  const m =
    head.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
    head.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  return m ? m[1] : '';
}

function extractHreflangs(head) {
  const out = [];
  const re = /<link\s+([^>]*rel=["']alternate["'][^>]*)>/gi;
  let m;
  while ((m = re.exec(head)) !== null) {
    const inner = m[1];
    const hl = inner.match(/hreflang=["']([^"']+)["']/i);
    const href = inner.match(/href=["']([^"']+)["']/i);
    if (hl && href) out.push({ hreflang: hl[1], href: href[1] });
  }
  return out;
}

function extractInternalAnchors(html) {
  const out = [];
  const re = /<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi;
  let m;
  while ((m = re.exec(html)) !== null) out.push(m[2]);
  return out;
}

function resolveHrefToPath(href, route) {
  if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:|data:)/i.test(href)) return null;
  try {
    const url = new URL(href, `${BASE}${route}`);
    if (url.origin !== BASE) return null;
    return url.pathname || '/';
  } catch {
    return null;
  }
}

function normRoute(pathname) {
  if (!pathname.startsWith('/')) return null;
  let p = pathname.replace(/\/{2,}/g, '/');
  p = p.replace(/\/index\.html$/i, '/');
  return p || '/';
}

function main() {
  if (!fs.existsSync(CRAWL_JSON)) {
    console.error('Missing crawl report:', CRAWL_JSON);
    process.exit(1);
  }
  const crawl = JSON.parse(fs.readFileSync(CRAWL_JSON, 'utf8'));
  const pages = crawl.pages || {};
  const routes = Object.keys(pages).filter((r) => r.endsWith('/') || r.endsWith('.html')).sort();

  /** @type {Array<{type: string, route: string, detail?: string}>} */
  const issues = [];
  /** @type {Array<{type: string, route: string, detail?: string}>} */
  const warnings = [];

  for (const route of routes) {
    const rel = routeToRel(route);
    const abs = path.join(LANDING, rel);
    if (!fs.existsSync(abs)) {
      issues.push({ type: 'missing_local_file_for_route', route, detail: rel });
      continue;
    }
    const html = fs.readFileSync(abs, 'utf8');
    const head = readHead(html);

    const expectedLang = expectedLangFromRoute(route);
    const htmlLang = extractHtmlLang(html);
    if (!htmlLang) issues.push({ type: 'missing_html_lang', route });
    else if (htmlLang !== expectedLang) issues.push({ type: 'unexpected_html_lang', route, detail: `${htmlLang} != ${expectedLang}` });

    const canonical = extractCanonical(head);
    if (!canonical) issues.push({ type: 'missing_canonical', route });
    else {
      const expectedCanonical = `${BASE}${route}`;
      if (canonical !== expectedCanonical) warnings.push({ type: 'canonical_mismatch_route', route, detail: canonical });
    }

    const hreflangs = extractHreflangs(head);
    const hs = new Set(hreflangs.map((h) => h.hreflang));
    for (const needed of EXPECTED_HREFLANG) {
      if (!hs.has(needed)) warnings.push({ type: 'missing_hreflang_locale', route, detail: needed });
    }

    // x-default only expected for product hubs and primary home-like pages.
    const isKeyRoute = route === '/' || LOCALES.some((l) => route === `/${l}/`) || /\/produtos\/$/.test(route);
    if (isKeyRoute && !hs.has('x-default')) warnings.push({ type: 'missing_x_default', route });

    // Cross-locale leakage: page locale linking to another locale root where same-locale path is expected.
    const pageLocale = localeFromRoute(route);
    const hrefs = extractInternalAnchors(html);
    for (const href of hrefs) {
      const resolved = resolveHrefToPath(href, route);
      if (!resolved) continue;
      const to = normRoute(resolved);
      if (!to) continue;
      const targetLocale = localeFromRoute(to);
      if (pageLocale !== 'pt-BR' && targetLocale === 'pt-BR' && /^\/produtos\//.test(to)) {
        warnings.push({ type: 'possible_cross_locale_leak', route, detail: `${href} -> ${to}` });
      }
    }
  }

  const out = {
    generatedAt: new Date().toISOString(),
    stats: {
      routesChecked: routes.length,
      issues: issues.length,
      warnings: warnings.length,
    },
    issues,
    warnings,
  };
  fs.mkdirSync(REPORTS, { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2) + '\n', 'utf8');

  const md = [];
  md.push('# i18n + crawl audit');
  md.push('');
  md.push(`- Routes checked: ${out.stats.routesChecked}`);
  md.push(`- Issues: ${out.stats.issues}`);
  md.push(`- Warnings: ${out.stats.warnings}`);
  md.push('');
  if (issues.length) {
    md.push('## Issues');
    for (const i of issues.slice(0, 200)) md.push(`- \`${i.type}\` \`${i.route}\`${i.detail ? ` - ${i.detail}` : ''}`);
    if (issues.length > 200) md.push(`- ... ${issues.length - 200} more`);
    md.push('');
  }
  if (warnings.length) {
    md.push('## Warnings');
    for (const w of warnings.slice(0, 250)) md.push(`- \`${w.type}\` \`${w.route}\`${w.detail ? ` - ${w.detail}` : ''}`);
    if (warnings.length > 250) md.push(`- ... ${warnings.length - 250} more`);
    md.push('');
  }
  fs.writeFileSync(OUT_MD, md.join('\n') + '\n', 'utf8');

  process.exit(issues.length ? 1 : 0);
}

main();

#!/usr/bin/env node
/**
 * Generate "alias" pages without the `/produtos` segment and update sitemap accordingly.
 *
 * Targets (PT-BR root = no prefix):
 * - Categories (hubs):
 *   - /categorias/{slug}/
 *   - /en/categorias/{slug}/ (etc.)
 * - Product modules (hubs):
 *   - /{module}/
 *   - /en/{module}/ (etc.)
 *
 * Templates are copied from existing `/produtos/...` pages in every locale.
 * We update:
 * - <html lang="..."> comes from the template locale (unchanged).
 * - <link rel="canonical" ...> to the alias URL (short, no `/produtos`).
 * - hreflang <link rel="alternate" ...> cluster to match alias URLs (+ x-default to PT-BR root).
 * - <meta property="og:url" ...> to match canonical.
 * We also convert `a[href^='./' or '../' or ...]` into absolute URLs resolved from the source page canonical,
 * so breadcrumbs/internal navigation keep pointing to the original `/produtos/...` pages.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LANDING = path.resolve(__dirname, '..');
const SITEMAP_PATH = path.join(LANDING, 'sitemap.xml');
const BASE = 'https://www.web-engenharia.com';

const LOCALES = ['en', 'es', 'ja', 'kok', 'sv'];
const PT_LOCALE = 'pt-BR';
const ALL_HREFLANGS = [PT_LOCALE, ...LOCALES];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function existsFile(p) {
  try {
    return fs.existsSync(p) && fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function extractCanonical(html) {
  const re = /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*\/?>/i;
  const m = html.match(re);
  return m ? m[1].trim() : '';
}

function extractOgUrl(html) {
  const re = /<meta\s+[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["'][^>]*\/?>/i;
  const m = html.match(re);
  return m ? m[1].trim() : '';
}

function buildAlternates(shortUrlByLocale, canonicalShortUrl) {
  // canonicalShortUrl is not used directly, but we keep it to emphasize intent.
  void canonicalShortUrl;
  const lines = [];
  for (const hl of ALL_HREFLANGS) {
    lines.push(
      `    <link rel="alternate" hreflang="${hl}" href="${shortUrlByLocale[hl]}" />`
    );
  }
  lines.push(`    <link rel="alternate" hreflang="x-default" href="${shortUrlByLocale[PT_LOCALE]}" />`);
  return lines.join('\n');
}

function replaceCanonicalAndHreflang(html, newCanonicalUrl, shortUrlByLocale) {
  const canonicalRe = /<link\s+[^>]*rel=["']canonical["'][^>]*href=["'][^"']*["'][^>]*\/?>/i;
  const altRe = /<link\s+[^>]*rel=["']alternate["'][^>]*\/?>/gi;

  const alternates = buildAlternates(shortUrlByLocale, newCanonicalUrl);

  // Remove all existing <link rel="alternate" ...> elements first.
  let out = html.replace(altRe, '');

  // Replace canonical, then insert hreflang cluster right after it.
  out = out.replace(canonicalRe, (m) => {
    // Keep canonical tag formatting simple and deterministic.
    return `<link rel="canonical" href="${newCanonicalUrl}" />\n${alternates}`;
  });

  // Update OG URL
  const ogUrlRe = /<meta\s+[^>]*property=["']og:url["'][^>]*content=["'][^"']*["'][^>]*\/?>/i;
  out = out.replace(ogUrlRe, `<meta property="og:url" content="${newCanonicalUrl}" />`);

  return out;
}

function convertRelativeAnchorsToAbsolute(html, sourceCanonicalUrl) {
  if (!sourceCanonicalUrl) return html;

  // Convert only `a href="." or ".."` style links to absolute URLs.
  // This keeps destination page content pointing to the intended `/produtos/...` targets.
  const re = /(<a\b[^>]*?\bhref\s*=\s*)(['"])(\.[^'"]*)\2/gi;
  return html.replace(re, (_, prefix, quote, href) => {
    let abs = '';
    try {
      abs = new URL(href, sourceCanonicalUrl).href;
    } catch {
      abs = href;
    }
    return `${prefix}${quote}${abs}${quote}`;
  });
}

function writeFileIfChanged(destPath, content) {
  const existing = existsFile(destPath) ? fs.readFileSync(destPath, 'utf8') : null;
  if (existing === content) return false;
  ensureDir(path.dirname(destPath));
  fs.writeFileSync(destPath, content, 'utf8');
  return true;
}

function urlForLocale(locale, kind, slugOrModule) {
  // kind: 'category' | 'module'
  const prefix = locale === PT_LOCALE ? '' : `/${locale}`;
  if (kind === 'category') return `${BASE}${prefix}/categorias/${slugOrModule}/`;
  return `${BASE}${prefix}/${slugOrModule}/`;
}

function destFileForLocale(locale, kind, slugOrModule) {
  // kind: 'category' => landing/{locale}/categorias/{slug}/index.html (or landing/categorias/{slug}/index.html)
  // kind: 'module' => landing/{locale}/{module}/index.html (or landing/{module}/index.html)
  if (kind === 'category') {
    if (locale === PT_LOCALE) return path.join(LANDING, 'categorias', slugOrModule, 'index.html');
    return path.join(LANDING, locale, 'categorias', slugOrModule, 'index.html');
  }
  // module
  if (locale === PT_LOCALE) return path.join(LANDING, slugOrModule, 'index.html');
  return path.join(LANDING, locale, slugOrModule, 'index.html');
}

function sourceFileForLocale(locale, kind, slugOrModule) {
  if (kind === 'category') {
    if (locale === PT_LOCALE) return path.join(LANDING, 'produtos', 'categorias', slugOrModule, 'index.html');
    return path.join(LANDING, locale, 'produtos', 'categorias', slugOrModule, 'index.html');
  }
  // module
  if (locale === PT_LOCALE) return path.join(LANDING, 'produtos', slugOrModule, 'index.html');
  return path.join(LANDING, locale, 'produtos', slugOrModule, 'index.html');
}

function parseSitemapUrlLocs(xml) {
  const blocks = xml.match(/<url>[\s\S]*?<\/url>/g) || [];
  const locs = new Set();
  for (const b of blocks) {
    const m = b.match(/<loc>([^<]+)<\/loc>/i);
    if (m) locs.add(m[1].trim());
  }
  return locs;
}

function extractSitemapMetaForLoc(xml, loc) {
  const blocks = xml.match(/<url>[\s\S]*?<\/url>/g) || [];
  for (const b of blocks) {
    const m = b.match(/<loc>\s*([^<]+?)\s*<\/loc>/i);
    if (!m) continue;
    if (m[1].trim() !== loc) continue;

    const lastmod = (b.match(/<lastmod>([^<]+)<\/lastmod>/i) || [])[1]?.trim() || '';
    const changefreq = (b.match(/<changefreq>([^<]+)<\/changefreq>/i) || [])[1]?.trim() || 'monthly';
    const priority = (b.match(/<priority>([^<]+)<\/priority>/i) || [])[1]?.trim() || '0.7';
    return { lastmod, changefreq, priority };
  }
  return null;
}

function makeSitemapUrlBlock({ loc, shortUrlsByLocale, priority, changefreq, lastmod }) {
  const alternates = [];
  for (const hl of ALL_HREFLANGS) {
    alternates.push(
      `    <xhtml:link rel="alternate" hreflang="${hl}" href="${shortUrlsByLocale[hl]}" />`
    );
  }
  alternates.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${shortUrlsByLocale[PT_LOCALE]}" />`);

  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    ...alternates,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

function updateSitemapWithAliasUrls() {
  if (!existsFile(SITEMAP_PATH)) throw new Error(`Missing sitemap: ${SITEMAP_PATH}`);
  let xml = fs.readFileSync(SITEMAP_PATH, 'utf8');

  const existingLocs = parseSitemapUrlLocs(xml);
  const today = new Date().toISOString().slice(0, 10);

  const catsRoot = path.join(LANDING, 'produtos', 'categorias');
  const modulesRoot = path.join(LANDING, 'produtos');

  const categorySlugs = fs
    .readdirSync(catsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const moduleSlugs = fs
    .readdirSync(modulesRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== 'categorias')
    .map((d) => d.name)
    .sort();

  const blocksToAdd = [];

  for (const slug of categorySlugs) {
    const shortPt = urlForLocale(PT_LOCALE, 'category', slug);
    if (existingLocs.has(shortPt)) continue;

    const sourcePt = `${BASE}/produtos/categorias/${slug}/`;
    const meta = extractSitemapMetaForLoc(xml, sourcePt) || {
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.72',
    };
    meta.lastmod = today;

    const shortUrlsByLocale = {
      'pt-BR': shortPt,
      en: urlForLocale('en', 'category', slug),
      es: urlForLocale('es', 'category', slug),
      ja: urlForLocale('ja', 'category', slug),
      kok: urlForLocale('kok', 'category', slug),
      sv: urlForLocale('sv', 'category', slug),
    };

    blocksToAdd.push(
      makeSitemapUrlBlock({
        loc: shortPt,
        shortUrlsByLocale,
        priority: meta.priority,
        changefreq: meta.changefreq,
        lastmod: meta.lastmod,
      })
    );
  }

  for (const module of moduleSlugs) {
    const shortPt = urlForLocale(PT_LOCALE, 'module', module);
    if (existingLocs.has(shortPt)) continue;

    const sourcePt = `${BASE}/produtos/${module}/`;
    const meta = extractSitemapMetaForLoc(xml, sourcePt) || {
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.7',
    };
    meta.lastmod = today;

    const shortUrlsByLocale = {
      'pt-BR': shortPt,
      en: urlForLocale('en', 'module', module),
      es: urlForLocale('es', 'module', module),
      ja: urlForLocale('ja', 'module', module),
      kok: urlForLocale('kok', 'module', module),
      sv: urlForLocale('sv', 'module', module),
    };

    blocksToAdd.push(
      makeSitemapUrlBlock({
        loc: shortPt,
        shortUrlsByLocale,
        priority: meta.priority,
        changefreq: meta.changefreq,
        lastmod: meta.lastmod,
      })
    );
  }

  if (blocksToAdd.length === 0) {
    console.log(`Sitemap already contains ${existingLocs.size} locs; no alias blocks added.`);
    return;
  }

  const closeRe = /<\/urlset>\s*$/m;
  if (!closeRe.test(xml)) throw new Error('Could not find </urlset> end tag');

  xml = xml.replace(closeRe, `${blocksToAdd.join('\n')}\n</urlset>`);
  fs.writeFileSync(SITEMAP_PATH, xml, 'utf8');
  console.log(`Added ${blocksToAdd.length} alias <url> block(s) to sitemap.`);
}

function main() {
  const catsRoot = path.join(LANDING, 'produtos', 'categorias');
  const modulesRoot = path.join(LANDING, 'produtos');

  if (!existsFile(path.join(LANDING, 'sitemap.xml'))) {
    throw new Error(`Missing sitemap: ${SITEMAP_PATH}`);
  }

  const categorySlugs = fs
    .readdirSync(catsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const moduleSlugs = fs
    .readdirSync(modulesRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== 'categorias')
    .map((d) => d.name)
    .sort();

  const localesToGenerate = [PT_LOCALE, ...LOCALES];

  const pagesWritten = [];
  const pagesSkipped = [];

  for (const kind of ['category', 'module']) {
    for (const slugOrModule of kind === 'category' ? categorySlugs : moduleSlugs) {
      for (const locale of localesToGenerate) {
        const sourcePath = sourceFileForLocale(locale, kind, slugOrModule);
        if (!existsFile(sourcePath)) {
          throw new Error(`Missing source template: ${sourcePath}`);
        }

        const destPath = destFileForLocale(locale, kind, slugOrModule);

        const sourceHtml = fs.readFileSync(sourcePath, 'utf8');
        const sourceCanonicalUrl = extractCanonical(sourceHtml);
        const shortCanonicalUrl = urlForLocale(locale, kind, slugOrModule);

        // Build complete short-url cluster for hreflang.
        const shortUrlsByLocale = {
          'pt-BR': urlForLocale(PT_LOCALE, kind, slugOrModule),
          en: urlForLocale('en', kind, slugOrModule),
          es: urlForLocale('es', kind, slugOrModule),
          ja: urlForLocale('ja', kind, slugOrModule),
          kok: urlForLocale('kok', kind, slugOrModule),
          sv: urlForLocale('sv', kind, slugOrModule),
        };

        const afterAnchors = convertRelativeAnchorsToAbsolute(sourceHtml, sourceCanonicalUrl);
        const afterSeo = replaceCanonicalAndHreflang(afterAnchors, shortCanonicalUrl, shortUrlsByLocale);

        // Minimal sanity: ensure we actually updated og:url too.
        const ogUrl = extractOgUrl(afterSeo);
        if (ogUrl && ogUrl !== shortCanonicalUrl) {
          console.warn(`og:url mismatch after generation for ${destPath}: ${ogUrl} != ${shortCanonicalUrl}`);
        }

        const wrote = writeFileIfChanged(destPath, afterSeo);
        if (wrote) pagesWritten.push(destPath);
        else pagesSkipped.push(destPath);
      }
    }
  }

  console.log(`Generated alias pages. Written: ${pagesWritten.length}, skipped (no changes): ${pagesSkipped.length}`);
  updateSitemapWithAliasUrls();
}

main();


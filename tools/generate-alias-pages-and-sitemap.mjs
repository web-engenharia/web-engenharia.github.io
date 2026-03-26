#!/usr/bin/env node
/**
 * Generate "alias" pages without the `/produtos` segment (short URLs for marketing links).
 *
 * SEO policy: canonical URL for each product/category is under `/produtos/...`. These alias
 * files duplicate content for short paths (`/{module}/`, `/categorias/{slug}/`) but MUST NOT
 * compete in search: no hreflang cluster here, robots noindex,follow, canonical points to
 * the `/produtos/...` URL for the same locale. Prefer HTTP 301 from short URL to `/produtos/...`
 * on the edge server when possible.
 *
 * Templates are copied from existing `/produtos/...` pages in every locale.
 * We update:
 * - <link rel="canonical" ...> → `/produtos/...` URL (not the short alias URL).
 * - <meta name="robots" content="noindex, follow" />
 * - Remove all hreflang alternates (single cluster lives on canonical `/produtos/` pages only).
 * - <meta property="og:url" ...> matches canonical.
 * Relative `a[href^='.'` links are resolved to absolute URLs from the source page canonical
 * so breadcrumbs/internal navigation keep pointing to `/produtos/...` targets.
 *
 * Sitemap: does NOT add alias <loc> entries; removes existing alias blocks so only
 * `/produtos/...` URLs represent each product/category cluster.
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

/** Canonical indexed URL under /produtos/ for this locale + kind. */
function urlProdutosForLocale(locale, kind, slugOrModule) {
  const prefix = locale === PT_LOCALE ? '' : `/${locale}`;
  if (kind === 'category') return `${BASE}${prefix}/produtos/categorias/${slugOrModule}/`;
  return `${BASE}${prefix}/produtos/${slugOrModule}/`;
}

/**
 * Strip hreflang, point canonical + og:url to produtos URL, noindex.
 */
function applyAliasSeo(html, canonicalProdutosUrl) {
  const canonicalRe = /<link\s+[^>]*rel=["']canonical["'][^>]*href=["'][^"']*["'][^>]*\/?>/i;
  const altRe = /<link\s+[^>]*rel=["']alternate["'][^>]*\/?>/gi;
  let out = html.replace(altRe, '');
  out = out.replace(
    canonicalRe,
    `<link rel="canonical" href="${canonicalProdutosUrl}" />`
  );
  out = out.replace(
    /<meta\s+[^>]*name=["']robots["'][^>]*content=["'][^"']*["'][^>]*\/?>/i,
    `<meta name="robots" content="noindex, follow" />`
  );
  const ogUrlRe = /<meta\s+[^>]*property=["']og:url["'][^>]*content=["'][^"']*["'][^>]*\/?>/i;
  out = out.replace(
    ogUrlRe,
    `<meta property="og:url" content="${canonicalProdutosUrl}" />`
  );
  return out;
}

function convertRelativeAnchorsToAbsolute(html, sourceCanonicalUrl) {
  if (!sourceCanonicalUrl) return html;

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

function destFileForLocale(locale, kind, slugOrModule) {
  if (kind === 'category') {
    if (locale === PT_LOCALE) return path.join(LANDING, 'categorias', slugOrModule, 'index.html');
    return path.join(LANDING, locale, 'categorias', slugOrModule, 'index.html');
  }
  if (locale === PT_LOCALE) return path.join(LANDING, slugOrModule, 'index.html');
  return path.join(LANDING, locale, slugOrModule, 'index.html');
}

function sourceFileForLocale(locale, kind, slugOrModule) {
  if (kind === 'category') {
    if (locale === PT_LOCALE) return path.join(LANDING, 'produtos', 'categorias', slugOrModule, 'index.html');
    return path.join(LANDING, locale, 'produtos', 'categorias', slugOrModule, 'index.html');
  }
  if (locale === PT_LOCALE) return path.join(LANDING, 'produtos', slugOrModule, 'index.html');
  return path.join(LANDING, locale, 'produtos', slugOrModule, 'index.html');
}

/**
 * Remove <url> blocks whose <loc> is a short alias (not under /produtos/).
 */
function removeAliasUrlBlocksFromSitemap(moduleSlugs, categorySlugs) {
  if (!existsFile(SITEMAP_PATH)) throw new Error(`Missing sitemap: ${SITEMAP_PATH}`);
  let xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const moduleSet = new Set(moduleSlugs);
  const catSet = new Set(categorySlugs);

  function isAliasLoc(loc) {
    try {
      const u = new URL(loc);
      if (u.origin !== BASE) return false;
      let pathname = u.pathname.replace(/\/+$/, '');
      const segments = pathname.split('/').filter(Boolean);
      const localePrefixes = new Set(LOCALES);
      let rest = segments;
      if (rest.length && localePrefixes.has(rest[0])) rest = rest.slice(1);
      if (rest.length === 2 && rest[0] === 'categorias' && catSet.has(rest[1])) return true;
      if (rest.length === 1 && rest[0] === 'categorias') return false;
      if (rest.length === 1 && moduleSet.has(rest[0])) return true;
      return false;
    } catch {
      return false;
    }
  }

  const blocks = xml.match(/<url>[\s\S]*?<\/url>/g) || [];
  const kept = [];
  let removed = 0;
  for (const block of blocks) {
    const m = block.match(/<loc>\s*([^<]+?)\s*<\/loc>/i);
    const loc = m ? m[1].trim() : '';
    if (loc && isAliasLoc(loc)) {
      removed++;
      continue;
    }
    kept.push(block);
  }

  const startIdx = xml.indexOf('<url>');
  const endIdx = xml.lastIndexOf('</urlset>');
  if (startIdx === -1 || endIdx === -1) throw new Error('Malformed sitemap.xml');
  const head = xml.slice(0, startIdx);
  const tail = xml.slice(endIdx);
  const newXml = `${head}${kept.join('\n  ')}${kept.length ? '\n  ' : ''}${tail}`;
  if (removed > 0) {
    fs.writeFileSync(SITEMAP_PATH, newXml, 'utf8');
    console.log(`Removed ${removed} alias <url> block(s) from sitemap.`);
  } else {
    console.log('Sitemap: no alias <loc> blocks to remove.');
  }
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
        const canonicalProdutosUrl = urlProdutosForLocale(locale, kind, slugOrModule);

        const afterAnchors = convertRelativeAnchorsToAbsolute(sourceHtml, sourceCanonicalUrl);
        const afterSeo = applyAliasSeo(afterAnchors, canonicalProdutosUrl);

        const ogUrl = extractOgUrl(afterSeo);
        if (ogUrl && ogUrl !== canonicalProdutosUrl) {
          console.warn(`og:url mismatch after generation for ${destPath}: ${ogUrl} != ${canonicalProdutosUrl}`);
        }

        const wrote = writeFileIfChanged(destPath, afterSeo);
        if (wrote) pagesWritten.push(destPath);
        else pagesSkipped.push(destPath);
      }
    }
  }

  console.log(`Generated alias pages. Written: ${pagesWritten.length}, skipped (no changes): ${pagesSkipped.length}`);
  removeAliasUrlBlocksFromSitemap(moduleSlugs, categorySlugs);
}

main();

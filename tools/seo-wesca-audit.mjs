#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LANDING = path.resolve(__dirname, '..');
const BASE = 'https://web-engenharia.com';
const DESC_MAX = Number.parseInt(process.env.SEO_DESC_MAX ?? '145', 10);

const args = new Set(process.argv.slice(2));
const FIX_SAFE = args.has('--fix-safe');

function walkHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, out);
    else if (entry.name.endsWith('.html') && entry.name !== '_template.html') out.push(full);
  }
  return out;
}

function normalizeUrl(url) {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    return url;
  }
}

function relToExpectedCanonical(rel) {
  if (rel === 'index.html') return `${BASE}/`;
  // For locale product hubs WESCA tends to crawl /{locale}/produtos
  const localeHub = rel.match(/^(en|es|ja|kok|sv)\/produtos\/index\.html$/);
  if (localeHub) return `${BASE}/${localeHub[1]}/produtos`;
  if (rel.endsWith('/index.html')) return `${BASE}/${rel}`;
  return `${BASE}/${rel}`;
}

function getHead(html) {
  const m = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  return m ? m[1] : '';
}

function getCanonical(head) {
  const m = head.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  return m ? m[1] : '';
}

function setCanonical(html, newUrl) {
  return html.replace(
    /(<link\s+[^>]*rel=["']canonical["'][^>]*href=["'])([^"']+)(["'][^>]*>)/i,
    `$1${newUrl}$3`
  );
}

function getOgUrl(head) {
  const m = head.match(/<meta\s+[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
  return m ? m[1] : '';
}

function setOgUrl(html, newUrl) {
  return html.replace(
    /(<meta\s+[^>]*property=["']og:url["'][^>]*content=["'])([^"']+)(["'][^>]*>)/i,
    `$1${newUrl}$3`
  );
}

function getDescription(head) {
  const m = head.match(
    /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i
  );
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}

function setDescription(html, newDesc) {
  return html.replace(
    /(<meta\s+[^>]*name=["']description["'][^>]*content=["'])([^"']*)(["'][^>]*>)/i,
    `$1${newDesc}$3`
  );
}

function getHreflangs(head) {
  const list = [];
  const re = /<link\s+[^>]*rel=["']alternate["'][^>]*>/gi;
  let m;
  while ((m = re.exec(head)) !== null) {
    const tag = m[0];
    const hl = tag.match(/hreflang=["']([^"']+)["']/i);
    const href = tag.match(/href=["']([^"']+)["']/i);
    if (hl && href) list.push({ tag, hreflang: hl[1], href: href[1] });
  }
  return list;
}

function upsertXDefault(html, href) {
  if (/<link\s+[^>]*hreflang=["']x-default["']/i.test(html)) {
    return html.replace(
      /(<link\s+[^>]*hreflang=["']x-default["'][^>]*href=["'])([^"']+)(["'][^>]*>)/i,
      `$1${href}$3`
    );
  }
  return html.replace(
    /(<link\s+[^>]*rel=["']alternate["'][^>]*hreflang=["']sv["'][^>]*>\s*)/i,
    `$1    <link rel="alternate" hreflang="x-default" href="${href}" />\n`
  );
}

function maybeShortenDesc(desc) {
  if (!desc || desc.length <= DESC_MAX) return desc;
  const cut = desc.slice(0, DESC_MAX);
  const boundary = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '), cut.lastIndexOf(', '), cut.lastIndexOf(' '));
  let out = boundary > DESC_MAX - 30 ? cut.slice(0, boundary) : cut;
  out = out.trim().replace(/[,:;]+$/, '');
  if (!/[.!?]$/.test(out)) out += '.';
  return out;
}

function fileExistsForUrl(url) {
  try {
    const u = new URL(url);
    const rel = u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname;
    return fs.existsSync(path.join(LANDING, rel));
  } catch {
    return false;
  }
}

function addAliasClusterIfMissing(rel, html) {
  const m = rel.match(/^(en|es|ja|kok|sv)\/([a-z0-9-]+)\/index\.html$/i);
  if (!m) return html;
  const slug = m[2];
  const blocked = new Set(['artigos', 'produtos', 'tecnologias', 'categorias', 'boutique-engenharia']);
  if (blocked.has(slug)) return html;

  const variants = [
    ['pt-BR', `${BASE}/${slug}/index.html`],
    ['en', `${BASE}/en/${slug}/index.html`],
    ['es', `${BASE}/es/${slug}/index.html`],
    ['ja', `${BASE}/ja/${slug}/index.html`],
    ['kok', `${BASE}/kok/${slug}/index.html`],
    ['sv', `${BASE}/sv/${slug}/index.html`],
  ].filter(([, href]) => fileExistsForUrl(href));

  if (variants.length < 2) return html;
  const xDefault = variants.find(([l]) => l === 'en')?.[1] ?? variants[0][1];
  const block = variants
    .map(([l, href]) => `    <link rel="alternate" hreflang="${l}" href="${href}" />`)
    .concat(`    <link rel="alternate" hreflang="x-default" href="${xDefault}" />`)
    .join('\n');

  const hasAnyAlt = /<link\s+[^>]*rel=["']alternate["']/i.test(html);
  if (hasAnyAlt) return html;
  return html.replace(
    /(<link\s+[^>]*rel=["']canonical["'][^>]*>\s*)/i,
    `$1${block}\n`
  );
}

function ensureAlternatesBlock(html, variants, xDefaultHref) {
  const altSet = new Set(variants.map(([, href]) => normalizeUrl(href)));
  let xDefault = xDefaultHref;
  if (altSet.has(normalizeUrl(xDefault))) {
    xDefault = `${BASE}/en/produtos/index.html`;
  }
  const block = variants
    .map(([l, href]) => `    <link rel="alternate" hreflang="${l}" href="${href}" />`)
    .concat(`    <link rel="alternate" hreflang="x-default" href="${xDefault}" />`)
    .join('\n');

  // Remove all previous alternates, then insert clean block after canonical.
  const cleared = html.replace(/\s*<link\s+[^>]*rel=["']alternate["'][^>]*>\s*/gi, '\n');
  return cleared.replace(
    /(<link\s+[^>]*rel=["']canonical["'][^>]*>\s*)/i,
    `$1${block}\n`
  );
}

function maybeBuildCategoriaVariants(rel) {
  const m = rel.match(/^(en|es|ja|kok|sv)\/categorias\/([a-z0-9-]+)\/index\.html$/i);
  if (!m) return null;
  const slug = m[2];
  const variants = [
    ['pt-BR', `${BASE}/categorias/${slug}/index.html`],
    ['en', `${BASE}/en/categorias/${slug}/index.html`],
    ['es', `${BASE}/es/categorias/${slug}/index.html`],
    ['ja', `${BASE}/ja/categorias/${slug}/index.html`],
    ['kok', `${BASE}/kok/categorias/${slug}/index.html`],
    ['sv', `${BASE}/sv/categorias/${slug}/index.html`],
  ].filter(([, href]) => fileExistsForUrl(href));
  if (variants.length < 2) return null;
  return variants;
}

const files = walkHtml(LANDING);
const findings = [];
let changed = 0;

for (const file of files) {
  const rel = path.relative(LANDING, file).replace(/\\/g, '/');
  let html = fs.readFileSync(file, 'utf8');
  const original = html;
  const head = getHead(html);
  const canonical = getCanonical(head);
  const ogUrl = getOgUrl(head);
  const desc = getDescription(head);
  const hreflangs = getHreflangs(head);

  // WESCA-like: canonical mismatch for crawled /index.html
  if (rel.endsWith('/index.html') || rel === 'index.html') {
    const expected = relToExpectedCanonical(rel);
    if (canonical && normalizeUrl(canonical) !== normalizeUrl(expected)) {
      findings.push({ type: 'canonical_mismatch', rel, canonical, expected });
      if (FIX_SAFE) {
        html = setCanonical(html, expected);
        html = setOgUrl(html, expected);
      }
    }
  }

  // WESCA-like: canonical vs og:url disagreement
  if (canonical && ogUrl && normalizeUrl(canonical) !== normalizeUrl(ogUrl)) {
    findings.push({ type: 'canonical_ogurl_mismatch', rel, canonical, ogUrl });
    if (FIX_SAFE) html = setOgUrl(html, canonical);
  }

  // WESCA-like: duplicate hreflang href target
  if (hreflangs.length) {
    const byHref = new Map();
    for (const h of hreflangs) {
      const key = normalizeUrl(h.href);
      if (!byHref.has(key)) byHref.set(key, []);
      byHref.get(key).push(h.hreflang);
    }
    for (const [href, locales] of byHref.entries()) {
      if (locales.length > 1) {
        findings.push({ type: 'hreflang_duplicate_href', rel, href, locales });
        if (FIX_SAFE && locales.includes('x-default')) {
          const expected = canonical || relToExpectedCanonical(rel);
          const altTarget =
            normalizeUrl(expected) !== normalizeUrl(href)
              ? expected
              : `${BASE}/en${rel === 'index.html' ? '/index.html' : '/'}`;
          html = upsertXDefault(html, altTarget);
        }
      }
    }
  }

  // WESCA-like: missing hreflang locales for localized category pages
  const categoriaVariants = maybeBuildCategoriaVariants(rel);
  if (categoriaVariants) {
    const declared = new Set(hreflangs.map((h) => h.hreflang));
    const needed = new Set(categoriaVariants.map(([l]) => l));
    let missing = false;
    for (const locale of needed) {
      if (!declared.has(locale)) {
        findings.push({ type: 'missing_hreflang_locale', rel, locale });
        missing = true;
      }
    }
    if (missing && FIX_SAFE) {
      const xDefault = categoriaVariants.find(([l]) => l === 'en')?.[1] ?? categoriaVariants[0][1];
      html = ensureAlternatesBlock(html, categoriaVariants, xDefault);
    }
  }

  // WESCA-like: missing hreflang locales (common on alias pages)
  const hasAlternates = hreflangs.length > 0;
  if (!hasAlternates && /^((en|es|ja|kok|sv)\/[a-z0-9-]+\/index\.html)$/i.test(rel)) {
    findings.push({ type: 'missing_hreflang_cluster', rel });
    if (FIX_SAFE) {
      html = addAliasClusterIfMissing(rel, html);
      // Re-read alternates after insertion; de-dup x-default if equal to en
      const refreshed = getHreflangs(getHead(html));
      const enHref = refreshed.find((x) => x.hreflang === 'en')?.href;
      const xHref = refreshed.find((x) => x.hreflang === 'x-default')?.href;
      if (enHref && xHref && normalizeUrl(enHref) === normalizeUrl(xHref)) {
        const canonicalNow = getCanonical(getHead(html)) || relToExpectedCanonical(rel);
        html = upsertXDefault(html, canonicalNow);
      }
    }
  }

  // WESCA-like: meta description long estimate
  if (desc && desc.length > DESC_MAX) {
    findings.push({ type: 'meta_description_long_serp_estimate', rel, length: desc.length });
    if (FIX_SAFE) html = setDescription(html, maybeShortenDesc(desc));
  }

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    changed++;
  }
}

const grouped = new Map();
for (const item of findings) {
  if (!grouped.has(item.type)) grouped.set(item.type, []);
  grouped.get(item.type).push(item);
}

console.log(`WESCA pattern audit scanned ${files.length} HTML files.`);
if (FIX_SAFE) console.log(`Safe fixes applied to ${changed} files.`);
console.log('');

if (!findings.length) {
  console.log('No issues found.');
  process.exit(0);
}

for (const [type, list] of [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  console.log(`${type} (${list.length})`);
  for (const x of list.slice(0, 20)) {
    const extra = { ...x };
    delete extra.type;
    delete extra.rel;
    const info = Object.keys(extra).length ? ` ${JSON.stringify(extra)}` : '';
    console.log(`  - ${x.rel}${info}`);
  }
  if (list.length > 20) console.log(`  ... +${list.length - 20} more`);
  console.log('');
}

console.log(`Total issues: ${findings.length}`);
process.exit(FIX_SAFE ? 0 : 1);

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LANDING = path.resolve(__dirname, '..');
const TITLE_MAX = Number.parseInt(process.env.SEO_TITLE_MAX ?? '65', 10);
const DESC_MAX = Number.parseInt(process.env.SEO_DESC_MAX ?? '160', 10);
const EXPECTED_HREFLANGS = ['pt-BR', 'en', 'es', 'ja', 'kok', 'sv'];

function walkHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, out);
    else if (entry.name.endsWith('.html') && entry.name !== '_template.html') out.push(full);
  }
  return out;
}

function cleanText(value = '') {
  return value.replace(/\s+/g, ' ').trim();
}

function readHead(html) {
  const m = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  return m ? m[1] : '';
}

function getTitle(head) {
  const m = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? cleanText(m[1].replace(/<[^>]+>/g, '')) : '';
}

function getMetaDescription(head) {
  const m1 = head.match(
    /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i
  );
  if (m1) return cleanText(m1[1]);
  const m2 = head.match(
    /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i
  );
  return m2 ? cleanText(m2[1]) : '';
}

function getCanonical(head) {
  const m = head.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  return m ? m[1] : '';
}

function getOgUrl(head) {
  const m = head.match(/<meta\s+[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
  return m ? m[1] : '';
}

function getHreflangs(head) {
  const res = [];
  const re = /<link\s+[^>]*rel=["']alternate["'][^>]*>/gi;
  let m;
  while ((m = re.exec(head)) !== null) {
    const tag = m[0];
    const hl = tag.match(/hreflang=["']([^"']+)["']/i);
    const href = tag.match(/href=["']([^"']+)["']/i);
    if (hl && href) res.push({ hreflang: hl[1], href: href[1] });
  }
  return res;
}

function normalizeUrl(url) {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    return url;
  }
}

function expectedCanonicalFromRel(rel) {
  const base = 'https://web-engenharia.com';
  if (rel === 'index.html') return `${base}/index.html`;
  if (rel.endsWith('/index.html')) return `${base}/${rel}`;
  return `${base}/${rel}`;
}

function looksIncompletePhrase(text) {
  const t = text.toLowerCase().trim();
  if (!t) return false;
  const badEndings = [
    ' with',
    ' without',
    ' and',
    ' or',
    ' com',
    ' sem',
    ' e',
    ' ou',
    ' para',
    ' de',
    ' do',
    ' da',
    ' y',
    ' con',
    ' sin',
  ];
  return badEndings.some((x) => t.endsWith(x));
}

const files = walkHtml(LANDING);
const findings = [];

for (const file of files) {
  const rel = path.relative(LANDING, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');
  const head = readHead(html);
  const title = getTitle(head);
  const desc = getMetaDescription(head);
  const canonical = getCanonical(head);
  const ogUrl = getOgUrl(head);
  const hreflangs = getHreflangs(head);

  if (!title) findings.push({ type: 'missing_title', rel });
  if (!desc) findings.push({ type: 'missing_description', rel });

  if (title.length > TITLE_MAX) findings.push({ type: 'title_too_long', rel, length: title.length });
  if (desc.length > DESC_MAX) findings.push({ type: 'description_too_long', rel, length: desc.length });
  if (looksIncompletePhrase(title)) findings.push({ type: 'title_incomplete_phrase', rel, value: title });
  if (looksIncompletePhrase(desc)) findings.push({ type: 'description_incomplete_phrase', rel, value: desc });

  if (desc.includes('..')) findings.push({ type: 'description_double_dot', rel, value: desc });

  const expectedCanonical = expectedCanonicalFromRel(rel);
  if (canonical && rel.endsWith('/index.html') && canonical !== expectedCanonical) {
    findings.push({ type: 'canonical_mismatch_index', rel, canonical, expected: expectedCanonical });
  }
  if (canonical && ogUrl && normalizeUrl(canonical) !== normalizeUrl(ogUrl)) {
    findings.push({ type: 'canonical_ogurl_mismatch', rel, canonical, ogUrl });
  }

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
      }
    }

    const declared = new Set(hreflangs.map((x) => x.hreflang));
    for (const locale of EXPECTED_HREFLANGS) {
      if (!declared.has(locale)) findings.push({ type: 'missing_hreflang_locale', rel, locale });
    }
  }
}

const grouped = new Map();
for (const f of findings) {
  if (!grouped.has(f.type)) grouped.set(f.type, []);
  grouped.get(f.type).push(f);
}

console.log(`SEO pattern audit scanned ${files.length} HTML files.\n`);
if (!findings.length) {
  console.log('No issues found.');
  process.exit(0);
}

for (const [type, list] of [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  console.log(`${type} (${list.length})`);
  for (const item of list.slice(0, 20)) {
    const extra = { ...item };
    delete extra.type;
    delete extra.rel;
    const payload = Object.keys(extra).length ? ` ${JSON.stringify(extra)}` : '';
    console.log(`  - ${item.rel}${payload}`);
  }
  if (list.length > 20) console.log(`  ... +${list.length - 20} more`);
  console.log('');
}

console.log(`Total issues: ${findings.length}`);
process.exit(1);

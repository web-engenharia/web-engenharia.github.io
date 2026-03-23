#!/usr/bin/env node
/**
 * Static SEO audit for landing/*.html: meta tags, duplicates, sitemap vs disk,
 * sitemap hreflang cluster completeness, and hreflang reciprocity where declared in HTML.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LANDING = path.resolve(__dirname, '..');
const BASE = 'https://www.web-engenharia.com';
const SITEMAP = path.join(LANDING, 'sitemap.xml');

const DESC_MIN = 110;
const DESC_MAX = 170;

const IGNORE_DIR = new Set(['animacao_svg']);

function walkHtml(dir, out = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (name.isDirectory() && IGNORE_DIR.has(name.name)) continue;
    const p = path.join(dir, name.name);
    if (name.isDirectory()) walkHtml(p, out);
    else if (name.name.endsWith('.html') && name.name !== '_template.html') out.push(p);
  }
  return out;
}

function readHead(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const m = raw.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  return m ? m[1] : '';
}

function textContent(s) {
  return s.replace(/\s+/g, ' ').trim();
}

function extractTitle(head) {
  const m = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? textContent(m[1].replace(/<[^>]+>/g, '')) : '';
}

function metaByName(head, name) {
  const re1 = new RegExp(
    `<meta\\s+[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`,
    'i'
  );
  const re2 = new RegExp(
    `<meta\\s+[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']`,
    'i'
  );
  let m = head.match(re1);
  if (m) return m[1];
  m = head.match(re2);
  return m ? m[1] : '';
}

function extractCanonical(head) {
  const re1 = /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i;
  const re2 = /<link\s+[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["']/i;
  let m = head.match(re1);
  if (m) return m[1];
  m = head.match(re2);
  return m ? m[1] : '';
}

function extractOg(head) {
  const og = {};
  const re =
    /<meta\s+[^>]*property=["']og:([^"']+)["'][^>]*content=["']([^"']*)["']/gi;
  let m;
  while ((m = re.exec(head)) !== null) {
    og[m[1]] = m[2];
  }
  return og;
}

function extractHreflangs(head) {
  const pairs = [];
  const re =
    /<link\s+([^>]*rel=["']alternate["'][^>]*)>/gi;
  let block;
  while ((block = re.exec(head)) !== null) {
    const inner = block[1];
    const hl = inner.match(/hreflang=["']([^"']+)["']/i);
    const href = inner.match(/href=["']([^"']+)["']/i);
    if (hl && href) pairs.push({ hreflang: hl[1], href: href[1] });
  }
  return pairs;
}

function hasJsonLd(html) {
  return /<script[^>]*type=["']application\/ld\+json["'][^>]*>/i.test(html);
}

function hasArticlePublished(head) {
  return /property=["']article:published_time["']/i.test(head);
}

function urlToRelPath(url) {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith('web-engenharia.com')) return null;
    let pathname = u.pathname;
    if (pathname === '/' || pathname === '') return 'index.html';
    if (pathname.endsWith('/')) {
      const seg = pathname.slice(1, -1);
      return seg + '/index.html';
    }
    return pathname.slice(1);
  } catch {
    return null;
  }
}

function relPathToFile(landingRoot, rel) {
  return path.join(landingRoot, rel);
}

function parseSitemap(xml) {
  /** @type {{ loc: string, alternates: { hreflang: string, href: string }[] }[]} */
  const entries = [];
  const urlBlocks = xml.split(/<url>/i).slice(1);
  for (const block of urlBlocks) {
    const locM = block.match(/<loc>([^<]+)<\/loc>/i);
    if (!locM) continue;
    const loc = locM[1].trim();
    const alternates = [];
    const linkRe = /<xhtml:link\s+([^>]+)\/>/gi;
    let lm;
    while ((lm = linkRe.exec(block)) !== null) {
      const inner = lm[1];
      if (!/rel=["']alternate["']/i.test(inner)) continue;
      const hl = inner.match(/hreflang=["']([^"']+)["']/i);
      const href = inner.match(/href=["']([^"']+)["']/i);
      if (hl && href) alternates.push({ hreflang: hl[1], href: href[1] });
    }
    entries.push({ loc, alternates });
  }
  return entries;
}

/** All public URLs declared in sitemap (loc + every alternate). */
function sitemapAllUrls(entries) {
  const set = new Set();
  for (const e of entries) {
    set.add(e.loc);
    for (const a of e.alternates) set.add(a.href);
  }
  return set;
}

function normUrl(u) {
  try {
    const x = new URL(u);
    let p = x.pathname;
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return `${x.origin}${p || '/'}`;
  } catch {
    return u;
  }
}

/** Canonical URL forms for a file under landing/ (match sitemap hrefs). */
function fileRelToUrls(rel) {
  const u = new Set();
  const base = BASE.replace(/\/$/, '');
  if (rel === 'index.html') {
    u.add(`${base}/`);
    return u;
  }
  if (rel.endsWith('/index.html')) {
    const dir = rel.slice(0, -'/index.html'.length);
    u.add(`${base}/${dir}/`);
    return u;
  }
  u.add(`${base}/${rel}`);
  return u;
}

function localeBucket(rel) {
  const m = rel.match(/^(en|es|ja|kok|sv)\//);
  return m ? m[1] : 'pt-BR';
}

function main() {
  const files = walkHtml(LANDING).sort();
  const relFiles = files.map((f) => path.relative(LANDING, f).replace(/\\/g, '/'));

  const byTitle = new Map();
  const byDesc = new Map();
  const pageData = [];

  const issues = [];
  const warnings = [];
  let noJsonLdCount = 0;

  for (const abs of files) {
    const rel = path.relative(LANDING, abs).replace(/\\/g, '/');
    const full = fs.readFileSync(abs, 'utf8');
    const head = readHead(abs);
    const title = extractTitle(head);
    const description = metaByName(head, 'description').trim();
    const canonical = extractCanonical(head);
    const robots = metaByName(head, 'robots');
    const og = extractOg(head);
    const hreflangs = extractHreflangs(head);

    if (!title) issues.push({ type: 'missing_title', file: rel });
    if (!description) issues.push({ type: 'missing_description', file: rel });
    if (!canonical) issues.push({ type: 'missing_canonical', file: rel });
    else if (!canonical.startsWith(BASE + '/')) {
      warnings.push({ type: 'canonical_not_base', file: rel, canonical });
    }

    const descLen = description.length;
    if (description && (descLen < DESC_MIN || descLen > DESC_MAX)) {
      warnings.push({
        type: 'description_length',
        file: rel,
        length: descLen,
        hint: descLen < DESC_MIN ? 'short' : 'long',
      });
    }

    const needOg = ['title', 'description', 'url', 'type'];
    for (const k of needOg) {
      if (!og[k]) issues.push({ type: `missing_og:${k}`, file: rel });
    }

    if (robots && /noindex/i.test(robots)) {
      warnings.push({ type: 'robots_noindex', file: rel, robots });
    }

    if (!hasJsonLd(full)) noJsonLdCount++;

    if (rel.startsWith('artigos/') && rel !== 'artigos/index.html') {
      if (!hasArticlePublished(head)) {
        warnings.push({ type: 'article_no_published_time', file: rel });
      }
      if (og.type && og.type !== 'article') {
        warnings.push({ type: 'article_og_type_not_article', file: rel, ogType: og.type });
      }
    }

    if (title) {
      const tk = `${localeBucket(rel)}::${title}`;
      if (!byTitle.has(tk)) byTitle.set(tk, []);
      byTitle.get(tk).push(rel);
    }
    if (description) {
      const dk = `${localeBucket(rel)}::${description}`;
      if (!byDesc.has(dk)) byDesc.set(dk, []);
      byDesc.get(dk).push(rel);
    }

    pageData.push({
      rel,
      title,
      canonical,
      hreflangs,
    });
  }

  console.log('=== SEO audit (static) ===\n');
  console.log(`Pages scanned: ${files.length}\n`);

  console.log('--- Critical / missing meta ---');
  const byType = new Map();
  for (const i of issues) {
    if (!byType.has(i.type)) byType.set(i.type, []);
    byType.get(i.type).push(i.file);
  }
  if (issues.length === 0) console.log('(none)');
  else {
    for (const [t, list] of [...byType.entries()].sort()) {
      console.log(`\n${t} (${list.length}):`);
      for (const f of list.slice(0, 40)) console.log(`  ${f}`);
      if (list.length > 40) console.log(`  ... +${list.length - 40} more`);
    }
  }

  console.log('\n--- Duplicate titles (same locale + title, multiple files) ---');
  let dupT = 0;
  for (const [t, list] of byTitle) {
    if (list.length > 1) {
      dupT++;
      console.log(`\n"${t}"`);
      for (const f of list) console.log(`  ${f}`);
    }
  }
  if (dupT === 0) console.log('(none)');

  console.log('\n--- Duplicate descriptions (same locale + text, multiple files) ---');
  let dupD = 0;
  for (const [d, list] of byDesc) {
    const text = d.replace(/^[^:]+::/, '');
    if (list.length > 1 && text.length > 20) {
      dupD++;
      console.log(`\n(${list.length} pages) ${text.slice(0, 80)}${text.length > 80 ? '…' : ''}`);
      for (const f of list) console.log(`  ${f}`);
    }
  }
  if (dupD === 0) console.log('(none beyond trivial)');

  console.log('\n--- Warnings (length, noindex, JSON-LD, article meta, etc.) ---');
  const warnBy = new Map();
  for (const w of warnings) {
    if (!warnBy.has(w.type)) warnBy.set(w.type, []);
    warnBy.get(w.type).push(w);
  }
  for (const [t, list] of [...warnBy.entries()].sort()) {
    console.log(`\n${t} (${list.length})`);
    for (const w of list.slice(0, 15)) {
      const extra = { ...w };
      delete extra.type;
      delete extra.file;
      const rest = Object.keys(extra).length ? ` ${JSON.stringify(extra)}` : '';
      console.log(`  ${w.file}${rest}`);
    }
    if (list.length > 15) console.log(`  ... +${list.length - 15} more`);
  }
  if (noJsonLdCount > 0) {
    console.log(`\nno_json_ld (summary): ${noJsonLdCount} pages without application/ld+json`);
  }

  // Sitemap vs disk
  console.log('\n--- Sitemap vs local files ---');
  let xml = '';
  try {
    xml = fs.readFileSync(SITEMAP, 'utf8');
  } catch (e) {
    console.log('Could not read sitemap.xml');
  }
  const sitemapEntries = xml ? parseSitemap(xml) : [];

  const missingFiles = [];
  for (const e of sitemapEntries) {
    const rp = urlToRelPath(e.loc);
    if (!rp) {
      missingFiles.push({ url: e.loc, reason: 'bad_host' });
      continue;
    }
    const fp = relPathToFile(LANDING, rp);
    if (!fs.existsSync(fp)) missingFiles.push({ url: e.loc, rel: rp, reason: 'missing_file' });
  }

  const sitemapUrlSet = new Set();
  for (const u of sitemapAllUrls(sitemapEntries)) {
    sitemapUrlSet.add(u);
    sitemapUrlSet.add(normUrl(u));
  }

  const notInSitemap = [];
  for (const rel of relFiles) {
    const urls = fileRelToUrls(rel);
    const hit = [...urls].some((u) => sitemapUrlSet.has(u) || sitemapUrlSet.has(normUrl(u)));
    if (!hit) notInSitemap.push(rel);
  }

  if (missingFiles.length) {
    console.log(`URLs in sitemap without local file (${missingFiles.length}):`);
    for (const x of missingFiles.slice(0, 30)) console.log(`  ${x.url} -> ${x.rel || x.reason}`);
    if (missingFiles.length > 30) console.log(`  ... +${missingFiles.length - 30}`);
  } else console.log('All sitemap <loc> URLs resolve to existing files.');

  console.log(
    `\nLocal HTML files with no matching URL in sitemap (<loc> or xhtml:link href) (${notInSitemap.length}):`
  );
  if (notInSitemap.length === 0) console.log('(none)');
  else {
    for (const r of notInSitemap.slice(0, 45)) console.log(`  ${r}`);
    if (notInSitemap.length > 45) console.log(`  ... +${notInSitemap.length - 45}`);
  }

  // Sitemap hreflang cluster size (articles expect 6 alternates like others)
  console.log('\n--- Sitemap: incomplete hreflang clusters ---');
  const articleCluster = sitemapEntries.filter((e) =>
    e.loc.includes('/artigos/') && e.loc.endsWith('.html')
  );
  let incomplete = 0;
  for (const e of articleCluster) {
    const n = e.alternates.length;
    if (n > 0 && n < 6) {
      incomplete++;
      console.log(`  ${e.loc} — only ${n} xhtml:link alternate(s)`);
    }
  }
  if (incomplete === 0) console.log('(all article URLs have 0 or full cluster — see detail above)');
  else console.log(`Total incomplete: ${incomplete}`);

  // Hreflang reciprocity in HTML (only for pages that declare alternates)
  console.log('\n--- Hreflang reciprocity (HTML link[rel=alternate]) ---');
  const urlToRel = new Map();
  for (const p of pageData) {
    if (p.canonical) urlToRel.set(p.canonical, p.rel);
  }

  const badRecip = [];
  for (const p of pageData) {
    if (p.hreflangs.length === 0) continue;
    for (const { hreflang, href } of p.hreflangs) {
      const targetRel = urlToRel.get(href);
      if (!targetRel) {
        badRecip.push({
          from: p.rel,
          issue: 'target_canonical_not_in_audit',
          href,
        });
        continue;
      }
      const target = pageData.find((x) => x.rel === targetRel);
      if (!target) continue;
      const back = target.hreflangs.find((h) => h.href === p.canonical);
      if (!back) {
        badRecip.push({
          from: p.rel,
          to: targetRel,
          issue: 'no_return_link',
          expectedHref: p.canonical,
        });
      }
    }
  }
  if (badRecip.length === 0) console.log('No one-way hreflang edges among audited pages (or no alternates in HTML).');
  else {
    for (const b of badRecip.slice(0, 25)) console.log(JSON.stringify(b));
    if (badRecip.length > 25) console.log(`... +${badRecip.length - 25}`);
  }

  console.log('\n--- Summary ---');
  console.log(`Issues: ${issues.length}, Warnings: ${warnings.length}`);
  console.log(`Sitemap entries: ${sitemapEntries.length}, Missing local files from sitemap: ${missingFiles.length}`);

  process.exit(issues.length > 0 ? 1 : 0);
}

main();

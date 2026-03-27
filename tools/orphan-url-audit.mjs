#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LANDING = path.resolve(__dirname, '..');
const SITEMAP = path.join(LANDING, 'sitemap.xml');
const BASE = 'https://web-engenharia.com';

const args = new Set(process.argv.slice(2));
const STRICT = args.has('--strict');

function normalizeUrl(url) {
  try {
    const u = new URL(url, BASE);
    let pathname = u.pathname || '/';
    if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
    return `${u.origin}${pathname}`;
  } catch {
    return null;
  }
}

function sitemapLocs(xml) {
  const locs = [];
  const re = /<loc>([^<]+)<\/loc>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const n = normalizeUrl(m[1].trim());
    if (n) locs.push(n);
  }
  return [...new Set(locs)];
}

function pathToUrl(relPath) {
  const rel = relPath.replace(/\\/g, '/');
  if (rel === 'index.html') return `${BASE}/index.html`;
  return `${BASE}/${rel}`;
}

function urlToLandingRel(url) {
  const n = normalizeUrl(url);
  if (!n) return null;
  if (!n.startsWith(BASE)) return null;
  const pathname = new URL(n).pathname;
  if (pathname === '/' || pathname === '') return 'index.html';
  if (pathname.endsWith('.html')) return pathname.slice(1);
  return `${pathname.slice(1)}/index.html`;
}

function readHtml(rel) {
  const abs = path.join(LANDING, rel);
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs, 'utf8');
}

function extractLinks(html, fromRel) {
  const links = [];
  const re = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = m[1].trim();
    if (!href || href.startsWith('#')) continue;
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;

    let resolved = null;
    if (/^https?:\/\//i.test(href)) {
      resolved = normalizeUrl(href);
    } else if (href.startsWith('/')) {
      resolved = normalizeUrl(`${BASE}${href}`);
    } else {
      const fromUrl = pathToUrl(fromRel);
      resolved = normalizeUrl(new URL(href, fromUrl).toString());
    }
    if (resolved && resolved.startsWith(BASE)) links.push(resolved);
  }
  return links;
}

function equivalentForms(url) {
  const out = new Set();
  const n = normalizeUrl(url);
  if (!n) return out;
  out.add(n);
  const u = new URL(n);
  const p = u.pathname;
  if (p === '/') {
    out.add(`${u.origin}/index.html`);
  } else if (p.endsWith('/index.html')) {
    out.add(`${u.origin}${p.slice(0, -'/index.html'.length) || '/'}`);
    out.add(`${u.origin}${p.slice(0, -'index.html'.length)}`);
  } else if (!p.endsWith('.html')) {
    out.add(`${u.origin}${p}/index.html`);
    out.add(`${u.origin}${p}/`);
  } else {
    const baseDir = p.slice(0, p.lastIndexOf('/') + 1);
    out.add(`${u.origin}${baseDir}`);
  }
  return out;
}

function crawlReachable(startRels) {
  const visitedRels = new Set();
  const reachedUrls = new Set();
  const queue = [...startRels];

  while (queue.length) {
    const rel = queue.shift();
    if (visitedRels.has(rel)) continue;
    visitedRels.add(rel);

    const html = readHtml(rel);
    if (!html) continue;

    const selfUrl = normalizeUrl(pathToUrl(rel));
    if (selfUrl) {
      for (const v of equivalentForms(selfUrl)) reachedUrls.add(v);
    }

    const links = extractLinks(html, rel);
    for (const url of links) {
      for (const v of equivalentForms(url)) reachedUrls.add(v);
      const targetRel = urlToLandingRel(url);
      if (targetRel && !visitedRels.has(targetRel)) queue.push(targetRel);
    }
  }

  return { visitedRels, reachedUrls };
}

function defaultStartPages() {
  return [
    'index.html',
    'en/index.html',
    'es/index.html',
    'ja/index.html',
    'kok/index.html',
    'sv/index.html',
  ].filter((rel) => fs.existsSync(path.join(LANDING, rel)));
}

function main() {
  if (!fs.existsSync(SITEMAP)) {
    console.error('sitemap.xml not found in landing/');
    process.exit(2);
  }

  const xml = fs.readFileSync(SITEMAP, 'utf8');
  const locs = sitemapLocs(xml);
  const starts = defaultStartPages();
  const { visitedRels, reachedUrls } = crawlReachable(starts);

  const orphanLocs = [];
  for (const loc of locs) {
    if (!reachedUrls.has(loc)) {
      if (!STRICT) {
        const maybeCovered = [...equivalentForms(loc)].some((v) => reachedUrls.has(v));
        if (maybeCovered) continue;
      }
      orphanLocs.push(loc);
    }
  }

  console.log(`Start pages: ${starts.length}`);
  console.log(`Visited HTML pages: ${visitedRels.size}`);
  console.log(`Sitemap URLs: ${locs.length}`);
  console.log(`Potential orphan URLs: ${orphanLocs.length}\n`);

  for (const url of orphanLocs) console.log(url);

  // exit non-zero when orphans are found (useful for CI)
  process.exit(orphanLocs.length ? 1 : 0);
}

main();

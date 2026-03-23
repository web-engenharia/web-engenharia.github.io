#!/usr/bin/env node
/**
 * Fetches every URL declared in landing/sitemap.xml (<loc> and xhtml:link href)
 * against production (https://www.web-engenharia.com) and reports HTTP status.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITEMAP_PATH = path.join(__dirname, '../sitemap.xml');

function parseSitemap(xml) {
  const urls = new Set();
  const urlBlocks = xml.split(/<url>/i).slice(1);
  for (const block of urlBlocks) {
    const locM = block.match(/<loc>([^<]+)<\/loc>/i);
    if (locM) urls.add(locM[1].trim());
    const linkRe = /<xhtml:link\s+([^>]+)\/>/gi;
    let lm;
    while ((lm = linkRe.exec(block)) !== null) {
      const inner = lm[1];
      if (!/rel=["']alternate["']/i.test(inner)) continue;
      const href = inner.match(/href=["']([^"']+)["']/i);
      if (href) urls.add(href[1]);
    }
  }
  return [...urls].sort();
}

async function headStatus(url) {
  try {
    const r = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(25000),
    });
    return { url, status: r.status, ok: r.ok };
  } catch (e) {
    return { url, status: null, ok: false, error: String(e.message || e) };
  }
}

async function main() {
  const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const urls = parseSitemap(xml);
  console.log(`Checking ${urls.length} unique URLs (HEAD)…\n`);

  const bad = [];
  for (const url of urls) {
    const r = await headStatus(url);
    const line = r.status != null ? `${r.status} ${url}` : `ERR ${url} ${r.error || ''}`;
    if (!r.ok) {
      bad.push(r);
      console.log(`FAIL ${line}`);
    } else console.log(`OK   ${line}`);
  }

  console.log(`\nDone. ${bad.length} failed or non-2xx.`);
  process.exit(bad.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

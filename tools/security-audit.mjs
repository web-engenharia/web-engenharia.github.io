#!/usr/bin/env node
/**
 * Static security/hardening audit for the landing site.
 * Checks:
 * - Basic security headers in production response
 * - robots policy and sitemap declaration
 * - service-worker cache version consistency
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LANDING = path.resolve(__dirname, '..');
const REPORTS = path.join(__dirname, 'reports');
const OUT = path.join(REPORTS, 'security-audit.json');
const PROD_URL = 'https://www.web-engenharia.com/';

const REQUIRED_HEADERS = [
  'content-security-policy',
  'strict-transport-security',
  'referrer-policy',
  'x-content-type-options',
];

async function checkHeaders() {
  const warnings = [];
  try {
    const res = await fetch(PROD_URL, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(25000) });
    for (const h of REQUIRED_HEADERS) {
      if (!res.headers.get(h)) warnings.push({ type: 'missing_header', header: h });
    }
  } catch (e) {
    warnings.push({ type: 'prod_header_check_failed', detail: String(e?.message || e) });
  }
  return warnings;
}

function checkRobots() {
  const warnings = [];
  const robots = path.join(LANDING, 'robots.txt');
  if (!fs.existsSync(robots)) return [{ type: 'missing_robots_txt' }];
  const txt = fs.readFileSync(robots, 'utf8');
  if (!/Sitemap:\s*https:\/\/www\.web-engenharia\.com\/sitemap\.xml/i.test(txt)) {
    warnings.push({ type: 'robots_missing_sitemap' });
  }
  if (!/Disallow:\s*\/animacao_svg\//i.test(txt)) {
    warnings.push({ type: 'robots_missing_animacao_svg_disallow' });
  }
  return warnings;
}

function checkServiceWorker() {
  const warnings = [];
  const sw = path.join(LANDING, 'service-worker.js');
  if (!fs.existsSync(sw)) return [{ type: 'missing_service_worker' }];
  const txt = fs.readFileSync(sw, 'utf8');
  const cache = txt.match(/CACHE_NAME\s*=\s*['"]([^'"]+)['"]/);
  if (!cache) warnings.push({ type: 'sw_missing_cache_name' });
  if (!/self\.addEventListener\('fetch'/.test(txt)) warnings.push({ type: 'sw_missing_fetch_handler' });
  return warnings;
}

async function main() {
  fs.mkdirSync(REPORTS, { recursive: true });
  const warnings = [...(await checkHeaders()), ...checkRobots(), ...checkServiceWorker()];
  const out = {
    generatedAt: new Date().toISOString(),
    warnings,
    warningCount: warnings.length,
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`Security audit report: ${OUT}`);
  console.log(`Warnings: ${warnings.length}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

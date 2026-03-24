#!/usr/bin/env node
/**
 * Serves landing/ with Python http.server, runs Lighthouse (SEO + Performance)
 * on a fixed URL set (home, boutique locales, all product pages in sitemap, samples),
 * writes JSON reports under landing/tools/reports/.
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const LANDING = path.join(ROOT, 'landing');
const REPORT_DIR = path.join(__dirname, 'reports');
const PORT = 4173;
const HOST = `http://127.0.0.1:${PORT}`;

const URLS = [
  '/',
  '/en/',
  '/produtos/',
  '/boutique-engenharia/',
  '/en/boutique-engenharia/',
  '/es/boutique-engenharia/',
  '/ja/boutique-engenharia/',
  '/kok/boutique-engenharia/',
  '/sv/boutique-engenharia/',
  '/produtos/w-iot/',
  '/produtos/w-pulse/',
  '/produtos/neuroflow/',
  '/produtos/w-safe/',
  '/produtos/w-ledger/',
  '/produtos/neuromatch/',
  '/produtos/w-compliance/',
  '/produtos/neurosupport/',
  '/artigos/',
  '/en/artigos/',
  '/artigos/alem-do-hype-arquiteturas-cognitivas-llms.html',
  '/en/artigos/alem-do-hype-arquiteturas-cognitivas-llms.html',
  '/tecnologias/docker.html',
  '/en/tecnologias/docker.html',
];

function slugFromPath(p) {
  return p.replace(/\//g, '_').replace(/^_/, '') || 'root';
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', LANDING], {
    cwd: ROOT,
    stdio: 'ignore',
    detached: false,
  });

  server.on('error', (err) => {
    console.error('Failed to start http.server:', err.message);
    process.exit(1);
  });

  await wait(800);

  const summary = [];

  try {
    for (const pathname of URLS) {
      const url = `${HOST}${pathname === '/' ? '' : pathname}`;
      const name = `lighthouse-${slugFromPath(pathname)}.json`;
      const outPath = path.join(REPORT_DIR, name);

      console.error(`\n--- Lighthouse: ${url} ---\n`);

      const r = spawnSync(
        'npx',
        [
          'lighthouse',
          url,
          '--only-categories=seo,performance',
          '--output=json',
          `--output-path=${outPath}`,
          '--chrome-flags=--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage',
          '--quiet',
        ],
        { cwd: ROOT, stdio: 'inherit', shell: true }
      );

      if (r.status !== 0) {
        console.error(`Lighthouse failed for ${url} (exit ${r.status})`);
        summary.push({ url, ok: false });
        continue;
      }

      const j = JSON.parse(fs.readFileSync(outPath, 'utf8'));
      const cats = j.categories || {};
      const seo = cats.seo?.score != null ? Math.round(cats.seo.score * 100) : null;
      const perf = cats.performance?.score != null ? Math.round(cats.performance.score * 100) : null;
      summary.push({ url, seo, performance: perf, report: outPath, ok: true });
      console.error(`SEO: ${seo}  Performance: ${perf}  -> ${path.relative(ROOT, outPath)}`);
    }
  } finally {
    server.kill('SIGTERM');
  }

  const outSummary = path.join(REPORT_DIR, 'lighthouse-summary.json');
  fs.writeFileSync(outSummary, JSON.stringify(summary, null, 2));
  console.error(`\nSummary written to ${path.relative(ROOT, outSummary)}`);

  const failed = summary.filter((s) => !s.ok);
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

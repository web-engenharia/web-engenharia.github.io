#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS = path.join(__dirname, 'reports');
const LIGHTHOUSE_SUMMARY = path.join(REPORTS, 'lighthouse-summary.json');
const BUDGET_FILE = path.join(__dirname, 'perf-budget.json');
const OUT_FILE = path.join(REPORTS, 'perf-budget.json');

function main() {
  if (!fs.existsSync(LIGHTHOUSE_SUMMARY)) {
    console.error('Missing lighthouse summary. Run npm run seo:lighthouse first.');
    process.exit(1);
  }
  const budget = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'));
  const rows = JSON.parse(fs.readFileSync(LIGHTHOUSE_SUMMARY, 'utf8'));

  const failures = [];
  for (const row of rows) {
    if (!row.ok) {
      failures.push({ type: 'lighthouse_failed', url: row.url });
      continue;
    }
    if (typeof row.seo === 'number' && row.seo < budget.seoMinScore) {
      failures.push({ type: 'seo_below_budget', url: row.url, value: row.seo, min: budget.seoMinScore });
    }
    if (typeof row.performance === 'number' && row.performance < budget.performanceMinScore) {
      failures.push({
        type: 'performance_below_budget',
        url: row.url,
        value: row.performance,
        min: budget.performanceMinScore,
      });
    }
  }

  const out = {
    generatedAt: new Date().toISOString(),
    budget,
    scanned: rows.length,
    failures,
  };
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`Perf budget report: ${OUT_FILE}`);
  console.log(`Scanned: ${rows.length}, failures: ${failures.length}`);
  process.exit(failures.length ? 1 : 0);
}

main();

#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const STEPS = [
  { name: 'crawl:local', required: true },
  { name: 'i18n:audit', required: true },
  { name: 'seo', required: true },
  { name: 'seo:snippets', required: true },
  { name: 'a11y', required: false },
  { name: 'seo:lighthouse', required: false },
  { name: 'perf:budget', required: false },
  { name: 'security:audit', required: true },
  { name: 'quality:dashboard', required: true },
];

let failedRequired = false;

for (const step of STEPS) {
  console.error(`\n=== npm run ${step.name} ===\n`);
  const r = spawnSync('npm', ['run', step.name], { cwd: ROOT, stdio: 'inherit', shell: true });
  if (r.status !== 0) {
    if (step.required) failedRequired = true;
    console.error(`Step failed: ${step.name} (required=${step.required})`);
  }
}

process.exit(failedRequired ? 1 : 0);

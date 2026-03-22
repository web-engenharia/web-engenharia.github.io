#!/usr/bin/env node
/**
 * Runs @axe-core/cli against key static HTML files (file:// URLs).
 * Requires a compatible Chrome / ChromeDriver pair; if axe fails, see landing/tools/a11y-checklist.txt
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landing = path.resolve(__dirname, '..');
const files = [
  'index.html',
  'en/index.html',
  'carreiras.html',
  'en/careers.html',
];

let failed = false;
for (const rel of files) {
  const abs = path.join(landing, rel);
  const url = 'file://' + abs;
  console.error('\n--- axe:', rel, '---\n');
  const r = spawnSync(
    'npx',
    ['@axe-core/cli', url, '--exit', '--timeout', '120000'],
    { stdio: 'inherit', shell: true, cwd: path.resolve(__dirname, '../..') }
  );
  if (r.status !== 0) failed = true;
}

process.exit(failed ? 1 : 0);

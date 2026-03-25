#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS = path.join(__dirname, 'reports');

function readJsonIfExists(p) {
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function main() {
  const crawl = readJsonIfExists(path.join(REPORTS, 'crawl-report.json'));
  const i18n = readJsonIfExists(path.join(REPORTS, 'i18n-audit.json'));
  const perf = readJsonIfExists(path.join(REPORTS, 'perf-budget.json'));
  const sec = readJsonIfExists(path.join(REPORTS, 'security-audit.json'));

  const dashboard = {
    generatedAt: new Date().toISOString(),
    navigation: crawl
      ? {
          reachable: crawl.stats?.reachable ?? null,
          htmlOnDisk: crawl.stats?.htmlOnDisk ?? null,
          broken: crawl.stats?.broken ?? null,
          orphans: crawl.stats?.orphans ?? null,
        }
      : null,
    i18n: i18n
      ? {
          routesChecked: i18n.stats?.routesChecked ?? null,
          issues: i18n.stats?.issues ?? null,
          warnings: i18n.stats?.warnings ?? null,
        }
      : null,
    performance: perf
      ? {
          scanned: perf.scanned ?? null,
          failures: Array.isArray(perf.failures) ? perf.failures.length : null,
        }
      : null,
    security: sec
      ? {
          warnings: sec.warningCount ?? null,
        }
      : null,
  };

  const jsonOut = path.join(REPORTS, 'quality-dashboard.json');
  fs.writeFileSync(jsonOut, JSON.stringify(dashboard, null, 2) + '\n', 'utf8');

  const md = [];
  md.push('# Quality dashboard');
  md.push('');
  md.push(`- Generated: ${dashboard.generatedAt}`);
  if (dashboard.navigation) {
    md.push(`- Navigation: reachable=${dashboard.navigation.reachable}, htmlOnDisk=${dashboard.navigation.htmlOnDisk}, broken=${dashboard.navigation.broken}, orphans=${dashboard.navigation.orphans}`);
  }
  if (dashboard.i18n) {
    md.push(`- i18n: routesChecked=${dashboard.i18n.routesChecked}, issues=${dashboard.i18n.issues}, warnings=${dashboard.i18n.warnings}`);
  }
  if (dashboard.performance) {
    md.push(`- Performance: scanned=${dashboard.performance.scanned}, budgetFailures=${dashboard.performance.failures}`);
  }
  if (dashboard.security) {
    md.push(`- Security: warnings=${dashboard.security.warnings}`);
  }
  md.push('');

  const mdOut = path.join(REPORTS, 'quality-dashboard.md');
  fs.writeFileSync(mdOut, md.join('\n') + '\n', 'utf8');
  console.log(`Dashboard written: ${jsonOut}`);
}

main();

#!/usr/bin/env node
/**
 * Per logical page (pt-BR representative route): which HREFLANG_LOCALES have a
 * published route in crawl-report.json `pages` (via alternateRoute).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { HREFLANG_LOCALES, alternateRoute, parseRoute } from './hreflang-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS = path.join(__dirname, 'reports');
const CRAWL_JSON = path.join(REPORTS, 'crawl-report.json');
const OUT_JSON = path.join(REPORTS, 'translation-coverage.json');
const OUT_MD = path.join(REPORTS, 'translation-coverage.md');

function main() {
  if (!fs.existsSync(CRAWL_JSON)) {
    console.error('Missing crawl report:', CRAWL_JSON);
    process.exit(1);
  }
  const crawl = JSON.parse(fs.readFileSync(CRAWL_JSON, 'utf8'));
  const pages = crawl.pages || {};

  /** @type {Array<{ representativeRoute: string, alternateByLocale: Record<string, string>, missingLocales: string[] }>} */
  const rows = [];

  const routes = Object.keys(pages)
    .filter((r) => r.endsWith('/') || r.endsWith('.html'))
    .sort();

  for (const route of routes) {
    if (parseRoute(route).locale !== 'pt-BR') continue;

    /** @type {Record<string, string>} */
    const alternateByLocale = {};
    /** @type {string[]} */
    const missingLocales = [];

    for (const loc of HREFLANG_LOCALES) {
      const p = alternateRoute(route, loc, pages);
      if (p) alternateByLocale[loc] = p;
      else missingLocales.push(loc);
    }

    rows.push({
      representativeRoute: route,
      alternateByLocale,
      missingLocales,
    });
  }

  const incomplete = rows.filter((r) => r.missingLocales.length > 0);
  const stats = {
    ptBrRoutesChecked: rows.length,
    completeCoverage: rows.filter((r) => r.missingLocales.length === 0).length,
    incompleteCoverage: incomplete.length,
  };

  const out = {
    generatedAt: new Date().toISOString(),
    stats,
    incomplete,
    coverage: rows,
  };

  fs.mkdirSync(REPORTS, { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2) + '\n', 'utf8');

  const md = [];
  md.push('# Translation coverage (locale routes in crawl)');
  md.push('');
  md.push(`- Generated: ${out.generatedAt}`);
  md.push(`- pt-BR representative routes: ${stats.ptBrRoutesChecked}`);
  md.push(`- Full coverage (all 6 locales have a page in crawl): ${stats.completeCoverage}`);
  md.push(`- Incomplete (at least one locale missing): ${stats.incompleteCoverage}`);
  md.push('');
  md.push('Each row uses the **pt-BR** URL as the logical page; `alternateRoute` resolves cluster paths (e.g. careers).');
  md.push('');
  md.push('## Incomplete coverage');
  md.push('');
  if (!incomplete.length) {
    md.push('*(none)*');
  } else {
    for (const r of incomplete) {
      md.push(`- \`${r.representativeRoute}\` — missing: ${r.missingLocales.join(', ')}`);
    }
  }
  md.push('');
  md.push('## Full table');
  md.push('');
  md.push('See `translation-coverage.json` field `coverage` for every pt-BR route and `alternateByLocale`.');
  md.push('');
  fs.writeFileSync(OUT_MD, md.join('\n') + '\n', 'utf8');

  console.log('Wrote', OUT_JSON, OUT_MD);
  process.exit(0);
}

main();

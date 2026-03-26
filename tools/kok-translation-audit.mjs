#!/usr/bin/env node
/**
 * Audit Konknni (kok) HTML for English UI leakage and Portuguese copy-paste.
 * Pairs each kok file with pt-BR source (see kok-translation-config.mjs).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ALLOW_SUBSTRINGS,
  EN_UI_TERMS,
  KOK_ROOT,
  LANDING_ROOT,
  PT_LEAK_REGEXES,
  pairKokToPt,
} from './kok-translation-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS = path.join(__dirname, 'reports');
const OUT_JSON = path.join(REPORTS, 'kok-translation-audit.json');
const OUT_MD = path.join(REPORTS, 'kok-translation-audit.md');

/** @param {string} dir */
function walkHtml(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    const st = fs.statSync(abs);
    if (st.isDirectory()) walkHtml(abs, out);
    else if (name.endsWith('.html')) out.push(abs);
  }
  return out;
}

function relFromLanding(abs) {
  return path.relative(LANDING_ROOT, abs).replace(/\\/g, '/');
}

function stripForTextScan(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
}

/**
 * Neutralize URL fragments and paths so PT regexes do not match `contato` in `#contato`,
 * `produtos` in `/produtos/`, etc. (audit-only; does not modify source files.)
 */
function scrubUrlsForAudit(html) {
  return html
    .replace(/#contato\b/gi, '#__contact__')
    .replace(/#contacto\b/gi, '#__contact__')
    .replace(/\/produtos\//gi, '/__prod__/')
    .replace(/\/artigos\//gi, '/__art__/')
    .replace(/artigos\//gi, 'arx/') // relative href="artigos/…"
    .replace(/\/carreiras\b/gi, '/__careers__')
    .replace(/#produtos[^\s"'#]*/gi, '#__prod__')
    .replace(/\bid="contato"/gi, 'id="__ct__"')
    .replace(/contato-heading/gi, 'sampark-heading')
    .replace(/desenvolvimento-mobile/gi, 'dev-mobile');
}

function extractMetaBlocks(head) {
  const blocks = [];
  const re = /<meta\s+[^>]*>/gi;
  let m;
  while ((m = re.exec(head)) !== null) {
    const tag = m[0];
    if (/name=["']description["']/i.test(tag) || /property=["']og:([^"']+)["']/i.test(tag) || /name=["']twitter:([^"']+)["']/i.test(tag)) {
      const c = tag.match(/\bcontent=["']([^"']*)["']/i);
      if (c) blocks.push({ kind: 'meta', text: c[1] });
    }
  }
  const title = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) blocks.push({ kind: 'title', text: title[1].trim() });
  return blocks;
}

function allowedLine(text) {
  for (const s of ALLOW_SUBSTRINGS) {
    if (text.includes(s)) return true;
  }
  return false;
}

function findEnUiIssues(text, fileRel, lineOffset) {
  const issues = [];
  for (const term of EN_UI_TERMS) {
    if (term === 'Home') {
      if (!/\bHome\b/.test(text)) continue;
      if (/\bHome-ak\b/.test(text)) continue;
    } else if (!text.includes(term)) continue;
    if (allowedLine(text)) continue;
    issues.push({ type: 'en_ui', file: fileRel, line: lineOffset, text: term });
  }
  return issues;
}

function findPtLeaks(text, fileRel, lineOffset) {
  const issues = [];
  for (const rx of PT_LEAK_REGEXES) {
    if (rx.test(text)) {
      issues.push({ type: 'pt_leak', file: fileRel, line: lineOffset, detail: rx.source });
    }
  }
  return issues;
}

function main() {
  const kokFiles = walkHtml(KOK_ROOT).sort();
  /** @type {Array<{kokRel: string, ptRel: string | null, ptExists: boolean}>} */
  const pairs = [];
  /** @type {Array<{type: string, file: string, line?: number, text?: string, detail?: string}>} */
  const findings = [];

  for (const abs of kokFiles) {
    const kokRel = relFromLanding(abs);
    const { ptRel, exists } = pairKokToPt(kokRel);
    pairs.push({ kokRel, ptRel, ptExists: exists });
    if (ptRel && !exists) {
      findings.push({ type: 'missing_pt_pair', file: kokRel, detail: ptRel });
    }

    let html = fs.readFileSync(abs, 'utf8');
    html = scrubUrlsForAudit(html);
    const headM = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const head = headM ? headM[1] : '';
    for (const block of extractMetaBlocks(head)) {
      const t = block.text;
      if (!t || allowedLine(t)) continue;
      for (const term of EN_UI_TERMS) {
        if (t.includes(term)) {
          findings.push({ type: 'mixed_meta', file: kokRel, kind: block.kind, text: term });
        }
      }
      for (const rx of PT_LEAK_REGEXES) {
        if (rx.test(t)) {
          findings.push({ type: 'mixed_meta_pt', file: kokRel, kind: block.kind, detail: rx.source });
        }
      }
    }

    const body = stripForTextScan(html);
    const lines = body.split(/\r?\n/);
    lines.forEach((line, i) => {
      const trimmed = line.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (!trimmed || trimmed.length < 4) return;
      if (allowedLine(trimmed)) return;
      findings.push(...findEnUiIssues(trimmed, kokRel, i + 1));
      findings.push(...findPtLeaks(trimmed, kokRel, i + 1));
    });
  }

  const dedup = new Set();
  const unique = findings.filter((f) => {
    const key = JSON.stringify(f);
    if (dedup.has(key)) return false;
    dedup.add(key);
    return true;
  });

  const stats = {
    kokFiles: kokFiles.length,
    pairsWithPt: pairs.filter((p) => p.ptExists).length,
    pairsMissingPt: pairs.filter((p) => p.ptRel && !p.ptExists).length,
    findings: unique.length,
  };

  const out = {
    generatedAt: new Date().toISOString(),
    stats,
    pairs,
    findings: unique,
  };

  fs.mkdirSync(REPORTS, { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2) + '\n', 'utf8');

  const md = [];
  md.push('# Kok translation audit');
  md.push('');
  md.push(`- Kok HTML files: ${stats.kokFiles}`);
  md.push(`- Paired with existing pt-BR file: ${stats.pairsWithPt}`);
  md.push(`- Missing pt-BR pair file: ${stats.pairsMissingPt}`);
  md.push(`- Findings (deduplicated): ${stats.findings}`);
  md.push('');
  md.push('## Findings (first 400)');
  for (const f of unique.slice(0, 400)) {
    md.push(`- \`${f.type}\` \`${f.file}\`${f.line ? ` L${f.line}` : ''}${f.text ? ` — ${f.text}` : ''}${f.detail ? ` — ${f.detail}` : ''}${f.kind ? ` [${f.kind}]` : ''}`);
  }
  if (unique.length > 400) md.push(`- ... ${unique.length - 400} more`);
  md.push('');
  fs.writeFileSync(OUT_MD, md.join('\n') + '\n', 'utf8');

  console.log('Wrote', OUT_JSON);
  process.exit(0);
}

main();

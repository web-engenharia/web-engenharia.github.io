#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LANDING = path.resolve(__dirname, '..');

const TITLE_MAX = Number.parseInt(process.env.SEO_TITLE_MAX ?? '60', 10);
const DESC_MAX = Number.parseInt(process.env.SEO_DESC_MAX ?? '155', 10);
const IGNORE_DIRS = new Set(['animacao_svg']);

function walkHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      walkHtml(path.join(dir, entry.name), out);
      continue;
    }
    if (entry.name.endsWith('.html') && entry.name !== '_template.html') {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

function collapseSpaces(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function extractTitle(head) {
  const m = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? collapseSpaces(m[1].replace(/<[^>]+>/g, '')) : '';
}

function extractMetaDescription(head) {
  const byNameFirst = head.match(
    /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i
  );
  if (byNameFirst) return collapseSpaces(byNameFirst[1]);
  const byContentFirst = head.match(
    /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i
  );
  return byContentFirst ? collapseSpaces(byContentFirst[1]) : '';
}

const files = walkHtml(LANDING).sort();
const violations = [];

for (const file of files) {
  const rel = path.relative(LANDING, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const head = headMatch ? headMatch[1] : '';
  const title = extractTitle(head);
  const description = extractMetaDescription(head);

  if (!title) {
    violations.push({ rel, type: 'missing_title' });
  } else if (title.length > TITLE_MAX) {
    violations.push({
      rel,
      type: 'title_too_long',
      length: title.length,
      max: TITLE_MAX,
      value: title,
    });
  }

  if (!description) {
    violations.push({ rel, type: 'missing_description' });
  } else if (description.length > DESC_MAX) {
    violations.push({
      rel,
      type: 'description_too_long',
      length: description.length,
      max: DESC_MAX,
      value: description,
    });
  }
}

console.log(`SEO snippet check scanned ${files.length} HTML files.`);
console.log(`Limits: title <= ${TITLE_MAX}, description <= ${DESC_MAX}\n`);

if (!violations.length) {
  console.log('No violations found.');
  process.exit(0);
}

for (const v of violations) {
  if (v.type === 'missing_title' || v.type === 'missing_description') {
    console.log(`${v.type}: ${v.rel}`);
    continue;
  }
  console.log(`${v.type}: ${v.rel} (${v.length}/${v.max})`);
}

console.log(`\nTotal violations: ${violations.length}`);
process.exit(1);

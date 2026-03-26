/**
 * Konknni (kok) translation audit: glossary, PT leakage patterns, file pairing.
 * Romanization style matches existing pages (e.g. landing/kok/index.html).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Root of static site (parent of tools/). */
export const LANDING_ROOT = path.resolve(__dirname, '..');

/** Kok HTML subtree. */
export const KOK_ROOT = path.join(LANDING_ROOT, 'kok');

/**
 * Map `kok/relative/path` → pt-BR `landing/relative/path`.
 * @param {string} kokRel posix-style relative path from LANDING_ROOT, e.g. `kok/index.html`
 */
export function kokPathToPtPath(kokRel) {
  const norm = kokRel.replace(/\\/g, '/');
  if (!norm.startsWith('kok/')) return null;
  const rest = norm.slice('kok/'.length);
  if (rest === 'careers.html') return 'carreiras.html';
  return rest;
}

/**
 * @param {string} kokRel
 * @returns {{ ptRel: string | null, ptAbs: string | null, exists: boolean }}
 */
export function pairKokToPt(kokRel) {
  const ptRel = kokPathToPtPath(kokRel);
  if (!ptRel) return { ptRel: null, ptAbs: null, exists: false };
  const ptAbs = path.join(LANDING_ROOT, ptRel);
  return { ptRel, ptAbs, exists: fs.existsSync(ptAbs) };
}

/** English UI strings (whole word / phrase) that should not appear in kok body text (heuristic). */
export const EN_UI_TERMS = [
  'Products',
  'Contact',
  'Articles',
  'Home',
  'Go to content',
  'Back to home',
  'Schedule a call',
  'Send via WhatsApp',
  'Engineering Boutique',
  'Secondary navigation',
  'Breadcrumb',
];

/** Portuguese phrases common in PT source — strong signal if unchanged in kok. */
export const PT_LEAK_REGEXES = [
  /\bConsultoria\b/i,
  /\bintegrações\b/i,
  /\bDesenvolvimento\b/i,
  /\bPortfólio\b/i,
  /\bProdutos\b/i,
  /\bContato\b/i,
  /\bArtigos\b/i,
  /\bIr para o conteúdo\b/i,
  /\bVoltar ao início\b/i,
  /\bSeu nome\b/i,
  /\bSua empresa\b/i,
  /\bDescreva seu\b/i,
];

/** Substrings allowed even if they match English (brands, tech). */
export const ALLOW_SUBSTRINGS = [
  'Web-Engenharia',
  'W-',
  'Neuro',
  'GitHub',
  'GitLab',
  'DORA',
  'API',
  'JSON',
  'UTFPR',
  'UFPR',
  'WhatsApp',
  'schema.org',
  'application/ld+json',
];

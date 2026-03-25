#!/usr/bin/env node
/**
 * Local HTTP crawl for landing/ (coverage + broken links + orphans).
 *
 * - Starts a local static server for landing/
 * - Crawls from seeds: /, /en/, /es/, /ja/, /kok/, /sv/
 * - Extracts internal links from HTML and follows them
 * - Writes reports to landing/tools/reports/crawl-report.{json,md}
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LANDING = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(__dirname, 'reports');

const DEFAULT_SEEDS = ['/', '/en/', '/es/', '/ja/', '/kok/', '/sv/'];
const IGNORE_DIR = new Set(['animacao_svg', 'tools', 'node_modules']);

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function toPosix(p) {
  return p.replace(/\\/g, '/');
}

function listHtmlFiles(rootDir) {
  /** @type {string[]} */
  const out = [];

  /** @param {string} dir */
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.isDirectory() && IGNORE_DIR.has(ent.name)) continue;
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(abs);
      else if (ent.isFile() && ent.name.endsWith('.html') && ent.name !== '_template.html') out.push(abs);
    }
  }

  walk(rootDir);
  return out;
}

function decodeUrlPathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

function safeJoin(root, rel) {
  const abs = path.resolve(root, rel);
  if (!abs.startsWith(root + path.sep) && abs !== root) return null;
  return abs;
}

function contentTypeFor(p) {
  const ext = path.extname(p).toLowerCase();
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
      return 'text/javascript; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.xml':
      return 'application/xml; charset=utf-8';
    case '.txt':
      return 'text/plain; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.ico':
      return 'image/x-icon';
    case '.woff2':
      return 'font/woff2';
    default:
      return 'application/octet-stream';
  }
}

function resolveRequestToFile(root, reqUrl) {
  const u = new URL(reqUrl, 'http://localhost');
  const pathname = decodeUrlPathname(u.pathname || '/');

  // Map clean URLs to index.html
  let rel;
  if (pathname === '/' || pathname === '') rel = 'index.html';
  else if (pathname.endsWith('/')) rel = pathname.slice(1) + 'index.html';
  else rel = pathname.slice(1);

  const abs = safeJoin(root, rel);
  return abs ? { abs, rel: toPosix(rel) } : null;
}

function startStaticServer(rootDir) {
  const server = http.createServer((req, res) => {
    const method = String(req.method || 'GET').toUpperCase();
    if (method !== 'GET' && method !== 'HEAD') {
      res.statusCode = 405;
      res.setHeader('content-type', 'text/plain; charset=utf-8');
      res.end('Method Not Allowed');
      return;
    }

    const mapped = resolveRequestToFile(rootDir, req.url || '/');
    if (!mapped) {
      res.statusCode = 400;
      res.setHeader('content-type', 'text/plain; charset=utf-8');
      res.end('Bad Request');
      return;
    }

    if (!fs.existsSync(mapped.abs) || !fs.statSync(mapped.abs).isFile()) {
      res.statusCode = 404;
      res.setHeader('content-type', 'text/plain; charset=utf-8');
      res.end('Not Found');
      return;
    }

    res.statusCode = 200;
    res.setHeader('content-type', contentTypeFor(mapped.abs));
    if (method === 'HEAD') {
      res.end();
      return;
    }

    fs.createReadStream(mapped.abs).pipe(res);
  });

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') return reject(new Error('Could not bind server'));
      resolve({ server, port: addr.port });
    });
  });
}

function normalizeCrawlPath(p) {
  // p: URL pathname (no origin), optionally with query/hash.
  if (!p) return '/';

  // Strip hash and query
  const noHash = p.split('#')[0];
  const noQuery = noHash.split('?')[0];

  if (!noQuery.startsWith('/')) return null;

  // Collapse multiple slashes
  let out = noQuery.replace(/\/{2,}/g, '/');

  // Normalize /index.html to /
  out = out.replace(/\/index\.html$/i, '/');
  if (out === '') out = '/';

  return out;
}

function isHtmlRoute(route) {
  if (!route) return false;
  if (route.endsWith('/')) return true;
  return route.endsWith('.html');
}

function isSkippableHref(href) {
  const h = String(href || '').trim();
  if (!h) return true;
  if (h.startsWith('#')) return true;
  if (/^(mailto:|tel:|javascript:|data:)/i.test(h)) return true;
  return false;
}

function extractInternalLinks(html, baseUrl) {
  /** @type {Set<string>} */
  const out = new Set();

  // a[href]
  const aRe = /<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi;
  let m;
  while ((m = aRe.exec(html)) !== null) {
    const href = m[2];
    if (isSkippableHref(href)) continue;
    try {
      const u = new URL(href, baseUrl);
      out.add(u.href);
    } catch {
      // ignore
    }
  }

  // link[href] (canonical, alternate, etc) can also introduce reachable pages
  const linkRe = /<link\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi;
  while ((m = linkRe.exec(html)) !== null) {
    const href = m[2];
    if (isSkippableHref(href)) continue;
    try {
      const u = new URL(href, baseUrl);
      out.add(u.href);
    } catch {
      // ignore
    }
  }

  return [...out];
}

async function fetchUrl(url) {
  const startedAt = Date.now();
  try {
    const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(25000) });
    const ct = r.headers.get('content-type') || '';
    const body = ct.includes('text/html') ? await r.text() : null;
    return {
      url,
      ok: r.ok,
      status: r.status,
      contentType: ct,
      elapsedMs: Date.now() - startedAt,
      html: body,
    };
  } catch (e) {
    return {
      url,
      ok: false,
      status: null,
      contentType: '',
      elapsedMs: Date.now() - startedAt,
      html: null,
      error: String(e?.message || e),
    };
  }
}

function routeFromRelFile(rel) {
  // rel like "index.html" or "en/index.html" or "artigos/foo.html"
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'/index.html'.length) + '/';
  return '/' + rel;
}

function relFileFromRoute(route) {
  // route like "/en/" or "/artigos/foo.html"
  if (route === '/' || route === '') return 'index.html';
  if (route.endsWith('/')) return route.slice(1) + 'index.html';
  return route.slice(1);
}

function mdEscape(s) {
  return String(s).replace(/[\\`*_{}[\]()#+\-.!|]/g, '\\$&');
}

async function main() {
  ensureDir(REPORTS_DIR);

  const { server, port } = await startStaticServer(LANDING);
  const origin = `http://127.0.0.1:${port}`;

  /** @type {{ from: string, to: string }[]} */
  const edges = [];
  /** @type {Map<string, { status: number|null, ok: boolean, contentType: string, error?: string, elapsedMs: number }>} */
  const pages = new Map();

  /** @type {string[]} */
  const queue = [];
  /** @type {Set<string>} */
  const seen = new Set();

  for (const s of DEFAULT_SEEDS) {
    const n = normalizeCrawlPath(s);
    if (!n) continue;
    if (!seen.has(n)) {
      seen.add(n);
      queue.push(n);
    }
  }

  while (queue.length) {
    const route = queue.shift();
    const url = origin + route;
    const res = await fetchUrl(url);

    pages.set(route, {
      status: res.status,
      ok: res.ok,
      contentType: res.contentType,
      elapsedMs: res.elapsedMs,
      ...(res.error ? { error: res.error } : {}),
    });

    if (!res.ok || !res.html) continue;

    const baseUrl = url;
    const links = extractInternalLinks(res.html, baseUrl);
    for (const href of links) {
      let u;
      try {
        u = new URL(href);
      } catch {
        continue;
      }
      if (u.origin !== origin) continue;
      const n = normalizeCrawlPath(u.pathname + (u.search || '') + (u.hash || ''));
      if (!n) continue;
      if (!isHtmlRoute(n)) continue;

      edges.push({ from: route, to: n });

      if (!seen.has(n)) {
        seen.add(n);
        queue.push(n);
      }
    }
  }

  // Orphans: HTML files on disk that are not reachable (by route).
  const allHtmlAbs = listHtmlFiles(LANDING);
  const allRel = allHtmlAbs.map((abs) => toPosix(path.relative(LANDING, abs)));
  const allRoutes = new Set(allRel.map(routeFromRelFile));

  /** @type {string[]} */
  const reachableRoutes = [...pages.keys()].sort();
  /** @type {string[]} */
  const orphanRoutes = [...allRoutes].filter((r) => !pages.has(r)).sort();

  const broken = reachableRoutes
    .map((r) => ({ route: r, ...pages.get(r) }))
    .filter((p) => !p.ok)
    .sort((a, b) => String(a.status ?? 999).localeCompare(String(b.status ?? 999)) || a.route.localeCompare(b.route));

  const report = {
    generatedAt: new Date().toISOString(),
    origin,
    seeds: DEFAULT_SEEDS,
    stats: {
      reachable: reachableRoutes.length,
      edges: edges.length,
      broken: broken.length,
      htmlOnDisk: allRel.length,
      orphans: orphanRoutes.length,
    },
    pages: Object.fromEntries(pages.entries()),
    edges,
    orphans: orphanRoutes,
  };

  const jsonPath = path.join(REPORTS_DIR, 'crawl-report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

  const md = [];
  md.push(`# Crawl report (local)\n`);
  md.push(`- **Generated**: ${mdEscape(report.generatedAt)}`);
  md.push(`- **Origin**: ${mdEscape(origin)}`);
  md.push(`- **Seeds**: ${DEFAULT_SEEDS.map(mdEscape).join(', ')}`);
  md.push(`- **Reachable**: ${report.stats.reachable}`);
  md.push(`- **Broken**: ${report.stats.broken}`);
  md.push(`- **HTML on disk**: ${report.stats.htmlOnDisk}`);
  md.push(`- **Orphans**: ${report.stats.orphans}\n`);

  if (broken.length) {
    md.push(`## Broken / error pages\n`);
    for (const b of broken.slice(0, 200)) {
      md.push(`- \`${b.route}\` — status=${b.status ?? 'ERR'} ${b.error ? `(${mdEscape(b.error)})` : ''}`);
    }
    if (broken.length > 200) md.push(`- ... ${broken.length - 200} more`);
    md.push('');
  }

  if (orphanRoutes.length) {
    md.push(`## Orphan HTML files (not reachable from seeds)\n`);
    for (const r of orphanRoutes.slice(0, 400)) md.push(`- \`${r}\``);
    if (orphanRoutes.length > 400) md.push(`- ... ${orphanRoutes.length - 400} more`);
    md.push('');
  }

  const mdPath = path.join(REPORTS_DIR, 'crawl-report.md');
  fs.writeFileSync(mdPath, md.join('\n') + '\n', 'utf8');

  server.close();

  // Exit code: fail on broken pages (excluding assets; we only stored routes we fetched).
  process.exit(broken.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


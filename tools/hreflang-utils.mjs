/**
 * Shared hreflang resolution: only locales with a real page in crawl-report pages map.
 */
export const BASE = 'https://www.web-engenharia.com';
export const LOCALES = ['en', 'es', 'ja', 'kok', 'sv'];
/** Locales used in hreflang link tags (BCP 47 + site convention). */
export const HREFLANG_LOCALES = ['pt-BR', 'en', 'es', 'ja', 'kok', 'sv'];

/**
 * Clusters where the same logical page uses different paths per locale (not only `/{locale}/` prefix).
 * Values must match keys in crawl-report.json `pages`.
 */
export const ROUTE_CLUSTERS = [
  {
    'pt-BR': '/carreiras.html',
    en: '/en/careers.html',
    es: '/es/careers.html',
    sv: '/sv/careers.html',
  },
];

export function findClusterForRoute(route) {
  for (const cluster of ROUTE_CLUSTERS) {
    const hit = Object.values(cluster).includes(route);
    if (hit) return cluster;
  }
  return null;
}

/** @returns {{ locale: string, rest: string }} */
export function parseRoute(route) {
  const m = route.match(/^\/(en|es|ja|kok|sv)(\/.*)?$/);
  if (m) {
    const rest = m[2] === undefined || m[2] === '/' ? '/' : m[2];
    return { locale: m[1], rest };
  }
  return { locale: 'pt-BR', rest: route };
}

export function pathForLocale(rest, locale) {
  if (locale === 'pt-BR') {
    return rest || '/';
  }
  if (!rest || rest === '/') {
    return `/${locale}/`;
  }
  return `/${locale}${rest}`;
}

/**
 * Resolved path in `pages` for this logical page and BCP locale, or null if no page exists.
 */
export function alternateRoute(route, locale, pages) {
  const cluster = findClusterForRoute(route);
  if (cluster) {
    const path = cluster[locale];
    if (path && pages[path]) return path;
    return null;
  }
  const { rest } = parseRoute(route);
  const path = pathForLocale(rest, locale);
  if (pages[path]) return path;
  return null;
}

/**
 * Required hreflang entries for audit / injection: only locales that have a corresponding file in crawl.
 */
export function requiredAlternateLinks(route, pages) {
  const cluster = findClusterForRoute(route);
  if (cluster) {
    const out = [];
    for (const [loc, path] of Object.entries(cluster)) {
      if (pages[path]) out.push({ hreflang: loc, href: `${BASE}${path}` });
    }
    return out;
  }
  const out = [];
  for (const loc of HREFLANG_LOCALES) {
    const path = alternateRoute(route, loc, pages);
    if (path) out.push({ hreflang: loc, href: `${BASE}${path}` });
  }
  return out;
}

export function isKeyRouteForXDefault(route) {
  return (
    route === '/' ||
    LOCALES.some((l) => route === `/${l}/`) ||
    /\/produtos\/$/.test(route)
  );
}

/** Default market / language for x-default on hub pages. */
export const X_DEFAULT_HREF = `${BASE}/`;

/** Expected `href` for `hreflang="x-default"` when the route requires it (home + locale roots → site root; produtos hubs → pt-BR produtos). */
export function expectedXDefaultHref(route) {
  if (/\/produtos\/$/.test(route)) {
    return `${BASE}/produtos/`;
  }
  if (route === '/' || LOCALES.some((l) => route === `/${l}/`)) {
    return X_DEFAULT_HREF;
  }
  return null;
}

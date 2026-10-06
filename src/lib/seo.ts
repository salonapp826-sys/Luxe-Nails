/**
 * Shared SEO constants & helpers.
 *
 * Single source of truth for the canonical origin so meta tags, canonical
 * links and JSON-LD structured data can never drift apart.
 */

export const SITE_URL = 'https://nailsbyuma.onspace.app';

export const SITE_NAME = 'Nails by Uma - Jaipur';

export const DEFAULT_OG_IMAGE =
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&h=630&fit=crop&q=80';

/**
 * Build an absolute URL from a site-relative path. Any query string or hash
 * is kept, so deep links such as '/packages#bridal' stay intact.
 *
 *   absoluteUrl('/packages')        → 'https://nailsbyuma.onspace.app/packages'
 *   absoluteUrl('/packages#bridal') → 'https://nailsbyuma.onspace.app/packages#bridal'
 *   absoluteUrl('/')                → 'https://nailsbyuma.onspace.app/'
 *   absoluteUrl('https://…')        → passed through untouched
 */
export function absoluteUrl(path: string = '/'): string {
  if (!path) return `${SITE_URL}/`;
  if (/^https?:\/\//i.test(path)) return path;

  const suffixStart = path.search(/[?#]/);
  const pathname = suffixStart === -1 ? path : path.slice(0, suffixStart);
  const suffix = suffixStart === -1 ? '' : path.slice(suffixStart);

  const cleanPath = pathname.replace(/^\/+/, '').replace(/\/+$/, '');

  return cleanPath ? `${SITE_URL}/${cleanPath}${suffix}` : `${SITE_URL}/${suffix}`;
}

/**
 * Like `absoluteUrl`, but strips query strings and hashes so the result always
 * matches the page's <link rel="canonical">.
 */
export function canonicalUrl(path: string = '/'): string {
  return absoluteUrl((path || '/').split('?')[0].split('#')[0]);
}

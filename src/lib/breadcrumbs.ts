/**
 * Breadcrumb helpers — build a schema.org BreadcrumbList from the current URL.
 *
 * Everything here is pure (no React, no DOM) so it can be unit-tested and
 * reused by both the JSON-LD injector (`useBreadcrumbSchema`) and any visible
 * breadcrumb UI.
 *
 * Google uses BreadcrumbList structured data to replace the raw URL in a
 * search snippet with a readable trail, e.g.
 *
 *   Home > Packages
 *   Home > Services > Gel Nail Art
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
 */

import { absoluteUrl, canonicalUrl } from './seo';

export interface BreadcrumbCrumb {
  /** Human readable label shown in the trail, e.g. "Packages". */
  name: string;
  /** Site-relative path ('/packages') or absolute URL. Defaults to the current page. */
  path?: string;
}

export interface BreadcrumbListItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
}

export interface BreadcrumbListSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  '@id': string;
  itemListElement: BreadcrumbListItem[];
}

export interface BreadcrumbTrailOptions {
  /**
   * Override the auto-generated label for a path segment or a full path.
   * Useful for dynamic routes: `{ 'gel-nail-art': service.name }`.
   */
  labels?: Record<string, string> | null;
  /** Extra crumbs appended after the URL-derived ones (deepest level last). */
  extra?: BreadcrumbCrumb[] | null;
  /** Replace the whole auto-derived trail (excluding "Home"). */
  trail?: BreadcrumbCrumb[] | null;
}

/** The root crumb every trail starts with. */
export const HOME_CRUMB: BreadcrumbCrumb = { name: 'Home', path: '/' };

/**
 * Friendly labels for known routes, keyed by full path so nested routes can
 * be named independently of their parents. Unknown routes fall back to a
 * humanised version of the slug, so new pages work without touching this map.
 */
export const ROUTE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/about': 'About Us',
  '/book': 'Book Appointment',
  '/booking-status': 'Booking Status',
  '/contact': 'Contact',
  '/faq': 'FAQ',
  '/gallery': 'Gallery',
  '/my-bookings': 'My Bookings',
  '/packages': 'Packages',
  '/reviews': 'Reviews',
  '/services': 'Services',
  '/admin': 'Admin',
  '/admin/dashboard': 'Dashboard',
  '/admin/login': 'Login',
  '/admin/signup': 'Sign Up',
  '/admin/whatsapp-leads': 'WhatsApp Leads',
};

/** Words that should stay fully capitalised when humanising a slug. */
const ACRONYMS = new Set(['faq', 'faqs', 'diy', 'spa', 'uv', 'led']);

/** Matches UUIDs, long hex ids and pure numeric ids (booking ids, etc.). */
const OPAQUE_ID = /^(?:[0-9]+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{16,})$/i;

export function isOpaqueSegment(segment: string): boolean {
  return OPAQUE_ID.test(segment);
}

/** 'nail-art' → 'Nail Art', 'faq' → 'FAQ' */
export function humanizeSegment(segment: string): string {
  let clean = segment;
  try {
    clean = decodeURIComponent(segment);
  } catch {
    /* keep the raw segment if it isn't valid percent-encoding */
  }

  return clean
    .replace(/[-_+]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      ACRONYMS.has(word.toLowerCase())
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ');
}

/**
 * Turn a pathname into a breadcrumb trail, always rooted at "Home".
 *
 *   '/packages'              → Home > Packages
 *   '/services/gel-nail-art' → Home > Services > Gel Nail Art
 */
export function buildBreadcrumbTrail(
  pathname: string,
  options: BreadcrumbTrailOptions = {},
): BreadcrumbCrumb[] {
  const labels = options.labels || {};
  const extra = options.extra || [];
  const manualTrail = options.trail;

  const crumbs: BreadcrumbCrumb[] = [{ ...HOME_CRUMB }];

  if (manualTrail && manualTrail.length) {
    crumbs.push(...manualTrail);
  } else {
    const segments = (pathname || '/').split('?')[0].split('#')[0].split('/').filter(Boolean);

    let accumulated = '';
    for (const segment of segments) {
      accumulated += `/${segment}`;

      const name =
        labels[segment] ??
        labels[accumulated] ??
        ROUTE_LABELS[accumulated] ??
        (isOpaqueSegment(segment) ? 'Details' : humanizeSegment(segment));

      if (name) crumbs.push({ name, path: accumulated });
    }
  }

  crumbs.push(...extra);

  // Drop empty labels and collapse accidental duplicates (e.g. an `extra`
  // crumb that repeats the page it was added to).
  return crumbs.filter(
    (crumb, index, all) =>
      Boolean(crumb.name) && (index === 0 || crumb.name !== all[index - 1].name),
  );
}

/**
 * Convert a trail into a ready-to-serialise BreadcrumbList JSON-LD object.
 * Every `item` is an absolute URL, which Google requires.
 */
export function buildBreadcrumbListSchema(
  crumbs: BreadcrumbCrumb[],
  currentPath: string = '/',
): BreadcrumbListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl(currentPath)}#breadcrumb`,
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path ?? currentPath),
    })),
  };
}

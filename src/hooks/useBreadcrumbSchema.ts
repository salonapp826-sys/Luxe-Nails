import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  buildBreadcrumbListSchema,
  buildBreadcrumbTrail,
  type BreadcrumbCrumb,
  type BreadcrumbTrailOptions,
} from '@/lib/breadcrumbs';

/** Marker attribute so we only ever touch (and clean up) our own tag. */
const SCHEMA_ATTR = 'data-breadcrumb-schema';

export interface UseBreadcrumbSchemaOptions extends BreadcrumbTrailOptions {
  /**
   * Emit the schema even when the trail is only "Home".
   * Off by default — a single-item BreadcrumbList is meaningless to Google.
   */
  emitSingleItem?: boolean;
}

/**
 * useBreadcrumbSchema — injects a dynamic BreadcrumbList JSON-LD block into
 * <head> for the current route, so Google can render the page's position in
 * the site hierarchy (Home > Packages) instead of a bare URL in the snippet.
 *
 * The trail is derived from the URL, so nested routes work automatically:
 *
 *   useBreadcrumbSchema();                                   // Home > Packages
 *   useBreadcrumbSchema({ labels: { [id]: service.name } }); // Home > Services > Gel Nail Art
 *   useBreadcrumbSchema({ extra: [{ name: 'Bridal' }] });    // Home > Packages > Bridal
 *
 * Returns the resolved trail so a page can also render a visible breadcrumb
 * from exactly the same data.
 */
export function useBreadcrumbSchema(
  options: UseBreadcrumbSchemaOptions = {},
): BreadcrumbCrumb[] {
  const { pathname } = useLocation();
  const emitSingleItem = options.emitSingleItem ?? false;

  // Serialise the options so inline object/array literals passed by callers
  // don't retrigger the effect on every render — only real content changes do.
  const optionsKey = useMemo(
    () =>
      JSON.stringify({
        labels: options.labels ?? null,
        extra: options.extra ?? null,
        trail: options.trail ?? null,
      }),
    [options.labels, options.extra, options.trail],
  );

  const crumbs = useMemo(
    () => buildBreadcrumbTrail(pathname, JSON.parse(optionsKey) as BreadcrumbTrailOptions),
    [pathname, optionsKey],
  );

  const schemaJson = useMemo(() => {
    if (crumbs.length < 2 && !emitSingleItem) return null;
    return JSON.stringify(buildBreadcrumbListSchema(crumbs, pathname));
  }, [crumbs, pathname, emitSingleItem]);

  useEffect(() => {
    if (typeof document === 'undefined' || !schemaJson) return;

    const removeExisting = () =>
      document.querySelectorAll(`script[${SCHEMA_ATTR}]`).forEach((el) => el.remove());

    // Replace instead of append so a client-side route change never leaves two
    // competing BreadcrumbList blocks on the page.
    removeExisting();

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute(SCHEMA_ATTR, 'true');
    script.textContent = schemaJson;
    document.head.appendChild(script);

    return removeExisting;
  }, [schemaJson]);

  return crumbs;
}

export default useBreadcrumbSchema;

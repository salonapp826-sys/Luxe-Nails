import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics';

/**
 * usePageTracking — sends a GA4 `page_view` on every React Router navigation.
 *
 * Mount it ONCE, inside the router (see App.tsx). Every route is then covered
 * automatically — /services, /gallery, /faq, /packages and anything added
 * later — with no per-page wiring. Calling it in individual pages as well
 * would double-count those pages.
 *
 * Notes:
 * - The first render counts as a page view; index.html deliberately disables
 *   gtag's automatic hit so the initial load is reported exactly once.
 * - Search and hash changes count as new views (?category=…, #bridal), which
 *   is what GA4 expects for a SPA.
 * - Repeat navigations to the identical URL are ignored, which also absorbs
 *   React 18 StrictMode's double-invoked effects in development.
 */
export function usePageTracking(): void {
  const { pathname, search, hash } = useLocation();
  const lastTrackedUrl = useRef<string | null>(null);

  useEffect(() => {
    const path = `${pathname}${search}${hash}`;

    if (lastTrackedUrl.current === path) return;
    lastTrackedUrl.current = path;

    // Runs after the route's own effects (useSEO sets document.title first),
    // so the title reported to GA4 belongs to the page just rendered.
    trackPageView({ path });
  }, [pathname, search, hash]);
}

export default usePageTracking;

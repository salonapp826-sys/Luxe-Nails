/**
 * Google Analytics 4 helpers.
 *
 * The gtag.js loader lives in index.html and only runs when a valid
 * measurement id is configured, so every function here degrades quietly to a
 * no-op when analytics is switched off (local dev, previews, missing .env).
 */

/** GA4 ids look like "G-XXXXXXXXXX". */
const GA_ID_PATTERN = /^G-[A-Z0-9]{4,}$/i;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    /** Set by the loader in index.html once a valid id is found. */
    __GA_MEASUREMENT_ID__?: string;
  }
}

/**
 * The active measurement id, or '' when analytics is disabled.
 * Prefers the value the loader validated, falling back to the build-time env
 * var so the helpers still work if the snippet is ever replaced by a tag
 * manager.
 */
export function getMeasurementId(): string {
  if (typeof window === 'undefined') return '';

  const id = window.__GA_MEASUREMENT_ID__ || import.meta.env.VITE_GA_MEASUREMENT_ID || '';

  return GA_ID_PATTERN.test(id) ? id : '';
}

export function isAnalyticsEnabled(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function' && Boolean(getMeasurementId());
}

export interface PageViewParams {
  /** Path including search and hash, e.g. '/packages?tab=bridal'. */
  path: string;
  /** Defaults to the current document title. */
  title?: string;
  /** Defaults to the current absolute URL. */
  location?: string;
}

/**
 * Send a GA4 `page_view`. Returns true when the hit was handed to gtag.
 * In development with analytics disabled it logs the payload instead, so route
 * tracking can be verified without a GA property.
 */
export function trackPageView({ path, title, location }: PageViewParams): boolean {
  const payload = {
    page_path: path,
    page_title: title ?? (typeof document !== 'undefined' ? document.title : undefined),
    page_location:
      location ?? (typeof window !== 'undefined' ? window.location.href : undefined),
  };

  return sendEvent('page_view', payload);
}

/**
 * Send any GA4 event, e.g.
 *   trackEvent('generate_lead', { method: 'whatsapp' });
 */
export function trackEvent(name: string, params: Record<string, unknown> = {}): boolean {
  return sendEvent(name, params);
}

function sendEvent(name: string, params: Record<string, unknown>): boolean {
  const measurementId = getMeasurementId();

  if (!measurementId || typeof window.gtag !== 'function') {
    if (import.meta.env.DEV) {
      console.debug(`[analytics] ${name} (GA4 not configured — nothing sent)`, params);
    }
    return false;
  }

  window.gtag('event', name, { ...params, send_to: measurementId });
  return true;
}

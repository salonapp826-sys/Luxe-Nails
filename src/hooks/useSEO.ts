import { useEffect } from 'react';
import { DEFAULT_OG_IMAGE, SITE_URL } from '@/lib/seo';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalPath?: string;
}

// Shared with the JSON-LD helpers (src/lib/seo.ts) so canonical URLs in meta
// tags and structured data can never drift apart.
const BASE_URL = SITE_URL;
const DEFAULT_IMAGE = DEFAULT_OG_IMAGE;

/**
 * useSEO — Dynamically updates document <title> and all key meta tags
 * for each page in the SPA, supporting Open Graph & Twitter Card fields.
 */
export function useSEO({
  title,
  description,
  keywords,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  canonicalPath = '',
}: SEOProps) {
  useEffect(() => {
    // ── Document title ────────────────────────────────────────────
    document.title = title;

    // ── Helper: upsert <meta> by attribute selector ───────────────
    const setMeta = (selector: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (el) {
        el.setAttribute('content', content);
      } else {
        // Create missing tag
        el = document.createElement('meta');
        const [attr, val] = selector.replace('meta[', '').replace(']', '').split('=');
        el.setAttribute(attr.trim(), val.replace(/"/g, '').trim());
        el.setAttribute('content', content);
        document.head.appendChild(el);
      }
    };

    // ── Helper: upsert <link rel="canonical"> ────────────────────
    const setCanonical = (path: string) => {
      const href = `${BASE_URL}${path}`;
      let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (link) {
        link.setAttribute('href', href);
      } else {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        link.setAttribute('href', href);
        document.head.appendChild(link);
      }
    };

    // ── Standard meta ─────────────────────────────────────────────
    setMeta('meta[name="description"]', description);
    if (keywords) setMeta('meta[name="keywords"]', keywords);

    // ── Open Graph ────────────────────────────────────────────────
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:image"]', ogImage);
    setMeta('meta[property="og:type"]', ogType);
    setMeta('meta[property="og:url"]', `${BASE_URL}${canonicalPath}`);

    // ── Twitter Card ──────────────────────────────────────────────
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[name="twitter:image"]', ogImage);

    // ── Canonical link ────────────────────────────────────────────
    setCanonical(canonicalPath);
  }, [title, description, keywords, ogImage, ogType, canonicalPath]);
}

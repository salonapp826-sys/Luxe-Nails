import { useEffect } from 'react';

/**
 * Injects a JSON-LD <script> into <head> and removes it on unmount.
 * @param schema  Any JSON-serialisable schema.org object
 * @param key     Unique data attribute used to identify and replace the tag
 */
export function useJsonLd(schema: object | null, key: string): void {
  useEffect(() => {
    if (!schema) return;

    // Remove any previous tag with the same key
    document.querySelectorAll(`script[data-jsonld="${key}"]`).forEach(el => el.remove());

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-jsonld', key);
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.querySelectorAll(`script[data-jsonld="${key}"]`).forEach(el => el.remove());
    };
  }, [schema, key]);
}

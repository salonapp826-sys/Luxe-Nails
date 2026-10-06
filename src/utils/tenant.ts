/**
 * Utility to generate full subdomain URLs for a given tenant/customer website.
 * Supports custom domains, production wildcard domains, and localhost.
 */
export function getSubdomainUrl(slug: string): string {
  if (typeof window === 'undefined') return '/';

  const host = window.location.host;
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : '';

  // Clean slug
  const cleanSlug = (slug || 'nailsbyuma').toLowerCase().trim();

  // If default root tenant on platform domain
  if (cleanSlug === 'nailsbyuma') {
    return `${protocol}//${host}`;
  }

  // Localhost resolution (e.g. http://uma.localhost:3000)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${cleanSlug}.localhost${port}`;
  }

  // Check if custom base domain is set via environment variable
  const customBaseDomain = (import.meta.env.VITE_CUSTOM_DOMAIN || '').trim();
  if (customBaseDomain && customBaseDomain !== 'yourdomain.com') {
    return `${protocol}//${cleanSlug}.${customBaseDomain}`;
  }

  // If currently running on a custom domain (not default cloud run domain)
  if (!hostname.includes('run.app') && !hostname.includes('ais-dev') && !hostname.includes('ais-pre')) {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      const firstPart = parts[0].toLowerCase();
      const reservedWords = ['www', 'app', 'admin', 'api', 'platform'];

      if (!reservedWords.includes(firstPart) && parts.length > 2) {
        parts[0] = cleanSlug;
        return `${protocol}//${parts.join('.')}${port}`;
      }

      return `${protocol}//${cleanSlug}.${hostname}${port}`;
    }
  }

  // Fallback for custom domain representation
  const targetDomain = customBaseDomain || 'yourdomain.com';
  return `${protocol}//${cleanSlug}.${targetDomain}`;
}

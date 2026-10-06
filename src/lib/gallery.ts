/**
 * Gallery helpers — normalise the two sources of portfolio photos into one
 * list the UI can render:
 *
 *   1. Staff uploads from Supabase `gallery_images` (Admin → Gallery)
 *   2. The curated baseline in src/constants/galleryItems.ts
 *
 * Keeping the merge here means the page component stays presentational and
 * both sources share the same card, lightbox and structured data.
 */

import {
  GALLERY_CATEGORIES,
  type GalleryCategoryId,
  type GalleryItem,
} from '@/constants/galleryItems';
import { SERVICES } from '@/constants/services';
import { SITE_NAME, absoluteUrl } from './seo';

/**
 * Services the salon offers that don't have an entry in
 * src/constants/services.ts yet (they come from the booking menu / offer
 * catalog). Declared once, here — so a service name is never re-typed by
 * hand inside the gallery data.
 */
const UNLISTED_SERVICES: Record<string, string> = {
  'acrylic-nails': 'Acrylic Nails',
  'mehndi-art': 'Mehndi / Henna Art',
};

/**
 * Resolve a service id to its display name. SERVICES is the source of
 * truth; gallery items only ever store the id.
 *
 * NOTE: names only. Prices in src/constants/services.ts are stale — the
 * live ₹ prices come from Supabase on /services — so never surface a price
 * from here.
 */
export function getServiceName(serviceId: string, fallbackCategory?: string): string {
  const service = SERVICES.find((s) => s.id === serviceId);
  if (service) return service.name;
  if (UNLISTED_SERVICES[serviceId]) return UNLISTED_SERVICES[serviceId];
  return fallbackCategory ? getCategoryLabel(fallbackCategory) : serviceId;
}

/** Service name for a gallery item, derived from its service id. */
export function serviceNameFor(item: Pick<GalleryItem, 'service' | 'category'>): string {
  return getServiceName(item.service, item.category);
}

/** A row of the Supabase `gallery_images` table. */
export interface RemoteGalleryImage {
  id: string;
  title: string | null;
  category: string | null;
  image_url: string;
  sort_order?: number | null;
  created_at?: string | null;
}

export function getCategory(id: string) {
  return GALLERY_CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryLabel(id: string): string {
  return getCategory(id)?.label ?? id;
}

const isKnownCategory = (value: string): value is Exclude<GalleryCategoryId, 'all'> =>
  GALLERY_CATEGORIES.some((cat) => cat.id === value && cat.id !== 'all');

/**
 * Turn an admin-uploaded row into a GalleryItem. Uploads only carry a title,
 * a category and a URL, so the remaining copy is derived — every image still
 * ends up with meaningful alt text.
 */
export function normalizeRemoteImage(row: RemoteGalleryImage): GalleryItem {
  const category = row.category && isKnownCategory(row.category) ? row.category : 'other';
  const label = getCategoryLabel(category);
  const title = row.title?.trim() || `${label} Design`;

  return {
    id: `remote-${row.id}`,
    service: category,
    category,
    title,
    image: row.image_url,
    thumb: row.image_url,
    alt: `${title} — ${label.toLowerCase()} design by ${SITE_NAME}`,
    description: `${label} work from our salon portfolio, created by the ${SITE_NAME} team.`,
    width: 600,
    height: 600,
  };
}

/**
 * Staff uploads lead, curated portfolio fills the rest.
 * Ids are de-duplicated so a curated photo can safely be re-uploaded.
 */
export function mergeGalleryItems(
  remote: RemoteGalleryImage[] = [],
  curated: GalleryItem[] = [],
): GalleryItem[] {
  const normalized = remote.map(normalizeRemoteImage);
  const seen = new Set(normalized.map((item) => item.id));

  return [...normalized, ...curated.filter((item) => !seen.has(item.id))];
}

export function filterByCategory(items: GalleryItem[], category: string): GalleryItem[] {
  return category === 'all' ? items : items.filter((item) => item.category === category);
}

/** Photo count per filter pill, including the 'all' bucket. */
export function countByCategory(items: GalleryItem[]): Record<string, number> {
  return GALLERY_CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat.id] =
      cat.id === 'all' ? items.length : items.filter((item) => item.category === cat.id).length;
    return acc;
  }, {});
}

/**
 * ImageGallery JSON-LD so the portfolio is eligible for Google Images and
 * image-rich results. Absolute URLs are required, hence absoluteUrl().
 */
export function buildGallerySchema(items: GalleryItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    '@id': `${absoluteUrl('/gallery')}#gallery`,
    name: `Nail Art Gallery — ${SITE_NAME}`,
    description:
      'Portfolio of gel nails, acrylic extensions, nail art, mehndi and bridal nail designs created at Nails by Uma.',
    url: absoluteUrl('/gallery'),
    numberOfItems: items.length,
    associatedMedia: items.map((item) => ({
      '@type': 'ImageObject',
      '@id': `${absoluteUrl('/gallery')}#${item.id}`,
      contentUrl: absoluteUrl(item.image),
      thumbnailUrl: absoluteUrl(item.thumb || item.image),
      name: item.title,
      description: item.description,
      caption: item.alt,
      representativeOfPage: false,
      creator: { '@type': 'Organization', name: SITE_NAME },
    })),
  };
}

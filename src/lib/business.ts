/**
 * Single source of truth for the salon's business facts (NAP, hours, pricing,
 * ratings, socials) plus small builders that turn them into schema.org nodes.
 *
 * Keep these values in sync with the static LocalBusiness block in index.html —
 * both describe the SAME entity and share the `BUSINESS_ID` @id, so Google
 * merges them into one node instead of seeing two competing businesses.
 */

import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, absoluteUrl } from './seo';

/** Stable @ids — every schema block on the site points at these same nodes. */
export const BUSINESS_ID = `${SITE_URL}/#business`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export type JsonLdNode = Record<string, unknown>;

export interface OpeningHours {
  days: string[];
  opens: string;
  closes: string;
}

export const SALON = {
  name: 'Nails by Uma - Jaipur',
  alternateNames: ['Nails by Uma Jaipur', 'Nails by Uma Salon'],
  description:
    'Best nail salon in Mansarovar Jaipur offering manicure, pedicure, gel nails, nail art, bridal mehndi and beauty packages. In-salon and home service available in Jaipur.',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  image: DEFAULT_OG_IMAGE,
  telephone: '+916376539366',
  email: 'info@nailsbyuma.in',
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'UPI (Google Pay / PhonePe / Paytm), Credit/Debit Card, Cash',
  upiId: '6376539366@ybl',
  address: {
    streetAddress: 'Main Market Road, Near City Center Plaza, Mansarovar',
    addressLocality: 'Jaipur',
    addressRegion: 'Rajasthan',
    postalCode: '302020',
    addressCountry: 'IN',
    landmark: 'Opposite Gold Souk Boulevard, Near Mansarovar Metro Station, Jaipur',
  },
  areaServed: 'Jaipur, Rajasthan',
  rating: {
    value: '4.9',
    count: '500',
    best: '5',
    worst: '1',
  },
  socialProfiles: ['https://www.instagram.com/nailsbyuma'],
  openingHours: [
    {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '20:00',
    },
    { days: ['Sunday'], opens: '11:00', closes: '18:00' },
  ] as OpeningHours[],
  /** What the salon is known for — helps entity understanding on brand searches. */
  expertise: [
    'Professional Manicure',
    'Luxury Pedicure',
    'Gel Nail Extensions',
    'Acrylic Nails',
    'Nail Art Design',
    'Bridal Nail Packages',
    'Mehndi and Henna Art',
    'Facials and Skincare',
    'Home Nail Service',
  ],
} as const;

/** 'Priya Sharma' → 'priya-sharma' (used for stable Person @ids). */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Drops undefined/null/empty entries so the emitted JSON-LD stays clean. */
export function compact<T extends JsonLdNode>(node: T): T {
  return Object.fromEntries(
    Object.entries(node).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }),
  ) as T;
}

export function buildOpeningHoursSpecification(hours: readonly OpeningHours[] = SALON.openingHours) {
  return hours.map((slot) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [...slot.days],
    opens: slot.opens,
    closes: slot.closes,
  }));
}

export function buildPostalAddress() {
  return {
    '@type': 'PostalAddress',
    addressRegion: SALON.address.region,
    addressCountry: SALON.address.country,
  };
}

/**
 * The BeautySalon / LocalBusiness node.
 *
 * `extra` is merged last, so a page can attach page-specific facts
 * (founder, employees, awards…) to the very same business entity.
 */
export function buildLocalBusinessNode(extra: JsonLdNode = {}): JsonLdNode {
  return compact({
    '@type': ['BeautySalon', 'LocalBusiness'],
    '@id': BUSINESS_ID,
    name: SALON.name,
    alternateName: [...SALON.alternateNames],
    description: SALON.description,
    url: SALON.url,
    logo: SALON.logo,
    image: SALON.image,
    telephone: SALON.telephone,
    email: SALON.email,
    priceRange: SALON.priceRange,
    currenciesAccepted: SALON.currenciesAccepted,
    paymentAccepted: SALON.paymentAccepted,
    address: buildPostalAddress(),
    areaServed: {
      '@type': 'AdministrativeArea',
      name: SALON.areaServed,
    },
    openingHoursSpecification: buildOpeningHoursSpecification(),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: SALON.rating.value,
      reviewCount: SALON.rating.count,
      bestRating: SALON.rating.best,
      worstRating: SALON.rating.worst,
    },
    knowsAbout: [...SALON.expertise],
    sameAs: [...SALON.socialProfiles],
    ...extra,
  });
}

export interface PersonNodeInput {
  id: string;
  name: string;
  jobTitle?: string;
  description?: string;
  image?: string;
  url?: string;
  knowsAbout?: string[];
  sameAs?: string[];
  extra?: JsonLdNode;
}

/** A staff member / founder, always linked back to the salon via worksFor. */
export function buildPersonNode({
  id,
  name,
  jobTitle,
  description,
  image,
  url,
  knowsAbout,
  sameAs,
  extra = {},
}: PersonNodeInput): JsonLdNode {
  return compact({
    '@type': 'Person',
    '@id': id,
    name,
    jobTitle,
    description,
    image,
    url: url ? absoluteUrl(url) : undefined,
    worksFor: { '@id': BUSINESS_ID },
    knowsAbout,
    sameAs,
    ...extra,
  });
}

/** The site-wide WebSite node, so pages can declare what they're part of. */
export function buildWebSiteNode(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SALON.name,
    alternateName: [...SALON.alternateNames],
    description: SALON.description,
    inLanguage: 'en-IN',
    publisher: { '@id': BUSINESS_ID },
  };
}

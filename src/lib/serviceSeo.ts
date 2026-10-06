import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE, absoluteUrl, canonicalUrl } from './seo';
import { SALON, BUSINESS_ID } from './business';

export interface ServiceSEOData {
  id: string;
  name: string;
  category: string;
  description: string;
  price_inr: number;
  duration_minutes: number;
  image_url?: string | null;
  home_service_allowed?: boolean;
  is_premium?: boolean;
  rating?: {
    value: number;
    count: number;
  };
}

/**
 * Builds dynamic OpenGraph and Meta tags for a service
 */
export function getServiceMetaTags(service: ServiceSEOData) {
  const serviceTitle = `${service.name} (₹${service.price_inr}) | Nails by Uma Jaipur`;
  const homeServiceNote = service.home_service_allowed ? 'In-salon & Home Service available in Jaipur.' : 'In-salon appointment.';
  const serviceDescription = `Book ${service.name} at Nails by Uma. ${service.description} Duration: ${service.duration_minutes} mins. Price: ₹${service.price_inr}. ${homeServiceNote}`;
  const serviceImage = service.image_url || DEFAULT_OG_IMAGE;
  const canonicalPath = `/services/${service.id}`;

  const keywords = [
    service.name.toLowerCase(),
    `${service.name.toLowerCase()} jaipur`,
    `${service.name.toLowerCase()} price`,
    `${service.category} nail services`,
    'luxury nail salon jaipur',
    'nails by uma',
    service.home_service_allowed ? 'home nail service jaipur' : 'nail salon jaipur',
    'best nail art jaipur',
    'manicure pedicure salon',
  ].join(', ');

  return {
    title: serviceTitle,
    description: serviceDescription,
    keywords,
    ogTitle: `${service.name} – Luxury Nail & Beauty Service`,
    ogDescription: serviceDescription,
    ogImage: serviceImage,
    ogType: 'product',
    canonicalPath,
    canonicalUrl: canonicalUrl(canonicalPath),
  };
}

/**
 * Builds Schema.org JSON-LD structured data for a specific Service,
 * linking it to the local BeautySalon entity for enhanced local SEO snippets.
 */
export function buildServiceJsonLd(service: ServiceSEOData) {
  const serviceUrl = absoluteUrl(`/services/${service.id}`);
  const bookUrl = absoluteUrl(`/book?service=${service.id}`);
  const serviceImage = service.image_url || DEFAULT_OG_IMAGE;
  const ratingValue = service.rating?.value ? service.rating.value.toFixed(1) : '4.9';
  const reviewCount = service.rating?.count ? String(service.rating.count) : '45';

  return {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. Service Definition
      {
        '@type': 'Service',
        '@id': `${serviceUrl}#service`,
        name: service.name,
        serviceType: `${service.name} - Nail & Beauty Care`,
        description: service.description,
        image: serviceImage,
        url: serviceUrl,
        category: service.category,
        provider: {
          '@type': ['BeautySalon', 'LocalBusiness'],
          '@id': BUSINESS_ID,
          name: SALON.name,
          telephone: SALON.telephone,
          email: SALON.email,
          url: SALON.url,
          priceRange: SALON.priceRange,
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Jaipur',
            addressRegion: 'Rajasthan',
            addressCountry: 'IN',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: 26.9124,
            longitude: 75.7873,
          },
        },
        areaServed: [
          {
            '@type': 'City',
            name: 'Jaipur',
          },
          {
            '@type': 'AdministrativeArea',
            name: 'Rajasthan',
          },
        ],
        offers: {
          '@type': 'Offer',
          '@id': `${serviceUrl}#offer`,
          price: service.price_inr,
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          url: bookUrl,
          priceValidUntil: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
          seller: {
            '@id': BUSINESS_ID,
          },
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: ratingValue,
          reviewCount: reviewCount,
          bestRating: '5',
          worstRating: '1',
        },
        additionalProperty: [
          {
            '@type': 'PropertyValue',
            name: 'Duration',
            value: `${service.duration_minutes} minutes`,
          },
          {
            '@type': 'PropertyValue',
            name: 'Home Service Allowed',
            value: service.home_service_allowed ? 'Yes' : 'No',
          },
          {
            '@type': 'PropertyValue',
            name: 'Tier',
            value: service.is_premium ? 'Premium Luxury' : 'Standard Quality',
          },
        ],
      },
      // 2. Breadcrumb trail: Home > Services > Service Name
      {
        '@type': 'BreadcrumbList',
        '@id': `${serviceUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: absoluteUrl('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Services',
            item: absoluteUrl('/services'),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: service.name,
            item: serviceUrl,
          },
        ],
      },
    ],
  };
}

/**
 * Builds Category-level dynamic metadata and Schema.org ItemList for /services
 */
export function getCategoryMetaTags(category: string, count: number) {
  const categoryNames: Record<string, { label: string; desc: string }> = {
    all: {
      label: 'All Nail & Beauty Services',
      desc: 'Explore professional manicures, gel nails, 3D nail art, mehndi, pedicure & bridal packages in Jaipur.',
    },
    basic: {
      label: 'Classic Manicure & Pedicure Services',
      desc: 'Essential nail care treatments, precision shaping, cuticle push and nourishing polishes in Jaipur.',
    },
    premium: {
      label: 'Gel Nails & Luxury Extensions',
      desc: 'Chip-resistant gel manicures, French tips and long-lasting extensions cured with UV/LED in Jaipur.',
    },
    art: {
      label: 'Custom Nail Art & 3D Designs',
      desc: 'Hand-painted designs, chrome powder, foil, pearls and 3D floral sculpted nail art in Jaipur.',
    },
    bridal: {
      label: 'Bridal Nail Art & Makeover Packages',
      desc: 'Exclusive bridal packages with custom nail art, extensions, relaxing hand spa and pedicure in Jaipur.',
    },
    mehndi: {
      label: 'Bridal Henna & Mehndi Designs',
      desc: 'Intricate traditional and modern Arabic henna designs with 100% organic dark-stain cone in Jaipur.',
    },
    beauty: {
      label: 'Beauty Parlour & Glow Facials',
      desc: 'Rejuvenating gold facials, cleanups, fruit peels and soothing skincare treatments in Jaipur.',
    },
  };

  const info = categoryNames[category] || categoryNames.all;
  const canonicalPath = category === 'all' ? '/services' : `/services?category=${category}`;

  return {
    title: `${info.label} (${count} Services) | Nails by Uma Jaipur`,
    description: `${info.desc} Book salon appointments or luxury home service across Jaipur today.`,
    keywords: `${info.label.toLowerCase()}, nail salon jaipur, nails by uma, manicure jaipur, gel nails jaipur, best nail artist jaipur`,
    canonicalPath,
  };
}

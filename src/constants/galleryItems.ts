/**
 * ─────────────────────────────────────────────────────────────────────────
 *  NAIL ART GALLERY — CENTRAL DATA SOURCE
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  This is the ONLY file you need to touch to add, remove or reorder a
 *  portfolio photo. The gallery grid, the category filter pills, the photo
 *  counts, the lightbox and the gallery structured data are all generated
 *  from the array below.
 *
 *  ── TO ADD A PHOTO ──────────────────────────────────────────────────────
 *  1. Drop the image in `public/gallery/` (WebP preferred, ~1200px wide,
 *     plus a ~600px `-thumb` version for the grid).
 *  2. Copy any entry below, give it a unique `id`, and fill in the fields.
 *  3. `category` MUST be one of the ids in GALLERY_CATEGORIES — that is the
 *     same taxonomy the Admin → Gallery uploader uses, so photos added here
 *     and photos uploaded by staff behave identically.
 *  That's it. Nothing else in the app needs to change.
 *
 *  ── PHOTOS UPLOADED BY STAFF ────────────────────────────────────────────
 *  Images uploaded through Admin → Gallery (Supabase `gallery_images`) are
 *  merged in automatically and shown FIRST, so real salon work always leads
 *  the portfolio. The items below are the curated baseline that guarantees
 *  the page is never empty.
 */

/**
 * Category taxonomy — mirrors the options in the admin uploader
 * (AdminDashboard → GALLERY_CATEGORIES). Do not rename ids: existing rows in
 * Supabase are stored against them.
 */
export const GALLERY_CATEGORIES = [
  { id: 'all', label: 'All Work', emoji: '✨' },
  { id: 'gel', label: 'Gel Nails', emoji: '💅' },
  { id: 'acrylic', label: 'Acrylic', emoji: '💎' },
  { id: 'nail-art', label: 'Nail Art', emoji: '🎨' },
  { id: 'mehndi', label: 'Mehndi', emoji: '🌿' },
  { id: 'bridal', label: 'Bridal', emoji: '👰' },
  { id: 'other', label: 'More', emoji: '🌸' },
] as const;

export type GalleryCategoryId = (typeof GALLERY_CATEGORIES)[number]['id'];

export interface GalleryItem {
  /** Unique, stable id — also used as the React key and in the photo URL hash. */
  id: string;
  /**
   * Service this look belongs to — store the ID ONLY. The display name is
   * resolved from `src/constants/services.ts` at render time (see
   * getServiceName in src/lib/gallery.ts), so a service name is never
   * duplicated by hand here. Use an id from SERVICES where one exists
   * (gel-mani, nail-art-simple, bridal-premium…), otherwise a slug listed in
   * UNLISTED_SERVICES (acrylic-nails, mehndi-art).
   */
  service: string;
  /** Filter bucket — must be a GALLERY_CATEGORIES id (never 'all'). */
  category: Exclude<GalleryCategoryId, 'all'>;
  /** Short display title, shown on hover and in the lightbox. */
  title: string;
  /** Full-size image for the lightbox. */
  image: string;
  /** Smaller image for the grid — falls back to `image` if omitted. */
  thumb: string;
  /** Meaningful alt text describing the actual design (never "nail image"). */
  alt: string;
  /** One-line description of the look, shown in the lightbox. */
  description: string;
  /** Intrinsic size of `thumb`, reserved in the grid to avoid layout shift. */
  width: number;
  height: number;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  // ── Gel Nails ─────────────────────────────────────────────────────────
  {
    id: 'gel-01',
    service: 'gel-mani',
    category: 'gel',
    title: 'Blush Pink Gel Manicure',
    image: '/gallery/gel-01.webp',
    thumb: '/gallery/gel-01-thumb.webp',
    alt: 'Glossy blush pink gel manicure on short almond-shaped nails',
    description:
      'A soft blush gel finish on short almond nails — our most requested everyday look, cured for up to three weeks of high shine.',
    width: 600,
    height: 400,
  },
  {
    id: 'gel-02',
    service: 'gel-mani',
    category: 'gel',
    title: 'Wine Gloss Gel Nails',
    image: '/gallery/gel-02.webp',
    thumb: '/gallery/gel-02-thumb.webp',
    alt: 'Deep wine burgundy gel polish on medium square nails with a mirror gloss finish',
    description:
      'Deep burgundy gel on medium square nails, layered for a glass-like mirror shine that suits evenings and festive wear.',
    width: 400,
    height: 600,
  },
  {
    id: 'gel-03',
    service: 'gel-mani',
    category: 'gel',
    title: 'Pearl Chrome Gel Nails',
    image: '/gallery/gel-03.webp',
    thumb: '/gallery/gel-03-thumb.webp',
    alt: 'Milky beige gel nails with a pearl chrome shimmer on oval-shaped nails',
    description:
      'A milky beige base finished with pearl chrome powder — understated in daylight, luminous under evening light.',
    width: 400,
    height: 600,
  },

  // ── Acrylic Extensions ────────────────────────────────────────────────
  {
    id: 'acrylic-01',
    service: 'acrylic-nails',
    category: 'acrylic',
    title: 'Baby Boomer Ombré Extensions',
    image: '/gallery/acrylic-01.webp',
    thumb: '/gallery/acrylic-01-thumb.webp',
    alt: 'Long coffin-shaped acrylic nail extensions with a milky white and pink baby boomer ombré fade',
    description:
      'Long coffin extensions blended from pink to milky white — the classic baby boomer fade, sculpted by hand.',
    width: 600,
    height: 400,
  },
  {
    id: 'acrylic-02',
    service: 'acrylic-nails',
    category: 'acrylic',
    title: 'Matte Black & Gold Stilettos',
    image: '/gallery/acrylic-02.webp',
    thumb: '/gallery/acrylic-02-thumb.webp',
    alt: 'Sculpted stiletto acrylic nail extensions in matte black with gold foil accents',
    description:
      'Sculpted stiletto extensions in matte black, finished with hand-placed gold foil for a high-fashion statement set.',
    width: 600,
    height: 400,
  },
  {
    id: 'acrylic-03',
    service: 'acrylic-nails',
    category: 'acrylic',
    title: 'Lilac Glitter Coffin Nails',
    image: '/gallery/acrylic-03.webp',
    thumb: '/gallery/acrylic-03-thumb.webp',
    alt: 'Long square acrylic nails in soft lilac with encapsulated iridescent glitter',
    description:
      'Soft lilac acrylics with iridescent glitter encapsulated under the top coat, so the sparkle stays smooth to the touch.',
    width: 600,
    height: 400,
  },

  // ── Nail Art ──────────────────────────────────────────────────────────
  {
    id: 'nail-art-01',
    service: 'nail-art-simple',
    category: 'nail-art',
    title: 'Cherry Blossom Floral Art',
    image: '/gallery/nail-art-01.webp',
    thumb: '/gallery/nail-art-01-thumb.webp',
    alt: 'Hand-painted cherry blossom floral nail art in white and pink on a soft beige base',
    description:
      'Hand-painted blossoms on a soft beige base — fine-brush detail work on accent nails, finished with a glossy seal.',
    width: 400,
    height: 600,
  },
  {
    id: 'nail-art-02',
    service: 'nail-art-complex',
    category: 'nail-art',
    title: 'Marble & Gold Leaf Nails',
    image: '/gallery/nail-art-02.webp',
    thumb: '/gallery/nail-art-02-thumb.webp',
    alt: 'Abstract white and grey marble nail art with gold leaf foil accents on square nails',
    description:
      'Abstract marbling swirled wet-on-wet, then broken up with real gold leaf — no two nails are ever identical.',
    width: 600,
    height: 400,
  },
  {
    id: 'nail-art-03',
    service: 'nail-art-complex',
    category: 'nail-art',
    title: 'Crystal Glam Party Nails',
    image: '/gallery/nail-art-03.webp',
    thumb: '/gallery/nail-art-03-thumb.webp',
    alt: 'Champagne glitter ombré nails with a crystal rhinestone encrusted accent nail',
    description:
      'Champagne glitter ombré with a fully crystal-encrusted accent nail — our go-to set for receptions and parties.',
    width: 600,
    height: 400,
  },
];

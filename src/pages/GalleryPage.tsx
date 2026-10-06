import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles, Calendar, ArrowDown, Award, Star } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { useBreadcrumbSchema } from '@/hooks/useBreadcrumbSchema';
import { useJsonLd } from '@/hooks/useJsonLd';
import { useGalleryData } from '@/hooks/useGalleryData';
import { Button } from '@/components/ui/button';
import { GalleryFilters } from '@/components/gallery/GalleryFilters';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { GalleryLightbox } from '@/components/gallery/GalleryLightbox';
import {
  buildGallerySchema,
  countByCategory,
  filterByCategory,
  getCategoryLabel,
} from '@/lib/gallery';
import { absoluteUrl } from '@/lib/seo';

/**
 * How many photos are mounted before the visitor asks for more. Keeps the
 * page fast if the salon uploads hundreds of images over time.
 */
const INITIAL_VISIBLE = 12;
const LOAD_MORE_STEP = 12;

export default function GalleryPage() {
  const navigate = useNavigate();
  const galleryGridRef = useRef<HTMLDivElement>(null);

  useSEO({
    title: 'Nail Art Gallery | Best Nail Art & Mehndi Designs – Nails by Uma',
    description:
      'Browse our luxury nail salon portfolio — gel nails, acrylic nail art, mehndi designs & bridal collections, each piece crafted with passion by our expert technicians.',
    keywords:
      'nail art gallery, best nail art, gel nail designs, acrylic nail art, bridal nail art, mehndi designs, luxury nail salon gallery, nail art ideas, nail art near me',
    canonicalPath: '/gallery',
    ogImage: absoluteUrl('/gallery/og-gallery.jpg'),
  });

  // ── BreadcrumbList JSON-LD — Home > Gallery ──────────────────────
  useBreadcrumbSchema();

  // Curated portfolio + staff uploads, merged.
  const { items, loading } = useGalleryData();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  /** filterGallery */
  const filtered = useMemo(
    () => filterByCategory(items, selectedCategory),
    [items, selectedCategory],
  );

  /** updateCounts — one derived source for every count on the page. */
  const counts = useMemo(() => countByCategory(items), [items]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const remaining = filtered.length - visible.length;

  // ── ImageGallery JSON-LD ──
  useJsonLd(items.length ? buildGallerySchema(items) : null, 'gallery-page');

  /** Reset paging + close the viewer whenever the filter changes. */
  useEffect(() => {
    setLightboxIndex(null);
    setVisibleCount(INITIAL_VISIBLE);
  }, [selectedCategory]);

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const loadMore = useCallback(() => setVisibleCount((c) => c + LOAD_MORE_STEP), []);

  const scrollToGalleryGrid = () => {
    if (galleryGridRef.current) {
      galleryGridRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const showNext = useCallback(() => {
    setLightboxIndex((current) =>
      current === null ? null : (current + 1) % filtered.length,
    );
  }, [filtered.length]);

  const showPrevious = useCallback(() => {
    setLightboxIndex((current) =>
      current === null ? null : (current - 1 + filtered.length) % filtered.length,
    );
  }, [filtered.length]);

  const lightboxItem = lightboxIndex === null ? null : filtered[lightboxIndex] ?? null;

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrevious();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, closeLightbox, showNext, showPrevious]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [lightboxIndex]);

  const categoryLabel = selectedCategory === 'all' ? '' : `${getCategoryLabel(selectedCategory)} `;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 overflow-x-hidden">
      {/* ── HIGH-IMPACT HERO SECTION ─────────────────────────────────── */}
      <section className="relative min-h-[65vh] sm:min-h-[72vh] flex flex-col justify-center items-center overflow-hidden py-16 sm:py-24 px-4 border-b">
        {/* Background Video & Fallback Image Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-black">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/src/assets/images/rose_gold_glow_spa_1790700271370.jpg"
            className="w-full h-full object-cover object-center scale-105 opacity-75"
          >
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-woman-getting-a-manicure-at-a-nail-salon-43407-large.mp4"
              type="video/mp4"
            />
          </video>
          <img
            src="/src/assets/images/rose_gold_glow_spa_1790700271370.jpg"
            alt="Nails by Uma Luxury Salon Portfolio"
            className="absolute inset-0 w-full h-full object-cover object-center scale-105 pointer-events-none opacity-40 animate-pulse-slow"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Layered Dark Gradient Overlays for High Contrast Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/90 z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-pink-950/45 via-transparent to-amber-950/35 z-0 pointer-events-none" />

        {/* Hero Content Container */}
        <div className="relative z-10 container mx-auto max-w-5xl text-center space-y-6 sm:space-y-8 my-auto pt-4">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 px-4 py-2 rounded-full shadow-lg text-xs sm:text-sm font-semibold text-white tracking-wide">
            <Sparkles className="w-4 h-4 text-pink-300" aria-hidden="true" />
            <span>✨ Nail Art Gallery</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-xl leading-tight">
            Best Nail Art &amp;{' '}
            <span className="bg-gradient-to-r from-pink-300 via-rose-200 to-amber-200 bg-clip-text text-transparent">
              Design Gallery
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md font-light">
            Explore our luxury nail salon portfolio — gel nails, acrylic nail art, mehndi designs &amp; bridal collections, each piece crafted with passion by our expert technicians.
          </p>

          {/* Call-to-Action (CTA) Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button
              size="lg"
              onClick={() => navigate('/book')}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-xl h-14 px-8 text-base font-bold rounded-xl transition-all hover:scale-105 hover:shadow-2xl"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Appointment
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={scrollToGalleryGrid}
              className="border-2 border-white/60 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:text-white h-14 px-8 text-base font-semibold rounded-xl transition-all"
            >
              <ArrowDown className="w-5 h-5 mr-2 animate-bounce" />
              Explore Designs
            </Button>
          </div>

          {/* Quick Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs sm:text-sm text-white/85 font-medium">
            <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-pink-300" /> 100% Real Salon Work</span>
            <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-300" /> Trained Technicians</span>
            <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-300 fill-yellow-300" /> 4.9★ Rated Salon</span>
          </div>
        </div>

        {/* Quick Category Filter Bar Container — Integrated directly inside/below the Hero Card */}
        <div ref={galleryGridRef} className="relative z-10 w-full container mx-auto max-w-6xl mt-10 pt-4 border-t border-white/15">
          <GalleryFilters
            counts={counts}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>
      </section>

      {/* Main Gallery Container */}
      <div className="container mx-auto max-w-7xl px-4 pt-8 pb-28 sm:pb-24">
        <section className="glass-panel rounded-2xl sm:rounded-3xl p-3 sm:p-6 lg:p-10">
          {filtered.length === 0 ? (
            loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-10 h-10 animate-spin text-primary" aria-hidden="true" />
                <span className="sr-only">Loading gallery</span>
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="text-6xl mb-4" aria-hidden="true">🎨</div>
                <h3 className="text-xl font-semibold mb-2">Gallery Coming Soon</h3>
                <p className="text-muted-foreground">We're uploading beautiful work — check back soon!</p>
              </div>
            )
          ) : (
            <>
              <p
                className="mb-5 text-center text-sm text-muted-foreground"
                aria-live="polite"
              >
                Showing <span className="font-semibold text-foreground">{visible.length}</span>
                {' of '}
                <span className="font-semibold text-foreground">{filtered.length}</span>
                {' '}{categoryLabel}design{filtered.length === 1 ? '' : 's'}
              </p>

              <GalleryGrid
                items={visible}
                remaining={remaining}
                animationKey={selectedCategory}
                onOpen={openLightbox}
                onLoadMore={loadMore}
              />

              {loading && (
                <p className="mt-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Loading our latest work…
                </p>
              )}
            </>
          )}
        </section>

        {/* Bottom CTA */}
        <div className="mt-16 sm:mt-20 text-center glass-card p-6 sm:p-12 rounded-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Book Your Nail Art Appointment</h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Love our work? Book at our luxury nail salon and let our professional nail artists create your dream look
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/book')}
            className="bg-gradient-to-r from-primary to-accent text-white px-10 h-14 text-base font-semibold"
          >
            💅 Book My Appointment
          </Button>
        </div>
      </div>

      {lightboxItem && lightboxIndex !== null && (
        <GalleryLightbox
          item={lightboxItem}
          index={lightboxIndex}
          total={filtered.length}
          onClose={closeLightbox}
          onNext={showNext}
          onPrevious={showPrevious}
          onBook={() => navigate('/book')}
          onViewService={() => navigate('/services')}
        />
      )}
    </div>
  );
}

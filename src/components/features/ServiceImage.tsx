import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Gem, 
  Palette, 
  Flower2, 
  Crown, 
  Leaf, 
  Heart, 
  Eye,
  CheckCircle2
} from 'lucide-react';

export type ServiceCategoryKey = 'basic' | 'premium' | 'art' | 'bridal' | 'mehndi' | 'beauty' | 'spa' | string;

export interface ServiceImageProps {
  /** The high-resolution image URL to load dynamically. */
  src?: string | null;
  /** Accessible image description. */
  alt: string;
  /** Service category key to customize the fallback design, icons, and tints. */
  category?: ServiceCategoryKey;
  /** Aspect ratio preset to maintain consistent geometry across grids. Default is '16:9'. */
  aspectRatio?: '16:9' | '4:3' | '1:1' | '16:10';
  /** Optional custom CSS classes for the outer container. */
  className?: string;
  /** Optional custom CSS classes for the <img> tag. */
  imgClassName?: string;
  /** Whether to zoom the image slightly on parent group hover. Default is true. */
  zoomOnHover?: boolean;
  /** Whether this is an above-the-fold high-priority image (disables lazy loading). */
  priority?: boolean;
  /** Badges or tags to overlay on top (e.g. Premium, Home Service, Duration). */
  children?: React.ReactNode;
  /** Fallback image URL if primary fails (defaults to category placeholder). */
  fallbackSrc?: string;
  /** Optional service title to display as an elegant watermark on the placeholder. */
  serviceTitle?: string;
}

interface CategoryStyleConfig {
  icon: React.ElementType;
  title: string;
  gradient: string;
  accentColor: string;
  textColor: string;
  iconBg: string;
}

const CATEGORY_CONFIGS: Record<string, CategoryStyleConfig> = {
  basic: {
    icon: Heart,
    title: 'Basic Nail Care',
    gradient: 'from-pink-100/90 via-rose-50 to-pink-200/40',
    accentColor: 'text-pink-600',
    textColor: 'text-pink-900',
    iconBg: 'bg-pink-100 text-pink-600 border-pink-200',
  },
  premium: {
    icon: Gem,
    title: 'Premium Gel & Extensions',
    gradient: 'from-purple-100/90 via-fuchsia-50 to-pink-200/50',
    accentColor: 'text-purple-600',
    textColor: 'text-purple-900',
    iconBg: 'bg-purple-100 text-purple-600 border-purple-200',
  },
  art: {
    icon: Palette,
    title: 'Bespoke Nail Art',
    gradient: 'from-amber-100/90 via-orange-50 to-rose-200/50',
    accentColor: 'text-orange-600',
    textColor: 'text-orange-950',
    iconBg: 'bg-orange-100 text-orange-600 border-orange-200',
  },
  mehndi: {
    icon: Flower2,
    title: 'Organic Henna Art',
    gradient: 'from-emerald-100/90 via-teal-50 to-green-200/50',
    accentColor: 'text-emerald-700',
    textColor: 'text-emerald-950',
    iconBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  bridal: {
    icon: Crown,
    title: 'Royal Bridal Studio',
    gradient: 'from-amber-100/90 via-rose-50 to-yellow-200/60',
    accentColor: 'text-amber-700',
    textColor: 'text-amber-950',
    iconBg: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  beauty: {
    icon: Sparkles,
    title: 'Beauty Parlour Care',
    gradient: 'from-rose-100/90 via-pink-50 to-orange-100/60',
    accentColor: 'text-rose-600',
    textColor: 'text-rose-950',
    iconBg: 'bg-rose-100 text-rose-600 border-rose-200',
  },
  spa: {
    icon: Leaf,
    title: 'Wellness Sanctuary Spa',
    gradient: 'from-teal-100/90 via-cyan-50 to-emerald-100/50',
    accentColor: 'text-teal-700',
    textColor: 'text-teal-950',
    iconBg: 'bg-teal-100 text-teal-700 border-teal-200',
  },
};

const ASPECT_RATIO_CLASSES = {
  '16:9': 'aspect-[16/9]',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
  '16:10': 'aspect-[16/10]',
};

/**
 * ServiceImage
 *
 * A production-grade image wrapper for services that:
 * 1. Enforces consistent, shift-free aspect ratio.
 * 2. Provides an elegant, luxury category-themed placeholder with subtle shimmers.
 * 3. Gracefully transitions in dynamically loaded high-res images.
 * 4. Never breaks if the network fails or if the image URL is not yet populated.
 */
export function ServiceImage({
  src,
  alt,
  category = 'basic',
  aspectRatio = '16:9',
  className = '',
  imgClassName = '',
  zoomOnHover = true,
  priority = false,
  children,
  fallbackSrc,
  serviceTitle,
}: ServiceImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [activeSrc, setActiveSrc] = useState<string | null>(src || null);

  // Normalize category key
  const catKey = (category || 'basic').toLowerCase().trim();
  const config = CATEGORY_CONFIGS[catKey] || CATEGORY_CONFIGS.basic;
  const CategoryIcon = config.icon;

  // React to dynamic src prop changes
  useEffect(() => {
    if (src) {
      setActiveSrc(src);
      setIsLoaded(false);
      setHasError(false);
    } else {
      setActiveSrc(null);
      setIsLoaded(false);
      setHasError(false);
    }
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    if (fallbackSrc && activeSrc !== fallbackSrc) {
      setActiveSrc(fallbackSrc);
    } else {
      setHasError(true);
      setIsLoaded(true);
    }
  };

  const showPlaceholder = !activeSrc || hasError || !isLoaded;

  return (
    <div
      className={`relative w-full overflow-hidden select-none bg-muted/40 ${ASPECT_RATIO_CLASSES[aspectRatio]} ${className}`}
    >
      {/* ── 1. Luxury Category-Themed Placeholder & Skeleton ──────────── */}
      {showPlaceholder && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br ${config.gradient} transition-opacity duration-500`}
        >
          {/* Subtle geometric pattern ring in the background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-48 h-48 rounded-full border border-current scale-125" />
            <div className="w-32 h-32 rounded-full border border-dashed border-current scale-110" />
          </div>

          {/* Shimmer loading wave when an image URL is pending */}
          {activeSrc && !hasError && !isLoaded && (
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          )}

          {/* Category Icon & Branding */}
          <div
            className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border mb-2.5 transition-transform duration-300 ${config.iconBg} ${
              zoomOnHover ? 'group-hover:scale-110' : ''
            }`}
          >
            <CategoryIcon className="w-6 h-6" />
          </div>

          <div className="relative z-10 space-y-0.5 max-w-[85%]">
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">
              LuxeNails by Uma
            </p>
            <p className={`text-sm font-semibold tracking-tight ${config.textColor} line-clamp-1`}>
              {serviceTitle || config.title}
            </p>
          </div>

          <div className="absolute bottom-2.5 left-0 right-0 text-center">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground/70">
              <Sparkles className="w-2.5 h-2.5 text-primary/70" />
              High-Definition Luxury Service
            </span>
          </div>
        </div>
      )}

      {/* ── 2. Dynamically Loaded High-Resolution Image ───────────────── */}
      {activeSrc && !hasError && (
        <img
          src={activeSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={handleLoad}
          onError={handleError}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
            zoomOnHover ? 'group-hover:scale-105' : ''
          } ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} ${imgClassName}`}
        />
      )}

      {/* ── 3. Subtle Bottom Vignette for Text Legibility ─────────────── */}
      <div
        className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-70"
        aria-hidden="true"
      />

      {/* ── 4. Badges & Overlay Slot ─────────────────────────────────── */}
      {children && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * ServiceImagePlaceholder
 *
 * Standalone pure presentation placeholder for service category visuals
 * when an image file is not yet assigned.
 */
export function ServiceImagePlaceholder({
  category = 'basic',
  aspectRatio = '16:9',
  className = '',
  serviceTitle,
}: {
  category?: ServiceCategoryKey;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '16:10';
  className?: string;
  serviceTitle?: string;
}) {
  return (
    <ServiceImage
      src={null}
      alt={serviceTitle || 'Service Preview'}
      category={category}
      aspectRatio={aspectRatio}
      className={className}
      serviceTitle={serviceTitle}
    />
  );
}

export default ServiceImage;

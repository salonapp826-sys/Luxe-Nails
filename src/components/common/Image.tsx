import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { ImageOff, RefreshCw } from 'lucide-react';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** The source URL of the image to load */
  src?: string | null;
  /** Accessible text description */
  alt: string;
  /** Custom CSS classes for the outer wrapper container */
  containerClassName?: string;
  /** Custom CSS classes for the <img> element */
  className?: string;
  /** Fallback image URL if the main src fails to load */
  fallbackSrc?: string;
  /** Low-resolution placeholder image URL or data URI */
  placeholderSrc?: string;
  /** Desired aspect ratio preset or CSS ratio (e.g. '16:9', '4:3', '1:1', '16:10') */
  aspectRatio?: '16:9' | '4:3' | '1:1' | '16:10' | 'auto';
  /** Margin around the root bounding box for pre-loading before entering viewport (default: '200px') */
  rootMargin?: string;
  /** Threshold at which intersection is triggered (default: 0.01) */
  threshold?: number | number[];
  /** If true, bypasses intersection observer and loads immediately with eager loading */
  priority?: boolean;
  /** Enable smooth zoom scale animation on hover */
  zoomOnHover?: boolean;
  /** Show interactive retry UI on fatal load error (default: true) */
  showErrorFallback?: boolean;
  /** Overlay elements (badges, gradient vignettes, captions) rendered inside the image container */
  children?: React.ReactNode;
}

const ASPECT_RATIO_CLASSES: Record<string, string> = {
  '16:9': 'aspect-[16/9]',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
  '16:10': 'aspect-[16/10]',
  'auto': '',
};

/**
 * Custom Image Component
 *
 * - Leverages IntersectionObserver for true lazy-loading
 * - Applies 'shimmer-bg' effect during pending and loading states
 * - Smooth fade-in crossfade when asset is decoded
 * - Built-in fallback resilience and error recovery
 */
export const Image = forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      containerClassName = '',
      className = '',
      fallbackSrc,
      placeholderSrc,
      aspectRatio = 'auto',
      rootMargin = '200px',
      threshold = 0.01,
      priority = false,
      zoomOnHover = false,
      showErrorFallback = true,
      children,
      onLoad,
      onError,
      style,
      ...restProps
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState<boolean>(priority);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);
    const [activeSrc, setActiveSrc] = useState<string | null>(priority ? (src || null) : null);
    const [retryCount, setRetryCount] = useState<number>(0);

    // 1. Intersection Observer for viewport detection
    useEffect(() => {
      if (priority || isInView) return;

      if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        setIsInView(true);
        return;
      }

      const currentElement = containerRef.current;
      if (!currentElement) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry && (entry.isIntersecting || entry.intersectionRatio > 0)) {
            setIsInView(true);
            observer.unobserve(currentElement);
            observer.disconnect();
          }
        },
        {
          root: null,
          rootMargin,
          threshold,
        }
      );

      observer.observe(currentElement);

      return () => {
        observer.disconnect();
      };
    }, [priority, isInView, rootMargin, threshold]);

    // 2. Assign active src once brought into view
    useEffect(() => {
      if (isInView && src) {
        setActiveSrc(src);
        setIsLoaded(false);
        setHasError(false);
      } else if (!src) {
        setActiveSrc(null);
        setIsLoaded(false);
        setHasError(false);
      }
    }, [isInView, src, retryCount]);

    // 3. Image event handlers
    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoaded(true);
      setHasError(false);
      if (onLoad) {
        onLoad(e);
      }
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (fallbackSrc && activeSrc !== fallbackSrc) {
        setActiveSrc(fallbackSrc);
      } else {
        setHasError(true);
        setIsLoaded(true);
        if (onError) {
          onError(e);
        }
      }
    };

    const handleRetry = (e: React.MouseEvent) => {
      e.stopPropagation();
      setHasError(false);
      setIsLoaded(false);
      setRetryCount((prev) => prev + 1);
    };

    const ratioClass = ASPECT_RATIO_CLASSES[aspectRatio] || '';
    const isPending = !isLoaded && !hasError;

    return (
      <div
        ref={containerRef}
        className={`relative overflow-hidden ${ratioClass} ${
          isPending ? 'shimmer-bg' : 'bg-muted/30'
        } ${containerClassName}`}
      >
        {/* Low-resolution blurred placeholder thumbnail */}
        {placeholderSrc && !isLoaded && !hasError && (
          <img
            src={placeholderSrc}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover filter blur-md scale-105 opacity-80 pointer-events-none"
          />
        )}

        {/* Shimmer skeleton overlay during pending/loading state */}
        {isPending && (
          <div
            className="absolute inset-0 shimmer-bg pointer-events-none z-0"
            aria-hidden="true"
          />
        )}

        {/* Primary Image */}
        {isInView && activeSrc && !hasError && (
          <img
            ref={ref}
            src={activeSrc}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`w-full h-full object-cover transition-all duration-500 ease-out ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'
            } ${zoomOnHover ? 'hover:scale-105' : ''} ${className}`}
            style={style}
            {...restProps}
          />
        )}

        {/* Error Fallback View */}
        {hasError && showErrorFallback && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-slate-100/90 dark:bg-slate-800/90 text-slate-500 select-none z-10">
            <ImageOff className="w-7 h-7 mb-1.5 opacity-60 text-slate-400" />
            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 line-clamp-1">
              {alt || 'Image unavailable'}
            </p>
            <button
              onClick={handleRetry}
              type="button"
              className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              Retry
            </button>
          </div>
        )}

        {/* Overlay Slots & Children */}
        {children && (
          <div className="absolute inset-0 pointer-events-none z-20">
            {children}
          </div>
        )}
      </div>
    );
  }
);

Image.displayName = 'Image';

export default Image;

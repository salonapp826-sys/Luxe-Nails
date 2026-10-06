import { useState } from 'react';
import { Expand } from 'lucide-react';
import type { GalleryItem } from '@/constants/galleryItems';
import { getCategory, serviceNameFor } from '@/lib/gallery';
import { Image } from '@/components/common/Image';

interface GalleryCardProps {
  item: GalleryItem;
  /** Position in the current grid — drives the entrance stagger. */
  index: number;
  /** Above-the-fold cards load eagerly; everything else is lazy. */
  eager: boolean;
  onOpen: () => void;
}

/**
 * A single portfolio card.
 *
 * Interaction model:
 *  - Desktop (md+): hover lifts the card, zooms the photo to 1.05 (clipped
 *    by .image-card so it never bleeds into a neighbouring column), deepens
 *    a soft shadow and fades in the caption overlay + expand icon.
 *  - Touch: nothing is hidden behind hover — the caption is always visible
 *    and the whole card is one big tappable button.
 * Transitions are short and easing-based; no bounce, no aggressive motion.
 */
export function GalleryCard({ item, index, eager, onOpen }: GalleryCardProps) {
  const catInfo = getCategory(item.category);
  const serviceName = serviceNameFor(item);

  return (
    /* Wrapper owns the entrance animation; the button owns the hover
       transform. Keeping them on separate elements matters — an animation
       with fill-mode "both" would otherwise win the cascade and cancel the
       hover lift. */
    <div
      className="gallery-item break-inside-avoid mb-3 sm:mb-4"
      style={{ animationDelay: `${Math.min(index, 9) * 45}ms` }}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`View ${item.title} — ${serviceName}`}
        className="block w-full text-left glass-card rounded-xl overflow-hidden group cursor-pointer shadow-sm transition-[transform,box-shadow] duration-300 ease-out hover:shadow-[0_16px_36px_-18px_rgba(190,120,150,0.55)] md:hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {/* .image-card owns the 1.05 zoom + overflow clipping (index.css) */}
        <div className="image-card relative overflow-hidden">
          <Image
            src={item.thumb || item.image}
            alt={item.alt}
            priority={eager}
            width={item.width}
            height={item.height}
            className="w-full object-cover"
            containerClassName="w-full"
            style={{ aspectRatio: `${item.width} / ${item.height}` }}
          />

          {/* Caption overlay — always on for touch, hover-revealed on desktop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
              {/* Which service this design belongs to */}
              <p className="text-xs text-white/90 mt-1">{serviceName}</p>
              <p className="text-xs text-white/80 mt-1 line-clamp-2 hidden sm:block">
                {item.description}
              </p>
            </div>
          </div>

          {/* Expand affordance — desktop hover only, the whole card is tappable */}
          <div className="absolute top-3 right-3 hidden md:flex w-9 h-9 rounded-full bg-white/90 text-foreground items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
            <Expand className="w-4 h-4" aria-hidden="true" />
          </div>

          {/* Category badge */}
          <div className="absolute top-3 left-3 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
            <span className="text-xs bg-white/95 text-foreground px-2 py-1 rounded-full font-medium shadow-sm">
              <span aria-hidden="true">{catInfo?.emoji}</span> {catInfo?.label}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}

export default GalleryCard;

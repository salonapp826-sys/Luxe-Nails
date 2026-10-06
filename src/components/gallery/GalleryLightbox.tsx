import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GalleryItem } from '@/constants/galleryItems';
import { getCategory, serviceNameFor } from '@/lib/gallery';

interface GalleryLightboxProps {
  item: GalleryItem;
  /** 0-based position within the filtered set. */
  index: number;
  total: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onBook: () => void;
  onViewService: () => void;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * openLightbox — the enlarged photo view.
 *
 * Accessibility contract:
 *  - role="dialog" + aria-modal, labelled by the photo title
 *  - focus moves into the dialog on open and is restored to the card that
 *    opened it on close
 *  - Tab is trapped inside the dialog
 *  - Escape closes; arrow keys move between photos (owned by the page, which
 *    also holds the single keydown listener)
 *  - every icon-only control has an aria-label and a 44px touch target
 */
export function GalleryLightbox({
  item,
  index,
  total,
  onClose,
  onNext,
  onPrevious,
  onBook,
  onViewService,
}: GalleryLightboxProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const [failed, setFailed] = useState(false);

  // Reset the error state when moving to another photo.
  useEffect(() => setFailed(false), [item.id]);

  /**
   * Move focus in on open, and hand it back to the triggering card on close.
   * Runs once per open because the component only mounts while open.
   */
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    return () => {
      if (trigger && typeof trigger.focus === 'function') trigger.focus();
    };
  }, []);

  /** Keep Tab inside the dialog. */
  const trapFocus = useCallback((event: React.KeyboardEvent) => {
    if (event.key !== 'Tab' || !dialogRef.current) return;

    const nodes = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (nodes.length === 0) return;

    const first = nodes[0];
    const last = nodes[nodes.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  const category = getCategory(item.category);
  const serviceName = serviceNameFor(item);

  return (
    <div
      /* z-[60] deliberately sits above the floating WhatsApp button (z-50)
         so the overlay covers it and swallows its clicks while open. */
      className="fixed inset-0 z-[60] bg-black/90 flex items-start sm:items-center justify-center overflow-y-auto px-3 pt-16 pb-8 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title} — enlarged view`}
      onKeyDown={trapFocus}
    >
      <div
        ref={dialogRef}
        className="relative max-w-3xl w-full my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close photo viewer"
          className="absolute -top-12 right-0 h-11 min-w-11 px-3 -mr-1 text-white/90 hover:text-white text-sm font-medium flex items-center justify-center gap-1.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="w-5 h-5" aria-hidden="true" />
          <span className="hidden sm:inline">Close</span>
        </button>

        {failed ? (
          <div className="w-full aspect-[4/3] rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-3 text-white/80 px-6 text-center">
            <ImageOff className="w-9 h-9" aria-hidden="true" />
            <p className="font-medium">{item.title}</p>
            <p className="text-sm text-white/70">
              This photo couldn't be loaded. Please try another design.
            </p>
          </div>
        ) : (
          <img
            src={item.image}
            alt={item.alt}
            onError={() => setFailed(true)}
            className="w-full rounded-2xl max-h-[58vh] sm:max-h-[70vh] object-contain bg-black/40"
          />
        )}

        {/* Previous / next — 44px targets so they stay comfortably tappable */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={onPrevious}
              aria-label="Previous photo"
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Next photo"
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </>
        )}

        <div className="mt-4 text-center">
          <p className="text-white font-semibold text-lg">{item.title}</p>
          <p className="text-white/80 text-sm mt-2 max-w-xl mx-auto">{item.description}</p>

          {/* Service connection — which service produces this design */}
          <p className="mt-3 text-sm text-white/80">
            Service:{' '}
            <button
              type="button"
              onClick={onViewService}
              className="text-white font-medium underline underline-offset-4 decoration-white/50 hover:decoration-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
            >
              {serviceName}
            </button>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <span className="inline-block text-xs bg-white/15 text-white/90 px-3 py-1 rounded-full">
              <span aria-hidden="true">{category?.emoji}</span>{' '}
              {category?.label ?? item.category}
            </span>
            <Button
              size="sm"
              onClick={onBook}
              className="bg-gradient-to-r from-primary to-accent text-white"
            >
              Book {serviceName}
            </Button>
          </div>

          {total > 1 && (
            <p className="text-white/70 text-xs mt-4" aria-live="polite">
              {index + 1} of {total}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default GalleryLightbox;

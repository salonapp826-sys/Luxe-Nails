import { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { GALLERY_CATEGORIES } from '@/constants/galleryItems';

interface GalleryFiltersProps {
  /** Photo count per category id — see updateCounts/countByCategory. */
  counts: Record<string, number>;
  selected: string;
  onSelect: (categoryId: string) => void;
}

/**
 * renderFilters — the category filter control.
 *
 * Mobile: an edge-to-edge horizontal scroll strip with snap points, so the
 * buttons keep their full touch-friendly size and can never overflow the
 * viewport. sm+: a centred wrapping row.
 *
 * Accessibility: real <button>s with aria-pressed, a visible focus ring, and
 * a check icon on the active item so selection is not signalled by colour
 * alone. The active pill is scrolled into view whenever it changes.
 */
export function GalleryFilters({ counts, selected, onSelect }: GalleryFiltersProps) {
  const activePillRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const pill = activePillRef.current;
    if (pill && typeof pill.scrollIntoView === 'function') {
      pill.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
  }, [selected]);

  return (
    <div className="-mx-3 px-3 sm:mx-0 sm:px-0 mb-6 sm:mb-10 overflow-x-auto sm:overflow-visible scrollbar-hide [scroll-padding-inline:0.75rem]">
      <div
        className="flex w-max sm:w-auto gap-2 sm:gap-3 sm:flex-wrap sm:justify-center snap-x snap-mandatory"
        role="group"
        aria-label="Filter gallery by category"
      >
        {GALLERY_CATEGORIES.map((cat) => {
          // Counts decide which pills are worth showing, but aren't displayed
          // on the pill itself — the running total lives above the grid.
          const count = counts[cat.id] || 0;
          const active = selected === cat.id;
          if (cat.id !== 'all' && count === 0) return null;

          return (
            <button
              key={cat.id}
              ref={active ? activePillRef : undefined}
              type="button"
              onClick={() => onSelect(cat.id)}
              aria-pressed={active}
              className={`inline-flex shrink-0 snap-start items-center gap-2 h-11 px-5 sm:px-6 rounded-full text-sm font-semibold whitespace-nowrap transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                active
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/25'
                  : 'bg-white border border-border text-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5'
              }`}
            >
              <span aria-hidden="true" className="text-base leading-none">{cat.emoji}</span>
              {cat.label}
              {/* Non-colour cue for the active filter (WCAG 1.4.1) */}
              {active && <Check className="w-4 h-4 shrink-0" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default GalleryFilters;

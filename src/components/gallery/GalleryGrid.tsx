import { Button } from '@/components/ui/button';
import type { GalleryItem } from '@/constants/galleryItems';
import { GalleryCard } from './GalleryCard';

interface GalleryGridProps {
  /** The slice currently mounted. */
  items: GalleryItem[];
  /** How many remain unmounted behind "Load More". */
  remaining: number;
  /** Changes with the filter so cards remount and replay their entrance. */
  animationKey: string;
  onOpen: (index: number) => void;
  onLoadMore: () => void;
}

/** Number of leading cards treated as above-the-fold (loaded eagerly). */
const EAGER_COUNT = 4;

/**
 * renderGallery — the masonry grid plus its "Load More" control.
 *
 * A CSS multi-column layout is used rather than a JS-driven masonry or a
 * carousel: it reflows natively at every breakpoint and needs no JavaScript.
 */
export function GalleryGrid({
  items,
  remaining,
  animationKey,
  onOpen,
  onLoadMore,
}: GalleryGridProps) {
  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 sm:gap-4">
        {items.map((item, index) => (
          <GalleryCard
            key={`${animationKey}-${item.id}`}
            item={item}
            index={index}
            eager={index < EAGER_COUNT}
            onOpen={() => onOpen(index)}
          />
        ))}
      </div>

      {/* Progressive rendering — only the first batch is mounted, so a large
          gallery never renders hundreds of images at once. */}
      {remaining > 0 && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={onLoadMore}
            className="h-12 px-8 rounded-full border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
          >
            Load More Designs
            <span className="ml-2 text-muted-foreground">({remaining} more)</span>
          </Button>
        </div>
      )}
    </>
  );
}

export default GalleryGrid;

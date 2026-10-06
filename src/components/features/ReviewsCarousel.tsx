import React, { useState, useEffect, useCallback } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { ReviewCard } from '@/components/features/ReviewCard';
import { Button } from '@/components/ui/button';
import { Play, Pause, ChevronLeft, ChevronRight, Sparkles, MoveHorizontal } from 'lucide-react';

export interface Review {
  id: string;
  customer_name: string;
  service_name: string | null;
  rating: number;
  review_text: string;
  photo_url: string | null;
  created_at: string;
}

interface ReviewsCarouselProps {
  reviews: Review[];
  autoPlayInterval?: number;
}

export function ReviewsCarousel({ reviews, autoPlayInterval = 4000 }: ReviewsCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Synchronize carousel state with Embla API
  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap() + 1);
    };

    api.on('select', onSelect);
    api.on('reInit', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  // Autoplay functionality
  useEffect(() => {
    if (!api || !isPlaying || count <= 1) return;

    const timer = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [api, isPlaying, count, autoPlayInterval]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full space-y-4">
      {/* Touch swipe gesture hint badge for mobile */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5 font-medium text-rose-600 dark:text-rose-400">
          <MoveHorizontal className="w-3.5 h-3.5 animate-pulse" />
          <span>Swipe or drag to browse</span>
        </span>
        <span className="tabular-nums font-medium text-foreground">
          {current} / {count}
        </span>
      </div>

      {/* Main Touch-Friendly Carousel Container */}
      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          loop: true,
          dragFree: false,
        }}
        className="w-full relative group"
      >
        <CarouselContent className="-ml-3 md:-ml-4">
          {reviews.map((review) => (
            <CarouselItem
              key={review.id}
              className="pl-3 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3 flex"
            >
              <div className="w-full h-full">
                <ReviewCard
                  customerName={review.customer_name}
                  serviceName={review.service_name || undefined}
                  rating={review.rating}
                  reviewText={review.review_text}
                  photoUrl={review.photo_url || undefined}
                  createdAt={review.created_at}
                  className="h-full border border-rose-100 dark:border-rose-950/30 shadow-sm hover:shadow-md transition-all duration-300 bg-card/80 backdrop-blur-sm"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Carousel Arrow Controls */}
        <div className="hidden sm:block">
          <CarouselPrevious className="-left-4 lg:-left-5 h-10 w-10 border-rose-200 dark:border-rose-900 bg-background/95 hover:bg-rose-50 dark:hover:bg-rose-950 text-foreground shadow-md transition-all hover:scale-105" />
          <CarouselNext className="-right-4 lg:-right-5 h-10 w-10 border-rose-200 dark:border-rose-900 bg-background/95 hover:bg-rose-50 dark:hover:bg-rose-950 text-foreground shadow-md transition-all hover:scale-105" />
        </div>
      </Carousel>

      {/* Bottom Interactive Pagination & Autoplay Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Mobile Prev / Next quick buttons */}
        <div className="flex sm:hidden items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => api?.scrollPrev()}
            className="h-8 w-8 p-0 rounded-full border-rose-200"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => api?.scrollNext()}
            className="h-8 w-8 p-0 rounded-full border-rose-200"
            aria-label="Next review"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Bullet indicators */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-[200px] sm:max-w-none scrollbar-none">
          {Array.from({ length: count }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => api?.scrollTo(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === idx + 1
                  ? 'w-6 bg-rose-500'
                  : 'w-2 bg-rose-200 hover:bg-rose-300 dark:bg-rose-950 dark:hover:bg-rose-800'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Autoplay toggle button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlay}
          className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          title={isPlaying ? 'Pause Auto-slide' : 'Play Auto-slide'}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 text-rose-500" />
              <span>Auto-playing</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Paused</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
